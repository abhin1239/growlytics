"""
Flask Backend Server for Child Nutrition Tracker
Migrated to MySQL
"""
import os
import json
import mysql.connector
from datetime import datetime, timedelta
from functools import wraps
import time

from flask import Flask, request, jsonify, g, send_from_directory
from flask_cors import CORS
CORS(app, origins=["https://growlytics-six.vercel.app/"])
from werkzeug.security import generate_password_hash, check_password_hash
import secrets

# Import Config
import config

# Initialize Flask app
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)  # Parent directory with HTML/CSS/JS

app = Flask(__name__, static_folder=ROOT_DIR)
app.config['SECRET_KEY'] = secrets.token_hex(32)
CORS(app, resources={r"/api/*": {"origins": "*"}})#frontend is connnected with backend directly . here frontend is served to call backend directly and it is gone to index.html

# Database path (for loading JSONs)
DATA_DIR = os.path.join(ROOT_DIR, 'data')



# ==================== Database Setup ====================

def get_db():
    """Get database connection"""
    if 'db' not in g:
        try:
            # Connect using config
            g.db = mysql.connector.connect(
                host=config.MYSQL_CONFIG['host'],
                user=config.MYSQL_CONFIG['user'],
                password=config.MYSQL_CONFIG['password'],
                database=config.MYSQL_CONFIG['database'],
                port=config.MYSQL_CONFIG['port']
            )
        except mysql.connector.Error as err:
            print(f"Database Connection Error: {err}")
            # Ensure we don't crash hard, but API will fail
            g.db = None
            
    return g.db

def get_cursor(db):
    """Get dictionary cursor"""
    if db:
        return db.cursor(dictionary=True, buffered=True)
    return None

@app.teardown_appcontext
def close_db(exception):
    """Close database connection"""
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db():
    """Initialize database with schema and default data"""
    # Note: Schema is best handled via scripts/init_mysql.py or schema.mysql.sql
    # logic here checks for connection and seeds data if empty.
    
    # 1. Check connection
    try:
        cnx = mysql.connector.connect(
            host=config.MYSQL_CONFIG['host'],
            user=config.MYSQL_CONFIG['user'],
            password=config.MYSQL_CONFIG['password']
        )
        cursor = cnx.cursor()
        
        # Check if database exists
        db_name = config.MYSQL_CONFIG['database']
        cursor.execute(f"SHOW DATABASES LIKE '{db_name}'")
        if not cursor.fetchone():
            print(f"Database '{db_name}' does not exist. Please run 'python scripts/init_mysql.py' first.")
            return

        cnx.close()
        
        # Connect to DB to check tables/seed
        db = mysql.connector.connect(
            host=config.MYSQL_CONFIG['host'],
            user=config.MYSQL_CONFIG['user'],
            password=config.MYSQL_CONFIG['password'],
            database=config.MYSQL_CONFIG['database']
        )
        cursor = db.cursor(buffered=True)
        
        # Check if users exist
        try:
            cursor.execute("SELECT COUNT(*) FROM users")
            count = cursor.fetchone()[0]
            
            if count == 0:
                print("Database is empty. No demo users seeded.")

            # Check/Seed Vax Schedule
            cursor.execute("SELECT COUNT(*) FROM vax_schedule")
            if cursor.fetchone()[0] == 0:
                print("Seeding vaccine schedule...")
                vax_schedule = [
                    ('BCG', 'Birth Dose', 0, 0, 0, 'Tuberculosis', 1),
                    ('OPV', 'Birth Dose', 0, 0, 0, 'Polio', 1),
                    ('Hepatitis B', 'Birth Dose', 0, 0, 0, 'Hepatitis B', 1),
                    ('OPV', 'Dose 1', 6, None, None, 'Polio', 1),
                    ('Pentavalent', 'Dose 1', 6, None, None, 'DPT, HepB, Hib', 1),
                    ('Rotavirus', 'Dose 1', 6, None, None, 'Rotavirus Diarrhea', 1),
                    ('PCV', 'Dose 1', 6, None, None, 'Pneumococcal Disease', 1),
                    ('IPV', 'Dose 1', 6, None, None, 'Polio', 1),
                    ('OPV', 'Dose 2', 10, None, None, 'Polio', 1),
                    ('Pentavalent', 'Dose 2', 10, None, None, 'DPT, HepB, Hib', 1),
                    ('Rotavirus', 'Dose 2', 10, None, None, 'Rotavirus Diarrhea', 1),
                    ('OPV', 'Dose 3', 14, None, None, 'Polio', 1),
                    ('Pentavalent', 'Dose 3', 14, None, None, 'DPT, HepB, Hib', 1),
                    ('Rotavirus', 'Dose 3', 14, None, None, 'Rotavirus Diarrhea', 1),
                    ('PCV', 'Dose 2', 14, None, None, 'Pneumococcal Disease', 1),
                    ('IPV', 'Dose 2', 14, None, None, 'Polio', 1),
                    ('MR', 'Dose 1', None, 9, None, 'Measles, Rubella', 1),
                    ('JE', 'Dose 1', None, 9, None, 'Japanese Encephalitis', 1),
                    ('PCV', 'Booster', None, 9, None, 'Pneumococcal Disease', 1),
                    ('DPT', 'Booster 1', None, 16, None, 'Diphtheria, Pertussis, Tetanus', 1),
                    ('MR', 'Dose 2', None, 16, None, 'Measles, Rubella', 1),
                    ('OPV', 'Booster', None, 16, None, 'Polio', 1),
                    ('JE', 'Dose 2', None, 16, None, 'Japanese Encephalitis', 1),
                    ('DPT', 'Booster 2', None, None, 5, 'Diphtheria, Pertussis, Tetanus', 1),
                    ('Td', 'Dose 1', None, None, 10, 'Tetanus, Diphtheria', 1),
                    ('Td', 'Dose 2', None, None, 16, 'Tetanus, Diphtheria', 1),
                ]
                
                cursor.executemany('''
                    INSERT INTO vax_schedule (vaccine_name, dose, age_weeks, age_months, age_years, disease_prevented, is_mandatory)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                ''', vax_schedule)
                db.commit()

            # Check/Seed Reference Ranges
            cursor.execute("SELECT COUNT(*) FROM reference_ranges")
            if cursor.fetchone()[0] == 0:
                print("Seeding reference ranges...")
                reference_ranges = [
                    ('hemoglobin', '0-6 months', None, 9.0, 10.0, 14.0, 18.0, 'g/dL'),
                    ('hemoglobin', '6-12 months', None, 9.5, 10.5, 13.0, 15.0, 'g/dL'),
                    ('hemoglobin', '1-5 years', None, 10.0, 11.0, 13.0, 15.0, 'g/dL'),
                    ('hemoglobin', '5-12 years', None, 10.5, 11.5, 14.5, 16.0, 'g/dL'),
                    ('hemoglobin', '12-18 years', 'Male', 11.0, 13.0, 16.0, 18.0, 'g/dL'),
                    ('hemoglobin', '12-18 years', 'Female', 10.5, 12.0, 15.0, 16.5, 'g/dL'),
                    ('vitamin_d', 'all', None, 10.0, 20.0, 50.0, 100.0, 'ng/mL'),
                    ('vitamin_b12', 'all', None, 150.0, 200.0, 900.0, 1200.0, 'pg/mL'),
                    ('calcium', '0-1 years', None, 7.5, 8.5, 11.0, 12.0, 'mg/dL'),
                    ('calcium', '1-18 years', None, 8.0, 8.8, 10.8, 11.5, 'mg/dL'),
                    ('serum_iron', 'all', None, 30.0, 60.0, 170.0, 200.0, 'µg/dL'),
                    ('ferritin', '0-5 years', None, 6.0, 12.0, 140.0, 200.0, 'ng/mL'),
                    ('ferritin', '5-18 years', None, 7.0, 15.0, 150.0, 200.0, 'ng/mL'),
                    ('total_protein', 'all', None, 5.0, 6.0, 8.0, 9.0, 'g/dL'),
                    ('albumin', 'all', None, 2.5, 3.5, 5.0, 5.5, 'g/dL'),
                ]
                
                cursor.executemany('''
                    INSERT INTO reference_ranges (parameter, age_group, gender, low_critical, low_normal, high_normal, high_critical, unit)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ''', reference_ranges)
                db.commit()

        except mysql.connector.Error as err:
            print(f"Seeding Error: {err}")
            
        finally:
            db.close()
            
    except mysql.connector.Error as err:
        print(f"Init DB Error: {err}")
        print("Please check server/config.py")


