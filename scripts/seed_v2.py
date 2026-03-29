import mysql.connector
import sys
from datetime import datetime, timedelta
sys.path.append('server')
import config

def seed_v2():
    db = mysql.connector.connect(**config.MYSQL_CONFIG)
    cursor = db.cursor()
    today = datetime.now().date()

    # Clear previous test data
    cursor.execute('DELETE FROM alerts')
    cursor.execute('UPDATE vaccinations SET last_alert_sent_date = NULL')
    
    # Ensure children 1 and 2 exist and have correct regions
    # parent1 (id=1) has child 1 (Thiruvananthapuram)
    # parent1 (id=1) has child 2 (Ernakulam) - for regional test
    cursor.execute("UPDATE children SET region = 'Thiruvananthapuram' WHERE id = 1")
    cursor.execute("UPDATE children SET region = 'Ernakulam' WHERE id = 2")

    # Clear vaccinations for these children to avoid interference
    cursor.execute('DELETE FROM vaccinations WHERE child_id IN (1, 2)')

    # Case 1: Thiruvananthapuram - Delayed (5 days ago)
    d1 = today - timedelta(days=5)
    cursor.execute('INSERT INTO vaccinations (child_id, schedule_id, alert_start_date, status) VALUES (1, 1, %s, "pending")', (d1,))

    # Case 2: Ernakulam - Due Soon (3 days from now)
    d2 = today + timedelta(days=3)
    cursor.execute('INSERT INTO vaccinations (child_id, schedule_id, alert_start_date, status) VALUES (2, 2, %s, "pending")', (d2,))

    db.commit()
    cursor.close()
    db.close()
    print("Seed V2 successful.")

if __name__ == "__main__":
    seed_v2()
