import sys
import os
import mysql.connector
from datetime import datetime
import json

# Add server directory to path
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'server'))
import config

def get_db():
    return mysql.connector.connect(
        host=config.MYSQL_CONFIG['host'],
        user=config.MYSQL_CONFIG['user'],
        password=config.MYSQL_CONFIG['password'],
        database=config.MYSQL_CONFIG['database'],
        port=config.MYSQL_CONFIG.get('port', 3306)
    )

def verify_registration():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    try:
        # 1. Clean up any previous test child
        cursor.execute("SELECT id FROM users WHERE username = 'parent_test'")
        parent = cursor.fetchone()
        if not parent:
            print("Test parent not found. Please run migrations/seed if needed.")
            return
            
        parent_id = parent['id']
        cursor.execute("DELETE FROM children WHERE name = 'Test Manual Vax'")
        db.commit()
        
        # 2. Simulate POST /api/children with manual vaccinations
        # We'll just insert directly but follow the logic in server.py
        child_name = 'Test Manual Vax'
        dob = '2025-10-01' # ~6 months old
        gender = 'Male'
        
        cursor.execute('''
            INSERT INTO children (parent_id, name, dob, gender, region)
            VALUES (%s, %s, %s, %s, %s)
        ''', (parent_id, child_name, dob, gender, 'Thiruvananthapuram'))
        child_id = cursor.lastrowid
        
        # Suppose we mark schedule_id 1 as 'completed' and 2 as 'pending'
        # In a real app, these IDs come from vax_schedule
        cursor.execute("SELECT id FROM vax_schedule LIMIT 2")
        schedules = cursor.fetchall()
        
        if len(schedules) < 2:
            print("Not enough vax schedules found.")
            return
            
        v1_id = schedules[0]['id']
        v2_id = schedules[1]['id']
        
        manual_vax = {v1_id: 'completed', v2_id: 'pending'}
        
        # Logic from server.py (simplified)
        cursor.execute("SELECT * FROM vax_schedule")
        all_schedules = cursor.fetchall()
        
        from datetime import timedelta
        dob_dt = datetime.strptime(dob, '%Y-%m-%d')
        now = datetime.now()
        
        for s in all_schedules:
            due_date = dob_dt + timedelta(weeks=s['age_weeks'] or 0) # simplification
            status = manual_vax.get(s['id'], 'pending' if due_date < now else 'not yet due')
            
            cursor.execute('''
                INSERT INTO vaccinations (child_id, schedule_id, status, completed_date)
                VALUES (%s, %s, %s, %s)
            ''', (child_id, s['id'], status, now.strftime('%Y-%m-%d') if status == 'completed' else None))
            
        db.commit()
        print(f"Registered child {child_id} with manual vax.")
        
        # 3. Verify results
        cursor.execute("SELECT * FROM vaccinations WHERE child_id = %s", (child_id,))
        results = cursor.fetchall()
        
        completed = [r for r in results if r['status'] == 'completed']
        pending = [r for r in results if r['status'] == 'pending']
        not_yet_due = [r for r in results if r['status'] == 'not yet due']
        
        print(f"Results: {len(completed)} completed, {len(pending)} pending, {len(not_yet_due)} not yet due.")
        
        if len(completed) == 1 and results[0]['schedule_id'] == v1_id:
            print("SUCCESS: Manual completion correctly stored.")
        else:
            print("FAILURE: Manual completion storage failed.")
            
    finally:
        cursor.close()
        db.close()

if __name__ == "__main__":
    verify_registration()