# ==================== Authentication ====================

def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'message': 'Authentication required'}), 401
        
        token = auth_header.split(' ')[1]
        db = get_db()
        if not db:
            return jsonify({'success': False, 'message': 'Database error'}), 500
            
        cursor = get_cursor(db)
        
        cursor.execute('''
            SELECT u.* FROM users u
            JOIN tokens t ON u.id = t.user_id
            WHERE t.token = %s AND (t.expires_at IS NULL OR t.expires_at > NOW())
        ''', (token,))
        
        user = cursor.fetchone()
        if not user:
            return jsonify({'success': False, 'message': 'Invalid or expired token'}), 401
        
        g.current_user = dict(user)
        return f(*args, **kwargs)
    return decorated

def require_roles(*roles):
    """Decorator to require specific roles"""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if g.current_user['role'] not in roles:
                return jsonify({'success': False, 'message': 'Access denied'}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator

# ==================== API Routes ====================

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register new user"""
    data = request.json
    
    # Basic validation
    required_fields = ['username', 'password', 'name', 'role']
    for field in required_fields:
        if not data.get(field):
            print(f"Registration failed: {field} is required")
            return jsonify({'success': False, 'message': f'{field} is required'}), 400
            
    role = data.get('role', 'parent')
    
    # Admin Code Validation
    if role in ['health_center', 'who']:
        admin_code = data.get('admin_code')
        if admin_code != 'ADMIN2026':
             return jsonify({'success': False, 'message': 'Invalid Registration Code'}), 403
             
    # Region Validation
    if role != 'who' and not data.get('region'):
        return jsonify({'success': False, 'message': 'Region is required'}), 400
    
    db = get_db()
    if not db: return jsonify({'success': False, 'message': 'Database Unavailable'}), 500
    cursor = get_cursor(db)
    
    # Check if username exists
    cursor.execute("SELECT id FROM users WHERE username = %s", (data['username'],))
    if cursor.fetchone():
        print(f"Registration failed: Username {data['username']} already exists")
        return jsonify({'success': False, 'message': 'Username already exists'}), 400
    
    # Create user
    cursor.execute('''
        INSERT INTO users (username, password_hash, name, email, phone, role, region)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    ''', (
        data['username'],
        generate_password_hash(data['password']),
        data['name'],
        data.get('email'),
        data.get('phone'),
        role,
        data.get('region')
    ))
    
    db.commit()
    print(f"Registration successful for: {data['username']}")
    return jsonify({'success': True, 'message': 'Registration successful'})

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user"""
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password are required'}), 400
    
    db = get_db()
    if not db: return jsonify({'success': False, 'message': 'Database Unavailable'}), 500
    cursor = get_cursor(db)
    
    cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    
    if not user:
        print(f"Login failed: User {username} not found")
        return jsonify({'success': False, 'message': 'Invalid username or password'}), 401
        
    if not check_password_hash(user['password_hash'], password):
        print(f"Login failed: Incorrect password for {username}")
        return jsonify({'success': False, 'message': 'Invalid username or password'}), 401
    
    # Generate token
    token = secrets.token_hex(32)
    # expires_at calculated in Python, passed to SQL
    expires_at = datetime.now() + timedelta(days=7)
    
    cursor.execute('''
        INSERT INTO tokens (user_id, token, expires_at)
        VALUES (%s, %s, %s)
    ''', (user['id'], token, expires_at))
    
    # Update last login
    cursor.execute("UPDATE users SET last_login = NOW() WHERE id = %s", (user['id'],))
    
    db.commit()
    
    return jsonify({
        'success': True,
        'token': token,
        'user': {
            'id': user['id'],
            'username': user['username'],
            'name': user['name'],
            'email': user['email'],
            'phone': user['phone'],
            'role': user['role'],
            'region': user['region']
        }
    })

@app.route('/api/auth/logout', methods=['POST'])
@require_auth
def logout():
    """Logout user"""
    auth_header = request.headers.get('Authorization')
    token = auth_header.split(' ')[1]
    
    db = get_db()
    cursor = get_cursor(db)
    cursor.execute("DELETE FROM tokens WHERE token = %s", (token,))
    db.commit()
    
    return jsonify({'success': True, 'message': 'Logged out successfully'})

@app.route('/api/auth/profile', methods=['GET'])
@require_auth
def get_profile():
    """Get current user profile"""
    user = g.current_user
    return jsonify({
        'success': True,
        'user': {
            'id': user['id'],
            'username': user['username'],
            'name': user['name'],
            'email': user['email'],
            'phone': user['phone'],
            'role': user['role'],
            'region': user['region']
        }
    })

@app.route('/api/auth/profile', methods=['DELETE'])
@require_auth
def delete_profile():
    """Delete current user account and associated data"""
    user = g.current_user
    db = get_db()
    cursor = get_cursor(db)
    
    try:
        if user['role'] == 'parent':
            # Get all children (Wait, MySQL cascading might handle this, 
            # but let's be safe and manually delete if schema didn't have cascade or safe mode on)
            # Schema has ON DELETE CASCADE for children -> users, growth -> children etc.
            # So deleting user should cascade everything.
            pass
            
        # Common deletion for all roles
        # Because of ON DELETE CASCADE in schema, we just delete the user
        cursor.execute("DELETE FROM users WHERE id = %s", (user['id'],))
        
        db.commit()
        return jsonify({'success': True, 'message': 'Account deleted successfully'})
        
    except Exception as e:
        db.rollback()
        return jsonify({'success': False, 'message': f'Deletion failed: {str(e)}'}), 500

# ==================== Children Routes ====================

@app.route('/api/children', methods=['GET'])
@require_auth
def get_children():
    """Get children based on user role"""
    db = get_db()
    cursor = get_cursor(db)
    user = g.current_user
    
    if user['role'] == 'parent':
        cursor.execute('''
            SELECT c.*, u.phone as parent_phone,
                   (SELECT COUNT(*) FROM vaccinations v WHERE v.child_id = c.id AND v.status = 'completed') as completed_vaccinations,
                   (SELECT COUNT(*) FROM vaccinations v WHERE v.child_id = c.id) as total_vaccinations,
                   (SELECT COUNT(*) FROM vaccinations v WHERE v.child_id = c.id AND v.status = 'pending') as pending_vaccinations
            FROM children c 
            JOIN users u ON c.parent_id = u.id
            WHERE c.parent_id = %s AND c.is_active = 1
        ''', (user['id'],))
    elif user['role'] == 'health_center':
        cursor.execute('''
            SELECT c.*, u.phone as parent_phone,
                   (SELECT COUNT(*) FROM vaccinations v WHERE v.child_id = c.id AND v.status = 'completed') as completed_vaccinations,
                   (SELECT COUNT(*) FROM vaccinations v WHERE v.child_id = c.id) as total_vaccinations,
                   (SELECT COUNT(*) FROM vaccinations v WHERE v.child_id = c.id AND v.status = 'pending') as pending_vaccinations
            FROM children c 
            JOIN users u ON c.parent_id = u.id
            WHERE c.region = %s AND c.is_active = 1
        ''', (user['region'],))
    else:  # WHO
        cursor.execute('''
            SELECT c.*, u.phone as parent_phone,
                   (SELECT COUNT(*) FROM vaccinations v WHERE v.child_id = c.id AND v.status = 'completed') as completed_vaccinations,
                   (SELECT COUNT(*) FROM vaccinations v WHERE v.child_id = c.id) as total_vaccinations,
                   (SELECT COUNT(*) FROM vaccinations v WHERE v.child_id = c.id AND v.status = 'pending') as pending_vaccinations
            FROM children c 
            JOIN users u ON c.parent_id = u.id
            WHERE c.is_active = 1
        ''')
    
    children = [dict(row) for row in cursor.fetchall()]
    
    # Get latest growth record for each child
    for child in children:
        cursor.execute('''
            SELECT assessment_result FROM growth_records 
            WHERE child_id = %s ORDER BY recorded_date DESC LIMIT 1
        ''', (child['id'],))
        growth = cursor.fetchone()
        child['nutritionStatus'] = growth['assessment_result'] if growth else 'Normal'
    
    return jsonify({'success': True, 'children': children})

@app.route('/api/children/<int:child_id>', methods=['GET'])
@require_auth
def get_child(child_id):
    """Get child by ID"""
    db = get_db()
    cursor = get_cursor(db)
    user = g.current_user
    
    cursor.execute('''
        SELECT c.*, u.phone as parent_phone 
        FROM children c
        JOIN users u ON c.parent_id = u.id
        WHERE c.id = %s
    ''', (child_id,))
    child = cursor.fetchone()
    
    if not child:
        return jsonify({'success': False, 'message': 'Child not found'}), 404
    
    # Check access
    if user['role'] == 'parent' and child['parent_id'] != user['id']:
        return jsonify({'success': False, 'message': 'Access denied'}), 403
    elif user['role'] == 'health_center' and child['region'] != user['region']:
        return jsonify({'success': False, 'message': 'Access denied'}), 403
    
    child_dict = dict(child)
    
    # Get growth records
    cursor.execute('''
        SELECT * FROM growth_records WHERE child_id = %s ORDER BY recorded_date DESC LIMIT 10
    ''', (child_id,))
    child_dict['growthRecords'] = [dict(row) for row in cursor.fetchall()]
    
    # Get vaccination counts
    cursor.execute('''
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
        FROM vaccinations WHERE child_id = %s
    ''', (child_id,))
    vax_stats = cursor.fetchone()
    child_dict['totalVaccinations'] = vax_stats['total'] or 0
    child_dict['completedVaccinations'] = vax_stats['completed'] or 0
    
    # Get latest nutrition status
    if child_dict['growthRecords']:
        child_dict['nutritionStatus'] = child_dict['growthRecords'][0].get('assessment_result', 'Normal')
    else:
        child_dict['nutritionStatus'] = 'Normal'
    
    return jsonify({'success': True, 'child': child_dict})

@app.route('/api/vaccinations/schedule', methods=['GET'])
@require_auth
def get_vax_schedule():
    """Get master vaccination schedule"""
    db = get_db()
    cursor = get_cursor(db)
    cursor.execute("SELECT * FROM vax_schedule ORDER BY age_years, age_months, age_weeks")
    schedules = cursor.fetchall()
    return jsonify({'success': True, 'schedules': schedules})

@app.route('/api/children', methods=['POST'])
@require_auth
@require_roles('parent')
def create_child():
    """Create new child"""
    data = request.json
    user = g.current_user
    
    required_fields = ['name', 'dob', 'gender']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'success': False, 'message': f'{field} is required'}), 400
    
    db = get_db()
    cursor = get_cursor(db)
    
    cursor.execute('''
        INSERT INTO children (parent_id, name, dob, gender, blood_group, allergies, medical_conditions, region)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    ''', (
        user['id'],
        data['name'],
        data['dob'],
        data['gender'],
        data.get('blood_group'),
        data.get('allergies'),
        data.get('medical_conditions'),
        user['region']
    ))
    
    child_id = cursor.lastrowid
    
    # Manual vaccination status mapping
    manual_vax = {v['schedule_id']: v['status'] for v in data.get('vaccinations', [])}
    
    # Initialize vaccinations for the child
    cursor.execute("SELECT * FROM vax_schedule")
    schedules = cursor.fetchall()
    
    dob = datetime.strptime(data['dob'], '%Y-%m-%d')
    now = datetime.now()
    
    for schedule in schedules:
        due_date = None
        if schedule['age_weeks']:
            due_date = dob + timedelta(weeks=schedule['age_weeks'])
        elif schedule['age_months']:
            due_date = dob + timedelta(days=schedule['age_months'] * 30)
        elif schedule['age_years']:
            due_date = dob + timedelta(days=schedule['age_years'] * 365)
        
        if due_date:
            alert_start_date = due_date
            deadline_date = alert_start_date + timedelta(days=10)
            
            # Use manual status if provided, otherwise calculate
            # Status can be: 'completed', 'pending', 'not yet due'
            if schedule['id'] in manual_vax:
                status = manual_vax[schedule['id']]
            else:
                # Never auto-mark as completed
                status = 'pending' if alert_start_date < now else 'not yet due'
            
            cursor.execute('''
                INSERT INTO vaccinations (child_id, schedule_id, alert_start_date, deadline_date, status, completed_date)
                VALUES (%s, %s, %s, %s, %s, %s)
            ''', (
                child_id, 
                schedule['id'], 
                alert_start_date.strftime('%Y-%m-%d'), 
                deadline_date.strftime('%Y-%m-%d'), 
                status,
                now.strftime('%Y-%m-%d') if status == 'completed' else None
            ))
    
    db.commit()
    
    return jsonify({'success': True, 'message': 'Child added successfully', 'child_id': child_id})

