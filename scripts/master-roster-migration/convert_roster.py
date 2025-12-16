#!/usr/bin/env python3
"""
Phase 2: Convert roster_with_ids.csv into Supabase import CSVs.

Usage:
    python scripts/convert_roster.py <roster_with_ids_file>

Example:
    python scripts/convert_roster.py roster_with_ids-women.csv
    python scripts/convert_roster.py roster_with_ids-mens.csv

Input:
    - roster_with_ids.csv (or specified file): Output from Phase 1 with user_id column

Output:
    - users_update_<suffix>.csv: User profile updates
    - users_experience_<suffix>.csv: Service experience records
    - unmatched_roles_<suffix>.txt: Roles that couldn't be mapped
    - conversion_stats_<suffix>.txt: Processing summary
"""

import csv
import json
import re
import sys
from pathlib import Path
from typing import Optional


# =============================================================================
# ROLE MAPPING
# =============================================================================

ROLE_MAPPING = {
    # Direct matches (case-insensitive)
    "rector": "Rector",
    "head": "Head",
    "assistant head": "Assistant Head",
    "backup rector": "Backup Rector",
    "head tech": "Head Tech",
    "tech": "Tech",
    "head rollista": "Head Rollista",
    "table leader": "Table Leader",
    "head spiritual director": "Head Spiritual Director",
    "spiritual director": "Spiritual Director",
    "spiritual director trainee": "Spiritual Director Trainee",
    "head prayer": "Head Prayer",
    "prayer": "Prayer",
    "head chapel": "Head Chapel",
    "chapel": "Chapel",
    "head chapel tech": "Head Chapel Tech",
    "head music": "Head Music",
    "music": "Music",
    "head palanca": "Head Palanca",
    "palanca": "Palanca",
    "head table": "Head Table",
    "table": "Table",
    "head dorm": "Head Dorm",
    "dorm": "Dorm",
    "head dining": "Head Dining",
    "dining": "Dining",
    "head mobile": "Head Mobile",
    "mobile": "Mobile",
    "escort": "Escort",
    "floater": "Floater",
    "head floater": "Floater",
    "meat": "Meat",
    "roster": "Roster",
    "gopher": "Gopher",
    "medic": "Medic",
    "smoker": "Smoker",
    "rover": "Rover",

    # Abbreviations and variations
    "head cha": "Head",
    "hd cha": "Head",
    "hd. cha": "Head",
    "asst head cha": "Assistant Head",
    "asst hd cha": "Assistant Head",
    "asst hd. cha": "Assistant Head",
    "asst. head cha": "Assistant Head",
    "asst. head": "Assistant Head",
    "ass't. head": "Assistant Head",
    "asst head": "Assistant Head",
    "asst hd": "Assistant Head",
    "bur": "Backup Rector",

    # Spiritual Director variations
    "sd": "Spiritual Director",
    "spiritual dir.": "Spiritual Director",
    "hd spiritual dir": "Head Spiritual Director",
    "hd sd": "Head Spiritual Director",
    "hd. sd": "Head Spiritual Director",
    "head sd": "Head Spiritual Director",

    # Kitchen/Dining variations
    "hd kitchen": "Head Dining",
    "head kitchen": "Head Dining",
    "kitchen": "Dining",
    "hd dining": "Head Dining",

    # Tech variations
    "hd tech": "Head Tech",
    "hd. tech": "Head Tech",
    "video tech": "Tech",
    "sound": "Tech",

    # Music variations
    "hd music": "Head Music",
    "hd. music": "Head Music",

    # Prayer variations
    "hd prayer": "Head Prayer",
    "hd. prayer": "Head Prayer",

    # Palanca variations
    "hd palanca": "Head Palanca",
    "hd. palanca": "Head Palanca",

    # Dorm variations
    "hd dorm": "Head Dorm",
    "hd. dorm": "Head Dorm",

    # Mobile variations
    "hd mobile": "Head Mobile",
    "hd. mobile": "Head Mobile",

    # Rollista variations
    "hd rollista": "Head Rollista",
    "hd. rollista": "Head Rollista",

    # Escort variations
    "head escort": "Escort",

    # Roster variations
    "head roster": "Roster",

    # Silent = Table Leader
    "silent": "Table Leader",
    "table leader (silent)": "Table Leader",

    # Medical
    "nurse": "Medic",
    "meat cha": "Meat",

    # Additional variations found in data
    "asst. hd cha": "Assistant Head",
    "audio": "Tech",
    "chapel tech": "Head Chapel Tech",
    "gofer": "Gopher",  # typo
    "hd chapel": "Head Chapel",
    "hd escort": "Escort",
    "hd table": "Head Table",
    "lead tech": "Head Tech",
    "sd in training": "Spiritual Director Trainee",
    "smoker cha": "Smoker",
    "chapel cha": "Chapel",
    "dining cha": "Dining",
    "mentor cha (sd)": "Spiritual Director",
    "mentor cha": "Spiritual Director",
}

