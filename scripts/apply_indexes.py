import sys, os
import mysql.connector

sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'server'))
import config

def apply():
    db = mysql.connector.connect(
        host=config.MYSQL_CONFIG['host'],
        user=config.MYSQL_CONFIG['user'],
        password=config.MYSQL_CONFIG['password'],
        database=config.MYSQL_CONFIG['database'],
        port=config.MYSQL_CONFIG.get('port', 3306)
    )
    cursor = db.cursor()
    
    with open('c:/Users/abhin/OneDrive/Desktop/mini/child-nutrition-tracker/data/migrations/add_alert_indexes.sql', 'r') as f:
        sql = f.read()
    
    # Split by DELIMITER
    # mysql.connector doesn't support DELIMITER natively. We have to parse it or just execute equivalent python.
    
    # It's easier to just run the CREATE INDEX statements directly and catch exists error
    indexes = [
        "CREATE INDEX idx_vax_status_date ON vaccinations(status, alert_start_date)",
        "CREATE INDEX idx_vax_child_status ON vaccinations(child_id, status)",
        "CREATE INDEX idx_alerts_child_vax ON alerts(child_id, vax_name, is_dismissed)",
        "CREATE INDEX idx_alerts_role_region ON alerts(target_role, target_region, is_dismissed)",
        "CREATE INDEX idx_alerts_user_dismissed ON alerts(user_id, is_dismissed)"
    ]
    
    for idx_sql in indexes:
        try:
            cursor.execute(idx_sql)
            print(f"Executed: {idx_sql[:50]}...")
        except mysql.connector.Error as err:
            if err.errno == 1061: # Duplicate key name
                print(f"Index exists: {idx_sql[:50]}...")
            else:
                print(f"Error: {err}")
                
    db.commit()
    db.close()
    print("Indexes applied.")

if __name__ == '__main__':
    apply()
