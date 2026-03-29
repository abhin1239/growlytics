import mysql.connector
import sys
import os

# Add server directory to path
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'server'))
import config

def list_users():
    db = mysql.connector.connect(
        host=config.MYSQL_CONFIG['host'],
        user=config.MYSQL_CONFIG['user'],
        password=config.MYSQL_CONFIG['password'],
        database=config.MYSQL_CONFIG['database'],
        port=config.MYSQL_CONFIG.get('port', 3306)
    )
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id, username, role FROM users")
    users = cursor.fetchall()
    for user in users:
        print(user)
    cursor.close()
    db.close()

if __name__ == "__main__":
    list_users()