@app.route('/api/children/<int:child_id>', methods=['PUT'])
@require_auth
@require_roles('parent')
def update_child(child_id):
    """Update child"""
    data = request.json
    user = g.current_user
    
    db = get_db()
    cursor = get_cursor(db)
    
    # Check ownership
    cursor.execute("SELECT parent_id FROM children WHERE id = %s", (child_id,))
    child = cursor.fetchone()
    
    if not child or child['parent_id'] != user['id']:
        return jsonify({'success': False, 'message': 'Access denied'}), 403
    
    cursor.execute('''
        UPDATE children SET 
            name = COALESCE(%s, name),
            dob = COALESCE(%s, dob),
            gender = COALESCE(%s, gender),
            blood_group = COALESCE(%s, blood_group),
            allergies = COALESCE(%s, allergies),
            medical_conditions = COALESCE(%s, medical_conditions)
        WHERE id = %s
    ''', (
        data.get('name'),
        data.get('dob'),
        data.get('gender'),
        data.get('blood_group'),
        data.get('allergies'),
        data.get('medical_conditions'),
        child_id
    ))
    
    # Recalculate vaccination dates if dob is updated
    if data.get('dob'):
        cursor.execute("SELECT * FROM vax_schedule")
        schedules = cursor.fetchall()
        from datetime import datetime, timedelta
        dob_dt = datetime.strptime(data['dob'], '%Y-%m-%d')
        
        for schedule in schedules:
            alert_start_date = None
            if schedule['age_weeks']:
                alert_start_date = dob_dt + timedelta(weeks=schedule['age_weeks'])
            elif schedule['age_months']:
                alert_start_date = dob_dt + timedelta(days=schedule['age_months'] * 30)
            elif schedule['age_years']:
                alert_start_date = dob_dt + timedelta(days=schedule['age_years'] * 365)
            
            if alert_start_date:
                deadline_date = alert_start_date + timedelta(days=10)
                now = datetime.now()
                # Never auto-mark as completed — only update dates for pending/not-yet-due records
                if alert_start_date < now:
                    new_status = 'pending'
                else:
                    new_status = 'not yet due'
                cursor.execute('''
                    UPDATE vaccinations SET alert_start_date = %s, deadline_date = %s, status = %s
                    WHERE child_id = %s AND schedule_id = %s AND status IN ('pending', 'not yet due')
                ''', (alert_start_date.strftime('%Y-%m-%d'), deadline_date.strftime('%Y-%m-%d'), new_status, child_id, schedule['id']))

    db.commit()
    return jsonify({'success': True, 'message': 'Child updated successfully'})