# Roles to skip entirely
SKIP_ROLES = {
    "storeroom",
    "head storeroom",
    "outside coordinator",
    "special events",
    "spec events",
    "events coord",
    "fellowship",
    "head fellowship",
    "chapel music",  # Not a standard CHA role
    "chapel sheperd",  # Typo, not a role
    "chapel shepherd",
    "reunion groups",  # Talk name, not a role
    "se",  # Unclear abbreviation
    "envir",  # Needs to be in rollista pattern to work
}

# Patterns for roles that should be skipped (regex)
SKIP_PATTERNS = [
    r"^asst\.?\s*h(?:ea)?d\.?\s+(?!cha\b)",  # asst head X where X is not "cha" (word boundary)
]


# =============================================================================
# ROLLISTA WITH EMBEDDED ROLLO PATTERNS
# =============================================================================

# (pattern to match, rollo name or None if rollo comes from Talk column)
ROLLISTA_PATTERNS = [
    ("study rollista", "Study"),
    ("study rollo", "Study"),
    ("rollista study", "Study"),
    ("piety rollista", "Piety"),
    ("piety rollo", "Piety"),
    ("rollista piety", "Piety"),
    ("leaders rollista", "Leaders"),
    ("leaders rollo", "Leaders"),
    ("rollista leaders", "Leaders"),
    ("church rollista", "Church"),
    ("church rollo", "Church"),
    ("rollista church", "Church"),
    ("rollista - church", "Church"),
    ("action rollista", "Action"),
    ("action rollo", "Action"),
    ("rollista action", "Action"),
    ("ccia rollista", "CCIA"),
    ("ccia rollo", "CCIA"),
    ("ideals rollista", "Ideals"),
    ("ideals rollo", "Ideals"),
    ("environ rollista", "Environments"),
    ("environ rollo", "Environments"),
    ("environ. rollo", "Environments"),
    ("envir rollo", "Environments"),
    ("environments rollo", "Environments"),
    ("rollista environments", "Environments"),
    ("reunion rollista", "Reunion Group"),
    ("reunion rollo", "Reunion Group"),
    ("reunion group rollo", "Reunion Group"),
    ("reunion groups rollo", "Reunion Group"),
    ("rollista reunion", "Reunion Group"),
    ("obstacles rollo", "Obstalces to Grace"),
    ("holy spirit rollo", "Holy Spirit"),
    ("grace rollo", "Grace"),
    ("fourth day rollo", "Fourth Day"),
    ("life in grace rollo", "Life in Grace"),
    ("sacred moments rollo", "Sacred Moments of Grace"),
    # Plain rollista - must be last as it's a catch-all
    ("rollista", None),
]


# =============================================================================
# ROLLO MAPPING
# =============================================================================

ROLLO_MAPPING = {
    "ideals": "Ideals",
    "grace": "Grace",
    "church": "Church",
    "holy spirit": "Holy Spirit",
    "piety": "Piety",
    "study": "Study",
    "sacred moments of grace": "Sacred Moments of Grace",
    "action": "Action",
    "obstacles to grace": "Obstalces to Grace",  # Note: typo in system
    "leaders": "Leaders",
    "environments": "Environments",
    "life in grace": "Life in Grace",
    "ccia": "CCIA",
    "reunion group": "Reunion Group",
    "fourth day": "Fourth Day",
    # Abbreviations
    "obstacles": "Obstalces to Grace",
    "reunion": "Reunion Group",
    "environment": "Environments",
    "environ": "Environments",
    "envir": "Environments",
    "sacred moments": "Sacred Moments of Grace",
}


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def normalize_weekend_reference(ref: str) -> str:
    """Normalize weekend reference: 'DTTD #6' -> 'DTTD#6'"""
    if not ref:
        return ""
    # Remove spaces around #
    ref = re.sub(r"\s*#\s*", "#", ref.strip())
    return ref


