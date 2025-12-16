# Migrating Master Roster Data

This guide documents the process for converting legacy master roster spreadsheets into database records for the DTTD application. The migration produces two types of data:

1. **User profile updates** - phone numbers, addresses, church affiliations, weekend attended
2. **User experience records** - CHA roles served, weekends worked, rollos given

## Overview

The migration is a **two-phase process**:

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│  old-master-roster  │     │   roster_with_ids   │     │  users_update.csv   │
│       .csv          │ ──► │       .csv          │ ──► │  users_experience   │
│                     │     │                     │     │       .csv          │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
         │                           │                           │
         │                           │                           │
    Phase 1: Match             Manual Review               Phase 2: Convert
    names to user IDs          & corrections               to import CSVs and update SQL
```

## Prerequisites

### Required Files

1. **Master roster CSV** (`old-master-roster-<gender>.csv`)
   - Exported from the legacy Excel spreadsheet
   - Expected columns: `Name`, `Last Name`, `Address`, `City`, `State`, `Zip`, `Phone Number`, `Church Affiliation`, `Weekend Attended`, `Position @ DTTD`, `Weekend Served`, `Talk @ DTTD`, `Other Experience`, `Other Talks`

2. **Existing users export** (`existing_users.csv`)
   - Exported from Supabase `public.users` table
   - Required columns: `id`, `first_name`, `last_name`
   - Export via Supabase dashboard: Table Editor → users → Export → CSV

### Scripts Location

All scripts are in the `scripts/` directory:
- `match_user_ids.py` - Phase 1: Name matching
- `convert_roster.py` - Phase 2: Generate import CSVs
- `csv_to_sql_updates.py` - Generate SQL UPDATE statements from any CSV

---

## Phase 1: Match Names to User IDs

### Purpose

Match each row in the master roster to an existing user in the database by comparing first and last names.

### Running the Script

```bash
python scripts/match_user_ids.py
```

> **Note**: The script currently expects hardcoded filenames. Edit the script to change input/output paths if needed.

### Input Files

| File | Description |
|------|-------------|
| `old-master-roster.csv` | Legacy roster data |
| `existing_users.csv` | Supabase users export (id, first_name, last_name) |

### Output Files

| File | Description |
|------|-------------|
| `roster_with_ids.csv` | Original data + `user_id` and `match_status` columns |
| `unmatched_users.txt` | List of names that couldn't be matched |

### Match Status Values

- `matched` - Exact match found (case-insensitive)
- `no_match` - No matching user found in database
- `multiple_matches` - Multiple users with same name (rare)

### Manual Review

After Phase 1, review `unmatched_users.txt` for:
- **Nicknames**: "Mike" vs "Michael", "Beth" vs "Elizabeth"
- **Maiden names**: User registered with maiden name, roster has married name
- **Typos**: Misspellings in either source
- **New users**: People not yet in the system

For unmatched users you want to include:
1. Find or create the user in the database
2. Manually add their `user_id` to `roster_with_ids.csv`
3. Change their `match_status` to `matched`

---

## Phase 2: Generate Import CSVs

### Purpose

Convert the matched roster data into two CSVs ready for database import:
- User profile updates (contact info, address)
- User experience records (roles served)

### Running the Script

```bash
python scripts/convert_roster.py roster_with_ids-women.csv
python scripts/convert_roster.py roster_with_ids-men.csv
```

### Output Files

| File | Description |
|------|-------------|
| `users_update_<suffix>.csv` | User profile data to update |
| `users_experience_<suffix>.csv` | Experience records to insert |
| `unmatched_roles_<suffix>.txt` | Roles that couldn't be mapped |
| `conversion_stats_<suffix>.txt` | Processing summary |

### Data Transformations

#### User Profile Data

| Source Column | Target Field | Transformation |
|--------------|--------------|----------------|
| Phone Number | `phone_number` | As-is |
| Church Affiliation | `church_affiliation` | As-is |
| Weekend Attended | `weekend_attended` | Normalize: "DTTD #6" → "DTTD#6" |
| Address, City, State, Zip | `address` | JSON object |

#### Experience Records

The script handles complex parsing:

1. **Comma-separated roles**: `"Dining, Dorm, Table"` → 3 separate records
2. **Slash roles**: `"Tech/Roster"` → 2 separate records
3. **Roles with numbers**: `"Rector #8"` → role=Rector, weekend=DTTD#8
4. **Rollista with talks**: Matches "Rollista" positions with "Talk @ DTTD" column
5. **Other experience**: Parsed separately with "Other" weekend reference

#### Role Mapping

Legacy roles are normalized to standard CHA roles. Examples:

| Legacy Value | Normalized Role |
|-------------|-----------------|
| `Hd Cha`, `Head Cha` | Head |
| `Asst Head Cha` | Assistant Head |
| `SD`, `Spiritual Dir.` | Spiritual Director |
| `Kitchen`, `Hd Kitchen` | Dining, Head Dining |
| `Silent`, `Table Leader (Silent)` | Table Leader |
| `BUR` | Backup Rector |

See `scripts/MIGRATION_PLAN.md` for the complete role mapping dictionary.

---

## Phase 3: Import to Database

### Option A: SQL UPDATE Statements

Generate SQL from the user update CSV:

```bash
python scripts/csv_to_sql_updates.py users_update_women.csv public.users id output.sql
```

Then run the SQL in Supabase SQL Editor.

### Option B: Supabase CSV Import

For `users_experience` records:
1. Go to Supabase Dashboard → Table Editor → `users_experience`
2. Click "Insert" → "Import data from CSV"
3. Upload `users_experience_<suffix>.csv`

---

## File Summary

### Input Files

```
old-master-roster-womens.csv    # Legacy women's roster
old-master-roster-mens.csv      # Legacy men's roster
existing_users.csv              # Supabase users export
```

### Intermediate Files

```
roster_with_ids-women.csv       # Women's roster with matched IDs
roster_with_ids-men.csv         # Men's roster with matched IDs
unmatched_users.txt             # Users needing manual matching
```

### Output Files

```
users_update_women.csv          # Women's profile updates
users_update_men.csv            # Men's profile updates
users_experience_women.csv      # Women's experience records
users_experience_men.csv        # Men's experience records
conversion_stats_women.txt      # Women's processing stats
conversion_stats_men.txt        # Men's processing stats
unmatched_roles_women.txt       # Unmapped women's roles
unmatched_roles_men.txt         # Unmapped men's roles
```

---

## Ideas for Improvement

### 1. Consolidate into a Single CLI Tool

Create a unified command-line tool with subcommands:

```bash
# Instead of multiple scripts:
dttd-migrate match --roster old-roster.csv --users existing_users.csv
dttd-migrate convert --input roster_with_ids.csv --output-dir ./output
dttd-migrate generate-sql --csv users_update.csv --table public.users --id-col id
```

### 2. Add Interactive Mode for Unmatched Users

When a name doesn't match, prompt the user to:
- Search for similar names (fuzzy matching)
- Select from candidates
- Skip the record
- Create a new user placeholder

### 3. Fuzzy Name Matching

Implement fuzzy matching for common variations:
- Soundex or Metaphone for phonetic matching
- Levenshtein distance for typo tolerance
- Common nickname mappings (Mike→Michael, Beth→Elizabeth, etc.)

### 4. Direct Database Integration

Connect directly to Supabase instead of using CSV exports:
- Fetch existing users via API
- Insert/update records directly
- Eliminate manual CSV import step

```python
from supabase import create_client
supabase = create_client(url, key)
users = supabase.table("users").select("id, first_name, last_name").execute()
```

### 5. Validation and Dry-Run Mode

Add pre-flight checks:
- Validate all user IDs exist in the database
- Check for duplicate experience records
- Preview changes before applying
- Generate a diff/changelog

### 6. Web-Based Upload Interface

Build an admin page in the app for:
- Uploading roster CSVs
- Interactive matching UI
- Preview and approve changes
- Track migration history

### 7. Incremental Migration Support

Handle ongoing roster updates:
- Detect which records are new vs existing
- Update only changed fields
- Merge new experience records without duplicates

### 8. Better Role Mapping Configuration

Move role mappings to a configuration file (JSON/YAML):

```yaml
roles:
  - legacy: ["Hd Cha", "Head Cha", "Head CHA"]
    normalized: "Head"
  - legacy: ["SD", "Spiritual Dir.", "Spiritual Director"]
    normalized: "Spiritual Director"
```

This makes it easier to add new mappings without editing Python code.

### 9. Automated Testing

Add test coverage:
- Unit tests for role mapping
- Integration tests with sample data
- Regression tests for edge cases (slash roles, numbered weekends, etc.)

### 10. Logging and Audit Trail

Generate detailed logs:
- Which records were matched/unmatched
- What transformations were applied
- Any data quality issues detected
- Timestamp and operator info for compliance