# ==================== Dashboard Routes ====================

@app.route('/api/dashboard/parent', methods=['GET'])
@require_auth
@require_roles('parent')
def parent_dashboard():
    """Get parent dashboard data"""
    db = get_db()
    cursor = get_cursor(db)
    user = g.current_user
    
    # Get children with stats
    cursor.execute('''
        SELECT c.*, 
               (SELECT COUNT(*) FROM vaccinations v WHERE v.child_id = c.id AND v.status = 'completed') as completed_vaccinations,
               (SELECT COUNT(*) FROM vaccinations v WHERE v.child_id = c.id) as total_vaccinations
        FROM children c 
        WHERE c.parent_id = %s AND c.is_active = 1
    ''', (user['id'],))
    children = [dict(row) for row in cursor.fetchall()]
    
    # Add nutrition status
    for child in children:
        cursor.execute('''
            SELECT assessment_result FROM growth_records 
            WHERE child_id = %s ORDER BY recorded_date DESC LIMIT 1
        ''', (child['id'],))
        growth = cursor.fetchone()
        child['nutritionStatus'] = growth['assessment_result'] if growth else 'Normal'
        
        # Get pending vaccinations
        # Updated DATE usage for MySQL: DATE_ADD(NOW(), ...)
        cursor.execute('''
            SELECT COUNT(*) as pending FROM vaccinations v 
            WHERE v.child_id = %s AND v.status = 'pending'
        ''', (child['id'],))
        child['pending_vaccinations'] = cursor.fetchone()['pending']
    
    # Get alerts
    cursor.execute('''
        SELECT * FROM alerts 
        WHERE user_id = %s AND is_dismissed = 0 
        ORDER BY created_at DESC LIMIT 10
    ''', (user['id'],))
    alerts = [dict(row) for row in cursor.fetchall()]

    # Overdue & upcoming vaccinations for parent's own children
    cursor.execute('''
        SELECT c.id AS child_id, c.name AS child_name, c.dob, c.region AS district,
               u.phone AS parent_phone,
               v.alert_start_date AS due_date,
               v.deadline_date,
               s.vaccine_name,
               CASE WHEN v.deadline_date < CURDATE() THEN 'Delayed'
                    ELSE 'Due Soon' END AS vax_status
        FROM vaccinations v
        JOIN children c ON v.child_id = c.id
        JOIN users u ON c.parent_id = u.id
        JOIN vax_schedule s ON v.schedule_id = s.id
        WHERE c.parent_id = %s
          AND v.status = 'pending'
          AND v.alert_start_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        ORDER BY v.deadline_date ASC
    ''', (user['id'],))
    overdue_vaccinations = [dict(row) for row in cursor.fetchall()]
    
    # Calculate stats
    healthy_children = sum(1 for c in children if c['nutritionStatus'] == 'Normal')
    pending_vax = sum(c['pending_vaccinations'] for c in children)
    
    return jsonify({
        'success': True,
        'stats': {
            'totalChildren': len(children),
            'healthyChildren': healthy_children,
            'pendingVaccinations': pending_vax
        },
        'children': children,
        'alerts': alerts,
        'overdue_vaccinations': overdue_vaccinations
    })