def parse_weekend_list(weekend_str: str) -> list[str]:
    """
    Parse weekend served string into list of normalized references.
    'DTTD #1, 2, 3' -> ['DTTD#1', 'DTTD#2', 'DTTD#3']
    'DTTD #1, #2, #3' -> ['DTTD#1', 'DTTD#2', 'DTTD#3']
    """
    if not weekend_str or not weekend_str.strip():
        return []

    weekends = []
    current_community = "DTTD"  # Default community

    parts = [p.strip() for p in weekend_str.split(",")]

    for part in parts:
        part = part.strip()
        if not part:
            continue

        # Check if this part has a community prefix
        match = re.match(r"([A-Z]+)\s*#?\s*(\d+)", part, re.IGNORECASE)
        if match:
            current_community = match.group(1).upper()
            number = match.group(2)
            weekends.append(f"{current_community}#{number}")
        elif re.match(r"#?\s*(\d+)", part):
            # Just a number, use current community
            match = re.search(r"(\d+)", part)
            if match:
                number = match.group(1)
                weekends.append(f"{current_community}#{number}")

    return weekends


def should_skip_role(role: str) -> bool:
    """Check if a role should be skipped."""
    role_lower = role.lower().strip()

    # Check exact matches
    if role_lower in SKIP_ROLES:
        return True

    # Check patterns
    for pattern in SKIP_PATTERNS:
        if re.match(pattern, role_lower):
            return True

    return False


def split_slash_roles(role: str) -> list[str]:
    """Split roles containing slashes into separate roles."""
    if "/" not in role:
        return [role]

    # Split on / and clean up each part
    parts = [p.strip() for p in role.split("/")]
    return [p for p in parts if p]


def extract_role_with_weekend(role: str) -> tuple[str, Optional[str]]:
    """
    Extract weekend reference embedded in role name.
    'Rector DTTD #1' -> ('Rector', 'DTTD#1')
    'Rector #8' -> ('Rector', 'DTTD#8')
    'Prayer' -> ('Prayer', None)
    """
    # Pattern: Role Community #Number
    match = re.match(r"(.+?)\s+([A-Z]+)\s*#\s*(\d+)$", role, re.IGNORECASE)
    if match:
        base_role = match.group(1).strip()
        community = match.group(2).upper()
        number = match.group(3)
        return (base_role, f"{community}#{number}")

    # Pattern: Role #Number (assume DTTD)
    match = re.match(r"(.+?)\s+#\s*(\d+)$", role)
    if match:
        base_role = match.group(1).strip()
        number = match.group(2)
        return (base_role, f"DTTD#{number}")

    return (role, None)


def check_rollista_pattern(role: str) -> tuple[Optional[str], Optional[str]]:
    """
    Check if role matches a rollista pattern with embedded rollo.
    Returns (cha_role, rollo) or (None, None) if not a rollista pattern.
    """
    role_lower = role.lower().strip()

    for pattern, rollo in ROLLISTA_PATTERNS:
        if pattern in role_lower:
            return ("Table Leader", rollo)

    return (None, None)


def map_role(role: str) -> Optional[str]:
    """Map a role string to the standard CHA role name."""
    role_lower = role.lower().strip()

    # Direct lookup
    if role_lower in ROLE_MAPPING:
        return ROLE_MAPPING[role_lower]

    return None


def map_rollo(talk: str) -> Optional[str]:
    """Map a talk string to the standard Rollo name."""
    talk_lower = talk.lower().strip()

    if talk_lower in ROLLO_MAPPING:
        return ROLLO_MAPPING[talk_lower]

    return None


def parse_comma_list(value: str) -> list[str]:
    """Parse a comma-separated list, handling quoted values."""
    if not value or not value.strip():
        return []

    # Simple split - CSV reader should have handled quotes
    parts = [p.strip() for p in value.split(",")]
    return [p for p in parts if p]


def create_address_json(row: dict) -> str:
    """Create JSON address string from row data."""
    address = {
        "addressLine1": row.get("Address", "").strip(),
        "addressLine2": "",
        "city": row.get("City", "").strip(),
        "state": row.get("State", "").strip(),
        "zip": row.get("Zip", "").strip(),
    }

    # Only return if we have at least addressLine1
    if address["addressLine1"]:
        return json.dumps(address)
    return ""


# =============================================================================
# MAIN PROCESSING
# =============================================================================

