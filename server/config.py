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
    'host': 'containers-xxx.railway.app',
    'user': 'root',  
    'password': 'aBJfYtHfmiWSlWmQZduRYzzpyprlnZnW',  
    'database': 'railway',
    'port': 3306
}
