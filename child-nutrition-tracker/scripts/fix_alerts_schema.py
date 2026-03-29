import sys
import os
import mysql.connector

# Add server directory to path to import config
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'server'))
import config

def fix_alerts_schema():
    print("Migrating Alerts Schema...")
    
    try:
        db = mysql.connector.connect(
            host=config.MYSQL_CONFIG['host'],
            user=config.MYSQL_CONFIG['user'],
            password=config.MYSQL_CONFIG['password'],
            database=config.MYSQL_CONFIG['database']
        )
        cursor = db.cursor()
        
        # Check existing columns to avoid errors
        cursor.execute("DESCRIBE alerts")
        columns = [row[0] for row in cursor.fetchall()]
        
        missing_columns = [
            ("target_role", "VARCHAR(50) AFTER user_id"),
            ("target_region", "VARCHAR(255) AFTER target_role"),
            ("vax_name", "VARCHAR(255) AFTER message"),
            ("due_date", "DATE AFTER vax_name"),
            ("vax_status", "VARCHAR(50) AFTER due_date"),
            ("child_age", "VARCHAR(50) AFTER vax_status"),
            ("parent_name", "VARCHAR(255) AFTER child_age"),
            ("district", "VARCHAR(255) AFTER parent_name")
        ]
        
        for col_name, col_def in missing_columns:
            if col_name not in columns:
                print(f"Adding column '{col_name}' to 'alerts' table...")
                try:
                    cursor.execute(f"ALTER TABLE alerts ADD COLUMN {col_name} {col_def}")
                    print(f"Successfully added column '{col_name}'.")
                except mysql.connector.Error as err:
                    print(f"Failed to add column '{col_name}': {err}")
            else:
                print(f"Column '{col_name}' already exists.")
        
        db.commit()
        cursor.close()
        db.close()
        print("Alerts Schema Migration completed successfully!")
        
    except mysql.connector.Error as err:
        print(f"Migration Error: {err}")

if __name__ == "__main__":
    fix_alerts_schema()