def process_experience_roles(
    positions: list[str],
    weekends: list[str],
    talks: list[str],
    is_other: bool = False
) -> list[dict]:
    """
    Process a list of positions and weekends into experience records.

    Args:
        positions: List of position strings
        weekends: List of weekend reference strings
        talks: List of talk names (for matching with Rollista positions)
        is_other: If True, use "Other" as base weekend reference

    Returns:
        List of experience record dicts with keys: cha_role, rollo, weekend_reference
    """
    records = []
    talk_index = 0  # For matching talks to plain Rollista positions

    for i, position in enumerate(positions):
        # Split slash roles
        sub_roles = split_slash_roles(position)

        for sub_role in sub_roles:
            # Skip if should be skipped
            if should_skip_role(sub_role):
                continue

            # Extract embedded weekend reference
            base_role, embedded_weekend = extract_role_with_weekend(sub_role)

            # Check if it's a rollista pattern with embedded rollo
            rollista_role, embedded_rollo = check_rollista_pattern(base_role)

            if rollista_role:
                # It's a rollista pattern
                cha_role = rollista_role
                if embedded_rollo:
                    rollo = embedded_rollo
                elif talk_index < len(talks):
                    # Get rollo from talks list
                    rollo = map_rollo(talks[talk_index])
                    talk_index += 1
                else:
                    rollo = None
            else:
                # Regular role mapping
                cha_role = map_role(base_role)
                rollo = None

            if not cha_role:
                # Couldn't map role - will be logged as unmatched
                continue

            # Determine weekend reference
            if embedded_weekend:
                weekend_ref = embedded_weekend
            elif is_other:
                weekend_ref = "Other"
            elif i < len(weekends):
                weekend_ref = weekends[i]
            elif weekends:
                # Use last weekend if we have more positions than weekends
                weekend_ref = weekends[-1]
            else:
                weekend_ref = "Other"

            records.append({
                "cha_role": cha_role,
                "rollo": rollo,
                "weekend_reference": weekend_ref,
            })

    return records


