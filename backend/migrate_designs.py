"""
Migration script to add new columns to the designs table.
Run this if you don't want to reset the entire database.
"""
import sqlite3
import os

# Get the database path
db_path = os.path.join(os.path.dirname(__file__), 'instance', 'tshirt.db')

if not os.path.exists(db_path):
    print(f"Database not found at: {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check existing columns
cursor.execute("PRAGMA table_info(designs)")
columns = [col[1] for col in cursor.fetchall()]
print(f"Existing columns in designs table: {columns}")

# Add new columns if they don't exist
new_columns = [
    ("price", "REAL DEFAULT 29.99"),
    ("description", "TEXT"),
    ("product_id", "INTEGER"),
]

for col_name, col_def in new_columns:
    if col_name not in columns:
        try:
            cursor.execute(f"ALTER TABLE designs ADD COLUMN {col_name} {col_def}")
            print(f"✅ Added column: {col_name}")
        except sqlite3.OperationalError as e:
            print(f"⚠️ Could not add {col_name}: {e}")
    else:
        print(f"ℹ️ Column {col_name} already exists")

conn.commit()
conn.close()

print("\n✅ Migration complete!")
