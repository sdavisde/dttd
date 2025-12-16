#!/usr/bin/env python3
"""
Phase 1: Match user names from old-master-roster.csv to existing user IDs.

Usage:
    python scripts/match_user_ids.py

Input files (expected in project root):
    - old-master-roster.csv: The legacy roster data
    - existing_users.csv: Export from Supabase with columns: id, first_name, last_name

Output files (written to project root):
    - roster_with_ids.csv: Original data plus user_id and match_status columns
    - unmatched_users.txt: List of users that couldn't be matched (for manual review)
"""

import csv
import re
from pathlib import Path


def normalize_name(name: str) -> str:
    """Normalize a name for matching: lowercase, strip whitespace, remove special chars."""
    if not name:
        return ""
    # Remove quotes, parenthetical nicknames, and extra whitespace
    name = re.sub(r"['\"]", "", name)  # Remove quotes
    name = re.sub(r"\([^)]*\)", "", name)  # Remove parenthetical nicknames like (Nikki)
    name = name.lower().strip()
    return name


def load_existing_users(filepath: Path) -> dict:
    """
    Load existing users from Supabase export CSV.
    Returns a dict mapping (first_name_normalized, last_name_normalized) -> list of user records
    """
    users_by_name = {}

    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            first_name = normalize_name(row.get("first_name", ""))
            last_name = normalize_name(row.get("last_name", ""))

            if not first_name or not last_name:
                continue

            key = (first_name, last_name)
            if key not in users_by_name:
                users_by_name[key] = []
            users_by_name[key].append({
                "id": row.get("id", ""),
                "first_name": row.get("first_name", ""),
                "last_name": row.get("last_name", ""),
            })

    return users_by_name


def match_user(first_name: str, last_name: str, existing_users: dict) -> tuple:
    """
    Try to match a user by name.
    Returns (user_id, match_status) where match_status is one of:
        - "matched": Single match found
        - "multiple_matches": Multiple users with same name
        - "no_match": No user found with that name
    """
    first_normalized = normalize_name(first_name)
    last_normalized = normalize_name(last_name)

    if not first_normalized or not last_normalized:
        return ("", "no_match")

    key = (first_normalized, last_normalized)
    matches = existing_users.get(key, [])

    if len(matches) == 0:
        return ("", "no_match")
    elif len(matches) == 1:
        return (matches[0]["id"], "matched")
    else:
        # Multiple matches - return first but flag as multiple
        return (matches[0]["id"], "multiple_matches")


def process_roster(roster_path: Path, existing_users_path: Path, output_path: Path, unmatched_path: Path):
    """Process the roster CSV and add user_id matching."""

    # Load existing users
    print(f"Loading existing users from {existing_users_path}...")
    existing_users = load_existing_users(existing_users_path)
    print(f"Loaded {sum(len(v) for v in existing_users.values())} users with {len(existing_users)} unique name combinations")

    # Process roster
    print(f"Processing roster from {roster_path}...")

    matched_count = 0
    multiple_match_count = 0
    no_match_count = 0
    unmatched_users = []

    with open(roster_path, "r", encoding="utf-8") as infile:
        reader = csv.DictReader(infile)
        fieldnames = list(reader.fieldnames or []) + ["user_id", "match_status"]

        with open(output_path, "w", encoding="utf-8", newline="") as outfile:
            writer = csv.DictWriter(outfile, fieldnames=fieldnames)
            writer.writeheader()

            for row in reader:
                first_name = row.get("Name", "")
                last_name = row.get("Last Name", "")

                user_id, match_status = match_user(first_name, last_name, existing_users)

                row["user_id"] = user_id
                row["match_status"] = match_status
                writer.writerow(row)

                if match_status == "matched":
                    matched_count += 1
                elif match_status == "multiple_matches":
                    multiple_match_count += 1
                    unmatched_users.append(f"MULTIPLE: {first_name} {last_name}")
                else:
                    no_match_count += 1
                    unmatched_users.append(f"NO MATCH: {first_name} {last_name}")

    # Write unmatched users report
    with open(unmatched_path, "w", encoding="utf-8") as f:
        f.write("Users requiring manual review:\n")
        f.write("=" * 50 + "\n\n")
        for user in sorted(unmatched_users):
            f.write(f"{user}\n")

    # Print summary
    print("\n" + "=" * 50)
    print("MATCHING SUMMARY")
    print("=" * 50)
    print(f"Total rows processed: {matched_count + multiple_match_count + no_match_count}")
    print(f"  Matched:            {matched_count}")
    print(f"  Multiple matches:   {multiple_match_count}")
    print(f"  No match:           {no_match_count}")
    print(f"\nOutput written to: {output_path}")
    print(f"Unmatched users written to: {unmatched_path}")


def main():
    # Define paths
    project_root = Path(__file__).parent.parent
    roster_path = project_root / "old-master-roster-mens.csv"
    existing_users_path = project_root / "existing_users.csv"
    output_path = project_root / "roster_with_ids.csv"
    unmatched_path = project_root / "unmatched_users.txt"

    # Check input files exist
    if not roster_path.exists():
        print(f"ERROR: Roster file not found: {roster_path}")
        return 1

    if not existing_users_path.exists():
        print(f"ERROR: Existing users file not found: {existing_users_path}")
        print("\nPlease export users from Supabase with columns: id, first_name, last_name")
        print(f"Save as: {existing_users_path}")
        return 1

    process_roster(roster_path, existing_users_path, output_path, unmatched_path)
    return 0


if __name__ == "__main__":
    exit(main())
