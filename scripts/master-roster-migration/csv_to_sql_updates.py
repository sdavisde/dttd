#!/usr/bin/env python3
"""
Generate SQL UPDATE statements from a CSV file for any database table.

This script reads a CSV file and generates UPDATE statements for a specified table.
It works with any table - simply ensure CSV column names match database column names.

Usage:
    python csv_to_sql_updates.py <csv_file> <table_name> <id_column> [output_sql]

Arguments:
    csv_file    - Path to the input CSV file (column names must match DB columns)
    table_name  - Name of the table to update (e.g., public.users, public.candidates)
    id_column   - Column name in CSV that maps to the table's primary key (used in WHERE clause)
    output_sql  - Optional output file path (defaults to stdout)

Examples:
    # Update users table
    python csv_to_sql_updates.py users_data.csv public.users id output.sql

    # Update candidates table
    python csv_to_sql_updates.py candidates.csv public.candidates candidate_id output.sql

    # Output to stdout
    python csv_to_sql_updates.py data.csv public.any_table id

Notes:
    - CSV column names must exactly match the database column names
    - Empty values in the CSV are skipped (columns won't be set to empty strings)
    - JSON values (starting with { or [) are automatically parsed and formatted
    - Single quotes in values are escaped for SQL safety
"""

import csv
import sys
import json
from pathlib import Path
from typing import Optional


def is_json_value(value: str) -> bool:
    """Check if a string value looks like JSON."""
    stripped = value.strip()
    return (stripped.startswith("{") and stripped.endswith("}")) or \
           (stripped.startswith("[") and stripped.endswith("]"))


def clean_json_value(value: str) -> Optional[str]:
    """Clean and validate a JSON string value."""
    if not value or value.strip() == "":
        return None

    # The CSV may have escaped quotes like ""key"" - handle this
    cleaned = value.replace('""', '"')

    try:
        parsed = json.loads(cleaned)
        return json.dumps(parsed)
    except json.JSONDecodeError:
        # If it's not valid JSON, return None
        return None


def escape_sql_string(value: str) -> str:
    """Escape single quotes for SQL strings."""
    return value.replace("'", "''")


def format_sql_value(value: str) -> Optional[str]:
    """Format a value for SQL, handling JSON and regular strings."""
    if not value or value.strip() == "":
        return None

    # Check if it's a JSON value
    if is_json_value(value):
        cleaned_json = clean_json_value(value)
        if cleaned_json:
            return f"'{escape_sql_string(cleaned_json)}'"
        return None

    # Regular string value
    return f"'{escape_sql_string(value.strip())}'"


def generate_update_statement(row: dict, table_name: str, id_column: str) -> Optional[str]:
    """
    Generate a SQL UPDATE statement for a single CSV row.

    Args:
        row: Dictionary of column_name -> value from the CSV
        table_name: Fully qualified table name (e.g., public.users)
        id_column: Column name to use in the WHERE clause

    Returns:
        SQL UPDATE statement string, or None if row has no valid data
    """
    # Get the ID value
    id_value = row.get(id_column, "").strip()
    if not id_value:
        return None

    # Build SET clauses for all other columns
    set_clauses = []

    for column, value in row.items():
        # Skip the ID column
        if column == id_column:
            continue

        formatted_value = format_sql_value(value)
        if formatted_value:
            set_clauses.append(f"{column} = {formatted_value}")

    # If no fields to update, skip this row
    if not set_clauses:
        return None

    set_clause = ", ".join(set_clauses)
    return f"UPDATE {table_name} SET {set_clause} WHERE {id_column} = '{escape_sql_string(id_value)}';"


def generate_updates_from_csv(
    input_path: str,
    table_name: str,
    id_column: str,
    output_path: Optional[str] = None
) -> None:
    """
    Read a CSV file and generate SQL UPDATE statements for the specified table.

    Args:
        input_path: Path to the CSV file
        table_name: Fully qualified table name (e.g., public.users, public.candidates)
        id_column: CSV column name to use for matching rows (WHERE clause)
        output_path: Optional file path for output (prints to stdout if not provided)
    """
    input_file = Path(input_path)

    if not input_file.exists():
        print(f"Error: Input file not found: {input_path}", file=sys.stderr)
        sys.exit(1)

    statements = []
    skipped_rows = []

    with open(input_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)

        # Verify the ID column exists
        if reader.fieldnames and id_column not in reader.fieldnames:
            print(f"Error: ID column '{id_column}' not found in CSV", file=sys.stderr)
            print(f"Available columns: {', '.join(reader.fieldnames)}", file=sys.stderr)
            sys.exit(1)

        for row_num, row in enumerate(reader, start=2):
            statement = generate_update_statement(row, table_name, id_column)
            if statement:
                statements.append(statement)
            else:
                skipped_rows.append(row_num)

    # Generate output
    output_content = f"""-- SQL UPDATE statements for {table_name}
-- Generated from: {input_file.name}
-- ID column: {id_column}
-- Total statements: {len(statements)}

"""
    output_content += "\n\n".join(statements)
    output_content += "\n"

    if output_path:
        output_file = Path(output_path)
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(output_content)
        print(f"Generated {len(statements)} UPDATE statements to: {output_path}")
    else:
        print(output_content)

    if skipped_rows:
        print(f"Skipped {len(skipped_rows)} rows with no valid data: {skipped_rows[:10]}{'...' if len(skipped_rows) > 10 else ''}", file=sys.stderr)


def main():
    if len(sys.argv) < 4:
        print(__doc__)
        sys.exit(1)

    input_csv = sys.argv[1]
    table_name = sys.argv[2]
    id_column = sys.argv[3]
    output_sql = sys.argv[4] if len(sys.argv) > 4 else None

    generate_updates_from_csv(input_csv, table_name, id_column, output_sql)


if __name__ == "__main__":
    main()
