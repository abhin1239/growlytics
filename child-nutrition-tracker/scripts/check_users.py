import sys
import os
import mysql.connector

# Add server directory to path to import config
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'server'))
import config

def check_users():
    print("Fetching users from MySQL...")
    
    try:
        cnx = mysql.connector.connect(
            host=config.MYSQL_CONFIG['host'],
            user=config.MYSQL_CONFIG['user'],
            password=config.MYSQL_CONFIG['password'],
            database=config.MYSQL_CONFIG['database']
        )
        cursor = cnx.cursor(dictionary=True)
        
        cursor.execute("SELECT id, username, name, email, role, region FROM users")
        users = cursor.fetchall()
        
        print(f"\nFound {len(users)} users:\n")
        print(f"{'ID':<5} {'Username':<15} {'Role':<15} {'Name'}")
        print("-" * 60)
        
        for user in users:
            print(f"{user['id']:<5} {user['username']:<15} {user['role']:<15} {user['name']}")
            
        cursor.close()
        cnx.close()
        
    except mysql.connector.Error as err:
        print(f"Error: {err}")

if __name__ == "__main__":
    check_users()