@app.route('/api/dashboard/health-center', methods=['GET'])
@require_auth
@require_roles('health_center')
def health_center_dashboard():
    """Get health center dashboard data"""
    db = get_db()
    cursor = get_cursor(db)
    user = g.current_user
    
    # Total children in region
    cursor.execute("SELECT COUNT(*) as total FROM children WHERE region = %s AND is_active = 1", (user['region'],))
    total_children = cursor.fetchone()['total']
    
    # Malnourished children
    cursor.execute('''
        SELECT COUNT(DISTINCT c.id) as count FROM children c
        JOIN growth_records g ON c.id = g.child_id
        WHERE c.region = %s AND c.is_active = 1 
        AND g.assessment_result IN ('MAM', 'SAM', 'Moderate Acute Malnutrition', 'Severe Acute Malnutrition')
        AND g.id = (SELECT MAX(id) FROM growth_records WHERE child_id = c.id)
    ''', (user['region'],))
    malnourished = cursor.fetchone()['count']
    
    # Overdue vaccinations
    # MySQL: CURDATE() instead of date('now')
    cursor.execute('''
        SELECT COUNT(*) as count FROM vaccinations v
        JOIN children c ON v.child_id = c.id
        WHERE c.region = %s AND v.status = 'pending' AND v.deadline_date < CURDATE()
    ''', (user['region'],))
    overdue_vax = cursor.fetchone()['count']
    
    # Blood deficiencies
    cursor.execute('''
        SELECT COUNT(DISTINCT c.id) as count FROM children c
        JOIN blood_reports b ON c.id = b.child_id
        WHERE c.region = %s AND c.is_active = 1 AND b.analysis_result LIKE '%%DEFICIENT%%'
    ''', (user['region'],))
    # Note: Double % for escape in some drivers, but standard %s for params means Literal % needs escape usually?
    # MySQL Connector Python uses %s. To use literal %, you need %%.
    
    blood_deficiencies = cursor.fetchone()['count']
    
    # Get overdue + upcoming vaccinations for HC region (direct join, real child names)
    cursor.execute('''
        SELECT c.id AS child_id, c.name AS child_name, c.dob, c.region AS district,
               u.phone AS parent_phone, u.name AS parent_name,
               v.alert_start_date AS due_date,
               v.deadline_date,
               s.vaccine_name,
               CASE WHEN v.deadline_date < CURDATE() THEN 'Delayed'
                    ELSE 'Due Soon' END AS vax_status
        FROM vaccinations v
        JOIN children c ON v.child_id = c.id
        JOIN users u ON c.parent_id = u.id
        JOIN vax_schedule s ON v.schedule_id = s.id
        WHERE c.region = %s
          AND v.status = 'pending'
          AND v.alert_start_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        ORDER BY v.deadline_date ASC
        LIMIT 20
    ''', (user['region'],))
    overdue_vaccinations = [dict(row) for row in cursor.fetchall()]
    
    return jsonify({
        'success': True,
        'stats': {
            'totalChildren': total_children,
            'malnourishedChildren': malnourished,
            'overdueVaccinations': overdue_vax,
            'bloodDeficiencies': blood_deficiencies
        },
        'overdue_vaccinations': overdue_vaccinations
    })

@app.route('/api/reports/health-center', methods=['GET'])
@require_auth
@require_roles('health_center')
def health_center_reports():
    """Get detailed lists for health center reports"""
    db = get_db()
    cursor = get_cursor(db)
    user = g.current_user
    
    # Malnourished children list
    cursor.execute('''
        SELECT c.*, u.phone as parent_phone, g.assessment_result
        FROM children c
        JOIN users u ON c.parent_id = u.id
        JOIN growth_records g ON c.id = g.child_id
        WHERE c.region = %s AND c.is_active = 1 
        AND g.assessment_result IN ('MAM', 'SAM', 'Moderate Acute Malnutrition', 'Severe Acute Malnutrition')
        AND g.id = (SELECT MAX(id) FROM growth_records WHERE child_id = c.id)
    ''', (user['region'],))
    malnourished_list = [dict(row) for row in cursor.fetchall()]

    # Overdue vaccinations list
    # MySQL: CURDATE()
    cursor.execute('''
        SELECT c.*, u.phone as parent_phone,
               v.alert_start_date,
               v.alert_start_date AS due_date,
               v.deadline_date,
               s.vaccine_name
        FROM children c
        JOIN users u ON c.parent_id = u.id
        JOIN vaccinations v ON c.id = v.child_id
        JOIN vax_schedule s ON v.schedule_id = s.id
        WHERE c.region = %s AND v.status = 'pending' AND v.deadline_date < CURDATE()
    ''', (user['region'],))
    overdue_list = [dict(row) for row in cursor.fetchall()]

    # Blood deficiencies list
    cursor.execute('''
        SELECT c.*, u.phone as parent_phone, b.analysis_result
        FROM children c
        JOIN users u ON c.parent_id = u.id
        JOIN blood_reports b ON c.id = b.child_id
        WHERE c.region = %s AND c.is_active = 1 AND b.analysis_result LIKE '%%DEFICIENT%%'
    ''', (user['region'],))
    deficiency_list = [dict(row) for row in cursor.fetchall()]

    return jsonify({
        'success': True,
        'reports': {
            'malnourished': malnourished_list,
            'overdue_vaccinations': overdue_list,
            'blood_deficiencies': deficiency_list
        }
    })

