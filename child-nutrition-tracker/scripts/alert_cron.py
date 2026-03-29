import sys
import os
import mysql.connector
from datetime import datetime

# Add server directory to path to import config
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'server'))
import config

def get_db():
    return mysql.connector.connect(
        host=config.MYSQL_CONFIG['host'],
        user=config.MYSQL_CONFIG['user'],
        password=config.MYSQL_CONFIG['password'],
        database=config.MYSQL_CONFIG['database'],
        port=config.MYSQL_CONFIG.get('port', 3306)
    )

def calculate_age(dob):
    if isinstance(dob, str):
        dob = datetime.strptime(dob, '%Y-%m-%d').date()
    today = datetime.now().date()
    months = (today.year - dob.year) * 12 + today.month - dob.month
    if today.day < dob.day:
        months -= 1
    if months < 24:
        return f"{months}m"
    return f"{months // 12}y {months % 12}m"

def get_existing_alert(cursor, child_id, target_role, target_region, vax_name):
    """Get existing active alert for this child/vaccine/role combination."""
    query = '''
        SELECT id, vax_status FROM alerts 
        WHERE child_id = %s AND vax_name = %s AND is_dismissed = 0
    '''
    params = [child_id, vax_name]
    if target_role:
        query += " AND target_role = %s"
        params.append(target_role)
        if target_region:
            query += " AND target_region = %s"
            params.append(target_region)
        else:
            query += " AND target_region IS NULL"
    else:
        query += " AND target_role IS NULL"
    cursor.execute(query, tuple(params))
    return cursor.fetchone()

def process_daily_alerts():
    db = get_db()
    cursor = db.cursor(dictionary=True)

    try:
        # Fetch vaccinations needing alert (status = 'pending', due within 7 days or overdue)
        # 'not yet due' and 'completed' are explicitly excluded by status filter
        cursor.execute('''
            SELECT v.id, v.child_id, c.name as child_name, c.region as district, c.dob,
                   v.deadline_date, v.alert_start_date,
                   u.id as parent_user_id, u.name as parent_name,
                   s.vaccine_name
            FROM vaccinations v
            JOIN children c ON v.child_id = c.id AND c.is_active = 1
            JOIN users u ON c.parent_id = u.id
            JOIN vax_schedule s ON v.schedule_id = s.id
            WHERE v.status = 'pending'
              AND CURDATE() >= DATE_SUB(v.alert_start_date, INTERVAL 7 DAY)
        ''')

        pending_vax = cursor.fetchall()
        print(f"Analyzing {len(pending_vax)} pending vaccinations for alerts...")

        for vax in pending_vax:
            today = datetime.now().date()
            due_date = vax['alert_start_date']
            if isinstance(due_date, str):
                due_date = datetime.strptime(due_date, '%Y-%m-%d').date()

            # Determine alert status and severity
            if today < due_date:
                vax_status = "Due Soon"
                severity = "medium"
            else:
                vax_status = "Delayed"
                days_overdue = (today - due_date).days
                severity = "critical" if days_overdue > 10 else "high"

            age_str = calculate_age(vax['dob'])

            # Helper: upsert alert (update in-place if escalating, insert if new)
            def upsert_alert(target_role, target_region, alert_type, title, message):
                existing = get_existing_alert(cursor, vax['child_id'], target_role, target_region, vax['vaccine_name'])
                if existing:
                    # Escalate in-place if status changed (Due Soon → Delayed)
                    if existing['vax_status'] != vax_status:
                        cursor.execute('''
                            UPDATE alerts SET vax_status = %s, severity = %s, title = %s, message = %s
                            WHERE id = %s
                        ''', (vax_status, severity, title, message, existing['id']))
                    # Otherwise skip (already correct status, no duplicate)
                else:
                    # Insert new alert
                    if target_role:
                        cursor.execute('''
                            INSERT INTO alerts (child_id, target_role, target_region, alert_type, severity, title, message,
                                              vax_name, due_date, vax_status, child_age, parent_name, district)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ''', (vax['child_id'], target_role, target_region, alert_type, severity, title, message,
                              vax['vaccine_name'], due_date, vax_status, age_str, vax['parent_name'], vax['district']))
                    else:
                        cursor.execute('''
                            INSERT INTO alerts (child_id, user_id, alert_type, severity, title, message,
                                              vax_name, due_date, vax_status, child_age, parent_name, district)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ''', (vax['child_id'], vax['parent_user_id'], alert_type, severity, title, message,
                              vax['vaccine_name'], due_date, vax_status, age_str, vax['parent_name'], vax['district']))

            # 1. Parent alert (per-user)
            upsert_alert(
                None, None, 'VACCINATION',
                f"Vaccination {vax_status}: {vax['vaccine_name']}",
                f"{vax['vaccine_name']} for {vax['child_name']} is {vax_status.lower()} (due {due_date})."
            )

            # 2. Health Center alert (regional broadcast)
            upsert_alert(
                'health_center', vax['district'], 'VACCINATION_HC',
                f"Regional: {vax_status} - {vax['vaccine_name']}",
                f"{vax['child_name']} ({age_str}) — {vax['vaccine_name']} is {vax_status.lower()}."
            )

            # 3. WHO alert (state-wide broadcast)
            upsert_alert(
                'who', None, 'VACCINATION_WHO',
                f"State-wide: {vax_status} - {vax['vaccine_name']}",
                f"{vax['district']}: {vax['child_name']} — {vax['vaccine_name']} is {vax_status.lower()}."
            )

            # Update last alert date
            cursor.execute('UPDATE vaccinations SET last_alert_sent_date = CURDATE() WHERE id = %s', (vax['id'],))

        db.commit()
        print(f"Alerts processed: {len(pending_vax)} vaccinations evaluated.")

    except Exception as e:
        print(f"Error processing alerts: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        cursor.close()
        db.close()

if __name__ == "__main__":
    process_daily_alerts()
