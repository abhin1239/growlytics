import mysql.connector
from werkzeug.security import check_password_hash
import sys
import os

# Add server directory to path to import config
sys.path.append(os.path.join(os.getcwd(), 'server'))
import config

def test_auth():
    print("Testing auth for parent1...")
    
    try:
        cnx = mysql.connector.connect(
            host=config.MYSQL_CONFIG['host'],
            user=config.MYSQL_CONFIG['user'],
            password=config.MYSQL_CONFIG['password'],
            database=config.MYSQL_CONFIG['database']
        )
        cursor = cnx.cursor(dictionary=True)
        
        cursor.execute("SELECT * FROM users WHERE username = 'parent1'")
        user = cursor.fetchone()
        
        if not user:
            print("User parent1 not found!")
            return
            
        print(f"User found: {user['username']}")
        print(f"Hash in DB: {user['password_hash']}")
        
        password_to_check = 'parent123'
        result = check_password_hash(user['password_hash'], password_to_check)
        print(f"Check result for '{password_to_check}': {result}")
        
        cursor.close()
        cnx.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_auth()