@app.route('/api/dashboard/who', methods=['GET'])
@require_auth
@require_roles('who')
def who_dashboard():
    """Get WHO dashboard data"""
    db = get_db()
    cursor = get_cursor(db)
    user = g.current_user
    
    # Total children
    cursor.execute("SELECT COUNT(*) as total FROM children WHERE is_active = 1")
    total_children = cursor.fetchone()['total']
    
    # Vaccination rate
    cursor.execute('''
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
        FROM vaccinations
    ''')
    vax_stats = cursor.fetchone()
    vax_completed = vax_stats['completed'] or 0
    vax_total = vax_stats['total'] or 0
    vax_rate = round((vax_completed / vax_total * 100) if vax_total > 0 else 0, 1)
    
    # Malnutrition rate
    cursor.execute('''
        SELECT COUNT(DISTINCT c.id) as count FROM children c
        JOIN growth_records g ON c.id = g.child_id
        WHERE c.is_active = 1 
        AND g.assessment_result IN ('MAM', 'SAM', 'Moderate Acute Malnutrition', 'Severe Acute Malnutrition')
        AND g.id = (SELECT MAX(id) FROM growth_records WHERE child_id = c.id)
    ''')
    malnourished = cursor.fetchone()['count']
    mal_rate = round((malnourished / total_children * 100) if total_children > 0 else 0, 1)
    
    # Critical cases
    cursor.execute('''
        SELECT COUNT(DISTINCT c.id) as count FROM children c
        JOIN growth_records g ON c.id = g.child_id
        WHERE c.is_active = 1 
        AND g.assessment_result IN ('SAM', 'Severe Acute Malnutrition')
        AND g.id = (SELECT MAX(id) FROM growth_records WHERE child_id = c.id)
    ''')
    critical = cursor.fetchone()['count']
    
    # Get overdue + upcoming vaccinations state-wide (direct join, real child names)
    cursor.execute('''
        SELECT c.id AS child_id, c.name AS child_name, c.dob, c.region AS district,
               u.name AS parent_name, u.phone AS parent_phone,
               v.alert_start_date AS due_date,
               v.deadline_date,
               s.vaccine_name,
               CASE WHEN v.deadline_date < CURDATE() THEN 'Delayed'
                    ELSE 'Due Soon' END AS vax_status
        FROM vaccinations v
        JOIN children c ON v.child_id = c.id
        JOIN users u ON c.parent_id = u.id
        JOIN vax_schedule s ON v.schedule_id = s.id
        WHERE v.status = 'pending'
          AND v.alert_start_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        ORDER BY v.deadline_date ASC
        LIMIT 30
    ''')
    overdue_vaccinations = [dict(row) for row in cursor.fetchall()]
    
    return jsonify({
        'success': True,
        'stats': {
            'totalChildren': total_children,
            'vaccinationRate': vax_rate,
            'malnutritionRate': mal_rate,
            'criticalCases': critical
        },
        'overdue_vaccinations': overdue_vaccinations
    })

# ==================== Growth Records Routes ====================

@app.route('/api/children/<int:child_id>/growth', methods=['GET'])
@require_auth
def get_growth_records(child_id):
    """Get growth records for a child"""
    db = get_db()
    cursor = get_cursor(db)
    
    cursor.execute('''
        SELECT * FROM growth_records WHERE child_id = %s ORDER BY recorded_date DESC
    ''', (child_id,))
    
    records = [dict(row) for row in cursor.fetchall()]
    return jsonify({'success': True, 'records': records})

@app.route('/api/children/<int:child_id>/growth', methods=['POST'])
@require_auth
@require_roles('parent')
def add_growth_record(child_id):
    """Add growth record for a child"""
    data = request.json
    user = g.current_user
    
    db = get_db()
    cursor = get_cursor(db)
    
    # Verify ownership
    cursor.execute("SELECT parent_id FROM children WHERE id = %s", (child_id,))
    child = cursor.fetchone()
    if not child or child['parent_id'] != user['id']:
        return jsonify({'success': False, 'message': 'Access denied'}), 403
    
    cursor.execute('''
        INSERT INTO growth_records (
            child_id, recorded_date, height_cm, weight_kg, head_circumference_cm,
            waz_score, haz_score, whz_score, baz_score, assessment_result
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    ''', (
        child_id,
        data.get('recorded_date'),
        data.get('height_cm'),
        data.get('weight_kg'),
        data.get('head_circumference_cm'),
        data.get('waz_score'),
        data.get('haz_score'),
        data.get('whz_score'),
        data.get('baz_score'),
        data.get('assessment_result', 'Normal')
    ))
    
    db.commit()
    return jsonify({'success': True, 'message': 'Growth record added', 'id': cursor.lastrowid})

# ==================== Blood Reports Routes ====================

@app.route('/api/children/<int:child_id>/blood-reports', methods=['GET'])
@require_auth
def get_blood_reports(child_id):
    """Get blood reports for a child"""
    db = get_db()
    cursor = get_cursor(db)
    
    cursor.execute('''
        SELECT * FROM blood_reports WHERE child_id = %s ORDER BY test_date DESC
    ''', (child_id,))
    
    reports = [dict(row) for row in cursor.fetchall()]
    return jsonify({'success': True, 'reports': reports})

@app.route('/api/children/<int:child_id>/blood-reports', methods=['POST'])
@require_auth
@require_roles('parent')
def add_blood_report(child_id):
    """Add blood report for a child"""
    data = request.json
    user = g.current_user
    
    db = get_db()
    cursor = get_cursor(db)
    
    # Verify ownership
    cursor.execute("SELECT parent_id FROM children WHERE id = %s", (child_id,))
    child = cursor.fetchone()
    if not child or child['parent_id'] != user['id']:
        return jsonify({'success': False, 'message': 'Access denied'}), 403
    
    cursor.execute('''
        INSERT INTO blood_reports (
            child_id, test_date, lab_name, hemoglobin, serum_iron, ferritin,
            vitamin_d, vitamin_b12, calcium, total_protein, albumin, folic_acid, zinc,
            analysis_result, recommendations
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    ''', (
        child_id,
        data.get('test_date'),
        data.get('lab_name'),
        data.get('hemoglobin'),
        data.get('serum_iron'),
        data.get('ferritin'),
        data.get('vitamin_d'),
        data.get('vitamin_b12'),
        data.get('calcium'),
        data.get('total_protein'),
        data.get('albumin'),
        data.get('folic_acid'),
        data.get('zinc'),
        data.get('analysis_result'),
        data.get('recommendations')
    ))
    
    db.commit()
    return jsonify({'success': True, 'message': 'Blood report added', 'id': cursor.lastrowid})

