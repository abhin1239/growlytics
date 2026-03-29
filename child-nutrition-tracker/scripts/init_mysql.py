import sys
import os
import mysql.connector
from mysql.connector import errorcode

# Add server directory to path to import config
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'server'))
import config

def init_mysql_db():
    print("Initializing MySQL Database...")
    
    # 1. Connect to MySQL Server (no specific DB yet)
    try:
        cnx = mysql.connector.connect(
            host=config.MYSQL_CONFIG['host'],
            user=config.MYSQL_CONFIG['user'],
            password=config.MYSQL_CONFIG['password']
        )
        cursor = cnx.cursor()
    except mysql.connector.Error as err:
        print(f"Error connecting to MySQL: {err}")
        print("Please check your credentials in server/config.py")
        return

    # 2. Create Database
    db_name = config.MYSQL_CONFIG['database']
    try:
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name} DEFAULT CHARACTER SET 'utf8mb4'")
        print(f"Database '{db_name}' created or already exists.")
    except mysql.connector.Error as err:
        print(f"Failed creating database: {err}")
        return

    # 3. Select Database
    cnx.database = db_name

    # 4. Execute Schema
    schema_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'schema.mysql.sql')
    if not os.path.exists(schema_path):
        print(f"Schema file not found at {schema_path}")
        return

    print(f"Executing schema from {schema_path}...")
    
    with open(schema_path, 'r') as f:
        schema_sql = f.read()
        
    # Split by semicolon to execute one by one, ignoring comments
    statements = schema_sql.split(';')
    
    for statement in statements:
        if statement.strip():
            try:
                cursor.execute(statement)
            except mysql.connector.Error as err:
                print(f"Error executing statement:\n{statement[:50]}...\n{err}")
    
    cnx.commit()
    cursor.close()
    cnx.close()
    print("MySQL Database initialized successfully!")

if __name__ == "__main__":
    init_mysql_db()
