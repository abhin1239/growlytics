"""
Database Configuration for Child Nutrition Tracker
"""
import os

# Database Type: 'sqlite' or 'mysql'
DB_TYPE = 'mysql' 

# SQLite Config
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
SQLITE_DB_PATH = os.path.join(ROOT_DIR, 'data', 'database.sqlite')

# MySQL Config
MYSQL_CONFIG = {
    'host': 'localhost',
    'user': 'root',  
    'password': 'Admin@1234',  
    'database': 'child_nutrition_tracker',
    'port': 3306
}