# ==================== Vaccinations Routes ====================

@app.route('/api/children/<int:child_id>/vaccinations', methods=['GET'])
@require_auth
def get_vaccinations(child_id):
    """Get vaccinations for a child"""
    db = get_db()
    cursor = get_cursor(db)
    
    cursor.execute('''
        SELECT v.*, s.vaccine_name, s.dose, s.disease_prevented, s.is_mandatory
        FROM vaccinations v
        JOIN vax_schedule s ON v.schedule_id = s.id
        WHERE v.child_id = %s
        ORDER BY v.alert_start_date ASC
    ''', (child_id,))
    
    vaccinations = [dict(row) for row in cursor.fetchall()]
    return jsonify({'success': True, 'vaccinations': vaccinations})

@app.route('/api/children/<int:child_id>/vaccinations/<int:vax_id>/complete', methods=['PUT'])
@require_auth
@require_roles('parent')
def mark_vaccination_complete(child_id, vax_id):
    """Mark a vaccination as complete"""
    data = request.json
    user = g.current_user
    
    db = get_db()
    cursor = get_cursor(db)
    
    # Verify ownership
    cursor.execute("SELECT parent_id FROM children WHERE id = %s", (child_id,))
    child = cursor.fetchone()
    if not child or child['parent_id'] != user['id']:
        return jsonify({'success': False, 'message': 'Access denied'}), 403
    
    # Get vaccine name for alert dismissal
    cursor.execute('''
        SELECT s.vaccine_name FROM vaccinations v
        JOIN vax_schedule s ON v.schedule_id = s.id
        WHERE v.id = %s AND v.child_id = %s
    ''', (vax_id, child_id))
    vax_row = cursor.fetchone()
    
    cursor.execute('''
        UPDATE vaccinations SET 
            status = 'completed',
            completed_date = %s,
            batch_number = %s,
            administered_by = %s
        WHERE id = %s AND child_id = %s
    ''', (
        data.get('completed_date', datetime.now().strftime('%Y-%m-%d')),
        data.get('batch_number'),
        data.get('administered_by'),
        vax_id,
        child_id
    ))
    
    # Auto-dismiss all related alerts for this child + vaccine
    if vax_row:
        cursor.execute('''
            UPDATE alerts SET is_dismissed = 1
            WHERE child_id = %s AND vax_name = %s AND is_dismissed = 0
        ''', (child_id, vax_row['vaccine_name']))
    
    db.commit()
    return jsonify({'success': True, 'message': 'Vaccination marked as complete'})

@app.route('/api/children/<int:child_id>/vaccinations/<int:vax_id>/status', methods=['PUT'])
@require_auth
@require_roles('parent', 'health_center')
def update_vaccination_status(child_id, vax_id):
    """Update vaccination status (parent or health center)"""
    data = request.json
    user = g.current_user
    new_status = data.get('status')

    if new_status not in ('completed', 'pending'):
        return jsonify({'success': False, 'message': 'Invalid status. Must be completed or pending'}), 400

    db = get_db()
    cursor = get_cursor(db)

    # Health center: verify child is in their region
    if user['role'] == 'health_center':
        cursor.execute('''
            SELECT c.id FROM children c WHERE c.id = %s AND c.region = %s
        ''', (child_id, user['region']))
        if not cursor.fetchone():
            return jsonify({'success': False, 'message': 'Child not in your region'}), 403
    else:  # parent
        cursor.execute("SELECT parent_id FROM children WHERE id = %s", (child_id,))
        child = cursor.fetchone()
        if not child or child['parent_id'] != user['id']:
            return jsonify({'success': False, 'message': 'Access denied'}), 403

    # Get vaccine name
    cursor.execute('''
        SELECT s.vaccine_name FROM vaccinations v
        JOIN vax_schedule s ON v.schedule_id = s.id
        WHERE v.id = %s AND v.child_id = %s
    ''', (vax_id, child_id))
    vax_row = cursor.fetchone()
    if not vax_row:
        return jsonify({'success': False, 'message': 'Vaccination not found'}), 404

    if new_status == 'completed':
        cursor.execute('''
            UPDATE vaccinations SET status = 'completed',
                completed_date = %s, last_alert_sent_date = NULL
            WHERE id = %s AND child_id = %s
        ''', (data.get('completed_date', datetime.now().strftime('%Y-%m-%d')), vax_id, child_id))
        # Dismiss all related pending alerts
        cursor.execute('''
            UPDATE alerts SET is_dismissed = 1
            WHERE child_id = %s AND vax_name = %s AND is_dismissed = 0
        ''', (child_id, vax_row['vaccine_name']))
    else:  # pending
        cursor.execute('''
            UPDATE vaccinations SET status = 'pending',
                completed_date = NULL, last_alert_sent_date = NULL
            WHERE id = %s AND child_id = %s
        ''', (vax_id, child_id))

    db.commit()
    return jsonify({'success': True, 'message': f'Vaccination status updated to {new_status}'})

# ==================== Alerts Routes ====================

