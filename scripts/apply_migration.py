import sys, os
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'server'))
import config
import mysql.connector

def apply():
    try:
        db = mysql.connector.connect(
            host=config.MYSQL_CONFIG['host'],
            user=config.MYSQL_CONFIG['user'],
            password=config.MYSQL_CONFIG['password'],
            database=config.MYSQL_CONFIG['database'],
            port=config.MYSQL_CONFIG.get('port', 3306)
        )
        cursor = db.cursor()
        try:
            cursor.execute("ALTER TABLE vaccinations CHANGE COLUMN `due_date` `alert_start_date` DATE")
            cursor.execute("ALTER TABLE vaccinations ADD COLUMN `deadline_date` DATE AFTER `alert_start_date`")
            cursor.execute("ALTER TABLE vaccinations ADD COLUMN `last_alert_sent_date` DATE DEFAULT NULL")
            cursor.execute("ALTER TABLE vaccinations ADD COLUMN `escalation_sent` TINYINT DEFAULT 0")
            db.commit()
            print("Migration applied successfully!")
        except Exception as e:
            print(f"Migration error (might already be applied): {e}")
        finally:
            db.close()
    except Exception as e:
        print(f"Database connection error: {e}")

if __name__ == '__main__':
    apply()