def process_roster(input_path: Path, output_suffix: str):
    """Process the roster CSV and generate output files."""

    output_dir = input_path.parent
    users_output = output_dir / f"users_update_{output_suffix}.csv"
    experience_output = output_dir / f"users_experience_{output_suffix}.csv"
    unmatched_output = output_dir / f"unmatched_roles_{output_suffix}.txt"
    stats_output = output_dir / f"conversion_stats_{output_suffix}.txt"

    # Tracking
    users_rows = []
    experience_rows = []
    unmatched_roles = set()
    stats = {
        "total_rows": 0,
        "rows_with_user_id": 0,
        "rows_without_user_id": 0,
        "users_with_updates": 0,
        "experience_records": 0,
        "dttd_experience": 0,
        "other_experience": 0,
    }

    print(f"Processing {input_path}...")

    with open(input_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)

        for row in reader:
            stats["total_rows"] += 1

            user_id = row.get("user_id", "").strip()
            if not user_id:
                stats["rows_without_user_id"] += 1
                continue

            stats["rows_with_user_id"] += 1

            # --- Process Users Update ---
            address_json = create_address_json(row)
            phone = row.get("Phone Number", row.get("Phone", "")).strip()
            church = row.get("Church Affiliation", "").strip()
            weekend_attended = normalize_weekend_reference(
                row.get("Weekend Attended", "")
            )

            # Only add if we have data to update
            if address_json or phone or church or weekend_attended:
                users_rows.append({
                    "id": user_id,
                    "phone_number": phone,
                    "church_affiliation": church,
                    "weekend_attended": weekend_attended,
                    "address": address_json,
                })
                stats["users_with_updates"] += 1

            # --- Process DTTD Experience ---
            positions_str = row.get("Position @ DTTD", "")
            weekends_str = row.get("Weekend Served", "")
            talks_str = row.get("Talk @ DTTD", "")

            positions = parse_comma_list(positions_str)
            weekends = parse_weekend_list(weekends_str)
            talks = parse_comma_list(talks_str)

            # Track unmatched roles
            for pos in positions:
                for sub_role in split_slash_roles(pos):
                    if should_skip_role(sub_role):
                        continue
                    base_role, _ = extract_role_with_weekend(sub_role)
                    rollista_role, _ = check_rollista_pattern(base_role)
                    if not rollista_role and not map_role(base_role):
                        unmatched_roles.add(base_role)

            exp_records = process_experience_roles(positions, weekends, talks, is_other=False)
            for rec in exp_records:
                experience_rows.append({
                    "user_id": user_id,
                    **rec
                })
                stats["experience_records"] += 1
                stats["dttd_experience"] += 1

            # --- Process Other Experience ---
            other_positions_str = row.get("Other Experience", "")
            other_talks_str = row.get("Other Talks", "")

            other_positions = parse_comma_list(other_positions_str)
            other_talks = parse_comma_list(other_talks_str)

            # Track unmatched roles from Other Experience
            for pos in other_positions:
                for sub_role in split_slash_roles(pos):
                    if should_skip_role(sub_role):
                        continue
                    base_role, _ = extract_role_with_weekend(sub_role)
                    rollista_role, _ = check_rollista_pattern(base_role)
                    if not rollista_role and not map_role(base_role):
                        unmatched_roles.add(f"[Other] {base_role}")

            other_records = process_experience_roles(
                other_positions, [], other_talks, is_other=True
            )
            for rec in other_records:
                experience_rows.append({
                    "user_id": user_id,
                    **rec
                })
                stats["experience_records"] += 1
                stats["other_experience"] += 1

    # --- Write Output Files ---

    # Users update CSV
    if users_rows:
        with open(users_output, "w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=[
                "id", "phone_number", "church_affiliation",
                "weekend_attended", "address"
            ])
            writer.writeheader()
            writer.writerows(users_rows)
        print(f"  Users update: {users_output}")

    # Experience CSV
    if experience_rows:
        with open(experience_output, "w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=[
                "user_id", "cha_role", "rollo", "weekend_reference"
            ])
            writer.writeheader()
            writer.writerows(experience_rows)
        print(f"  Experience: {experience_output}")

    # Unmatched roles
    if unmatched_roles:
        with open(unmatched_output, "w", encoding="utf-8") as f:
            f.write("Roles that couldn't be mapped:\n")
            f.write("=" * 50 + "\n\n")
            for role in sorted(unmatched_roles):
                f.write(f"  {role}\n")
        print(f"  Unmatched roles: {unmatched_output}")

    # Stats
    with open(stats_output, "w", encoding="utf-8") as f:
        f.write("Conversion Statistics\n")
        f.write("=" * 50 + "\n\n")
        f.write(f"Input file: {input_path}\n\n")
        f.write(f"Total rows in CSV:        {stats['total_rows']}\n")
        f.write(f"Rows with user_id:        {stats['rows_with_user_id']}\n")
        f.write(f"Rows without user_id:     {stats['rows_without_user_id']}\n")
        f.write(f"\n")
        f.write(f"Users with profile data:  {stats['users_with_updates']}\n")
        f.write(f"\n")
        f.write(f"Experience records:       {stats['experience_records']}\n")
        f.write(f"  - DTTD experience:      {stats['dttd_experience']}\n")
        f.write(f"  - Other experience:     {stats['other_experience']}\n")
        f.write(f"\n")
        f.write(f"Unmatched roles:          {len(unmatched_roles)}\n")
    print(f"  Stats: {stats_output}")

    # Print summary
    print("\n" + "=" * 50)
    print("CONVERSION SUMMARY")
    print("=" * 50)
    print(f"Total rows:           {stats['total_rows']}")
    print(f"With user_id:         {stats['rows_with_user_id']}")
    print(f"Users with updates:   {stats['users_with_updates']}")
    print(f"Experience records:   {stats['experience_records']}")
    print(f"Unmatched roles:      {len(unmatched_roles)}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/convert_roster.py <roster_with_ids_file>")
        print("\nExample:")
        print("  python scripts/convert_roster.py roster_with_ids-women.csv")
        return 1

    input_file = Path(sys.argv[1])

    if not input_file.exists():
        # Try in project root
        project_root = Path(__file__).parent.parent
        input_file = project_root / sys.argv[1]

    if not input_file.exists():
        print(f"ERROR: File not found: {sys.argv[1]}")
        return 1

    # Determine output suffix from input filename
    stem = input_file.stem
    if "women" in stem.lower():
        suffix = "women"
    elif "men" in stem.lower():
        suffix = "men"
    else:
        suffix = stem.replace("roster_with_ids", "").strip("-_") or "output"

    process_roster(input_file, suffix)
    return 0


if __name__ == "__main__":
    exit(main())