@app.route('/api/alerts', methods=['GET'])
@require_auth
def get_alerts():
    """Get alerts for current user"""
    db = get_db()
    cursor = get_cursor(db)
    user = g.current_user
    user_id = user['id']
    role = user['role']
    region = user['region']
    
    query = '''
        SELECT * FROM alerts 
        WHERE is_dismissed = 0 
        AND (user_id = %s 
             OR (target_role = %s AND (target_region IS NULL OR target_region = %s))
        )
        ORDER BY created_at DESC
    '''
    cursor.execute(query, (user_id, role, region))
    
    alerts = [dict(row) for row in cursor.fetchall()]

    # Fetch role-specific overdue vaccinations
    overdue_vaccinations = []
    if role == 'parent':
        cursor.execute('''
            SELECT c.id AS child_id, c.name AS child_name, c.dob, c.region AS district,
                   u.phone AS parent_phone,
                   v.alert_start_date AS due_date,
                   v.deadline_date,
                   s.vaccine_name,
                   CASE WHEN v.deadline_date < CURDATE() THEN 'Delayed'
                        ELSE 'Due Soon' END AS vax_status
            FROM vaccinations v
            JOIN children c ON v.child_id = c.id
            JOIN users u ON c.parent_id = u.id
            JOIN vax_schedule s ON v.schedule_id = s.id
            WHERE c.parent_id = %s
              AND v.status = 'pending'
              AND v.alert_start_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
            ORDER BY v.deadline_date ASC
        ''', (user_id,))
        overdue_vaccinations = [dict(row) for row in cursor.fetchall()]
    elif role == 'health_center':
        cursor.execute('''
            SELECT c.id AS child_id, c.name AS child_name, c.dob, c.region AS district,
                   u.phone AS parent_phone, u.name AS parent_name,
                   v.alert_start_date AS due_date,
                   v.deadline_date,
                   s.vaccine_name,
                   CASE WHEN v.deadline_date < CURDATE() THEN 'Delayed'
                        ELSE 'Due Soon' END AS vax_status
            FROM vaccinations v
            JOIN children c ON v.child_id = c.id
            JOIN users u ON c.parent_id = u.id
            JOIN vax_schedule s ON v.schedule_id = s.id
            WHERE c.region = %s
              AND v.status = 'pending'
              AND v.alert_start_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
            ORDER BY v.deadline_date ASC
            LIMIT 50
        ''', (region,))
        overdue_vaccinations = [dict(row) for row in cursor.fetchall()]
    elif role == 'who':
        cursor.execute('''
            SELECT c.id AS child_id, c.name AS child_name, c.dob, c.region AS district,
                   u.name AS parent_name, u.phone AS parent_phone,
                   v.alert_start_date AS due_date,
                   v.deadline_date,
                   s.vaccine_name,
                   CASE WHEN v.deadline_date < CURDATE() THEN 'Delayed'
                        ELSE 'Due Soon' END AS vax_status
            FROM vaccinations v
            JOIN children c ON v.child_id = c.id
            JOIN users u ON c.parent_id = u.id
            JOIN vax_schedule s ON v.schedule_id = s.id
            WHERE v.status = 'pending'
              AND v.alert_start_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
            ORDER BY v.deadline_date ASC
            LIMIT 100
        ''')
        overdue_vaccinations = [dict(row) for row in cursor.fetchall()]

    return jsonify({'success': True, 'alerts': alerts, 'overdue_vaccinations': overdue_vaccinations})

@app.route('/api/alerts/<int:alert_id>/dismiss', methods=['PUT'])
@require_auth
def dismiss_alert(alert_id):
    """Dismiss an alert"""
    db = get_db()
    cursor = get_cursor(db)
    user = g.current_user
    
    cursor.execute('''
        UPDATE alerts SET is_dismissed = 1 WHERE id = %s AND user_id = %s
    ''', (alert_id, user['id']))
    
    db.commit()
    return jsonify({'success': True, 'message': 'Alert dismissed'})

# ==================== Nutrition Routes ====================

@app.route('/api/children/<int:child_id>/nutrition/recommendations', methods=['GET'])
@require_auth
def get_nutrition_recommendations(child_id):
    """Get nutrition recommendations for a child based on their health status"""
    db = get_db()
    cursor = get_cursor(db)
    
    # Get child info
    cursor.execute("SELECT * FROM children WHERE id = %s", (child_id,))
    child = cursor.fetchone()
    if not child:
        return jsonify({'success': False, 'message': 'Child not found'}), 404
    
    # Calculate age
    from datetime import datetime
    dob = datetime.strptime(str(child['dob']), '%Y-%m-%d') # Ensure string for strptime
    age_months = (datetime.now() - dob).days // 30
    
    # Determine age group for nutrition plans
    if age_months < 12:
        age_group = '6-12 months'
    elif age_months < 60:
        age_group = '1-5 years'
    else:
        age_group = '5-12 years'
    
    recommendations = {
        'deficiency_plans': [],
        'general_plans': []
    }
    
    # Check for deficiencies from latest blood report
    cursor.execute('''
        SELECT * FROM blood_reports WHERE child_id = %s ORDER BY test_date DESC LIMIT 1
    ''', (child_id,))
    blood_report = cursor.fetchone()
    
    deficiencies = []
    if blood_report:
        if blood_report['hemoglobin'] and blood_report['hemoglobin'] < 11:
            deficiencies.append('Iron Deficiency')
        if blood_report['vitamin_d'] and blood_report['vitamin_d'] < 20:
            deficiencies.append('Vitamin D Deficiency')
        if blood_report['calcium'] and blood_report['calcium'] < 8.5:
            deficiencies.append('Calcium Deficiency')
        if blood_report['total_protein'] and blood_report['total_protein'] < 6:
            deficiencies.append('Protein Deficiency')
    
    # Check for malnutrition from growth records
    cursor.execute('''
        SELECT assessment_result FROM growth_records WHERE child_id = %s ORDER BY recorded_date DESC LIMIT 1
    ''', (child_id,))
    growth = cursor.fetchone()
    
    if growth and 'Underweight' in (growth['assessment_result'] or ''):
        deficiencies.append('Underweight')
    
    # Load nutrition plans from JSON file
    import os
    plans_path = os.path.join(DATA_DIR, 'nutrition_plans.json')
    if os.path.exists(plans_path):
        with open(plans_path, 'r', encoding='utf-8') as f:
            plans_data = json.load(f)
            
            for plan in plans_data.get('plans', []):
                # Match by deficiency
                if plan['category'] in deficiencies:
                    if plan['age_group'] == age_group or plan['age_group'] == 'all':
                        recommendations['deficiency_plans'].append(plan)
                # Add general nutrition plan
                elif plan['category'] == 'General Nutrition':
                    if plan['age_group'] == age_group or age_group in plan['age_group']:
                        recommendations['general_plans'].append(plan)
    
    return jsonify({
        'success': True,
        'recommendations': recommendations,
        'detected_deficiencies': deficiencies,
        'age_group': age_group
    })

@app.route('/api/nutrition/plans', methods=['GET'])
@require_auth
def get_nutrition_plans():
    """Get all nutrition plans"""
    try:
        plans_path = os.path.join(DATA_DIR, 'nutrition_plans.json')
        if os.path.exists(plans_path):
            with open(plans_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return jsonify({'success': True, 'plans': data.get('plans', [])})
        else:
            return jsonify({'success': True, 'plans': []})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# ==================== Static File Routes ====================

@app.route('/')
def serve_index():
    """Serve the main index.html"""
    return send_from_directory(ROOT_DIR, 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files (CSS, JS, etc.)"""
    file_path = os.path.join(ROOT_DIR, filename)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return send_from_directory(ROOT_DIR, filename)
    return send_from_directory(ROOT_DIR, 'index.html')

# ==================== Run Server ====================

if __name__ == '__main__':
    print("Initializing database connection...")
    init_db()
    print(f"Starting server at http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
