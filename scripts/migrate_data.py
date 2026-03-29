import sqlite3
import mysql.connector
import os
import sys

# Add server to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'server'))
import config

def migrate_data():
    print("Starting Data Migration (SQLite -> MySQL)...")
    
    # 1. Connect to SQLite
    sqlite_db_path = config.SQLITE_DB_PATH
    if not os.path.exists(sqlite_db_path):
        print(f"SQLite DB not found at {sqlite_db_path}")
        return
        
    print(f"Reading from SQLite: {sqlite_db_path}")
    sqlite_conn = sqlite3.connect(sqlite_db_path)
    sqlite_curr = sqlite_conn.cursor()
    
    # 2. Connect to MySQL
    print("Connecting to MySQL...")
    try:
        mysql_conn = mysql.connector.connect(
            host=config.MYSQL_CONFIG['host'],
            user=config.MYSQL_CONFIG['user'],
            password=config.MYSQL_CONFIG['password'],
            database=config.MYSQL_CONFIG['database']
        )
        mysql_curr = mysql_conn.cursor()
    except mysql.connector.Error as err:
        print(f"MySQL Connection Error: {err}")
        return

    # Disable FK checks for bulk load
    mysql_curr.execute("SET FOREIGN_KEY_CHECKS = 0")
    
    tables = [
        'users', 
        'children', 
        'growth_records', 
        'blood_reports', 
        'vax_schedule', 
        'vaccinations', 
        'nutrition_plans', 
        'alerts', 
        'reference_ranges', 
        'tokens'
    ]
    
    for table in tables:
        print(f"Migrating table: {table}...")
        
        # Get data from SQLite
        try:
            sqlite_curr.execute(f"SELECT * FROM {table}")
            rows = sqlite_curr.fetchall()
            
            if not rows:
                print(f"  - No rows to migrate.")
                continue
                
            # Get column names
            col_names = [description[0] for description in sqlite_curr.description]
            cols_str = ", ".join(col_names)
            placeholders = ", ".join(["%s"] * len(col_names))
            
            sql = f"INSERT INTO {table} ({cols_str}) VALUES ({placeholders})"
            
            # Insert into MySQL
            # Note: rows are tuples, which works for mysql-connector
            # We might need to handle ID conflicts if we are appending, but here we assume clean slate
            # Or use REPLACE INTO / INSERT IGNORE
            
            mysql_curr.executemany(sql, rows)
            print(f"  - Migrated {len(rows)} rows.")
            
        except Exception as e:
            print(f"  - Error migrating {table}: {e}")
            
    # Re-enable FK checks
    mysql_curr.execute("SET FOREIGN_KEY_CHECKS = 1")
    
    mysql_conn.commit()
    mysql_conn.close()
    sqlite_conn.close()
    print("Data Migration Completed Successfully!")

if __name__ == "__main__":
    if input("This will overwrite data in MySQL. Continue? (y/n): ").lower() == 'y':
        migrate_data()
