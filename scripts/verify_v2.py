import mysql.connector
import sys
sys.path.append('server')
import config

def verify():
    db = mysql.connector.connect(**config.MYSQL_CONFIG)
    cursor = db.cursor(dictionary=True)
    
    print('--- ALL ALERTS ---')
    cursor.execute('SELECT target_role, target_region, vax_name, vax_status, district FROM alerts')
    for row in cursor.fetchall():
        print(row)

    print('\n--- HC TVM FILTER TEST (Region: Thiruvananthapuram) ---')
    cursor.execute('SELECT COUNT(*) as count FROM alerts WHERE (target_role = "health_center" AND target_region = "Thiruvananthapuram")')
    print('HC TVM Alerts:', cursor.fetchone()['count'])

    print('\n--- HC EKM FILTER TEST (Region: Ernakulam) ---')
    cursor.execute('SELECT COUNT(*) as count FROM alerts WHERE (target_role = "health_center" AND target_region = "Ernakulam")')
    print('HC EKM Alerts:', cursor.fetchone()['count'])

    print('\n--- WHO FILTER TEST ---')
    cursor.execute('SELECT COUNT(*) as count FROM alerts WHERE target_role = "who"')
    print('WHO Alerts:', cursor.fetchone()['count'])

    db.close()

if __name__ == "__main__":
    verify()
