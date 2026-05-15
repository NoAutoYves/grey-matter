import os
import datetime
import subprocess
from dotenv import load_dotenv

load_dotenv()

# Database configuration
DB_NAME = os.environ.get("DB_NAME", "greymatter_db")
DB_USER = os.environ.get("DB_USER", "postgres")
DB_PASSWORD = os.environ.get("DB_PASSWORD")
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = os.environ.get("DB_PORT", "5432")

# Backup directory
BACKUP_DIR = os.path.join(os.path.dirname(__file__), "backups")
os.makedirs(BACKUP_DIR, exist_ok=True)

def create_backup():
    """Create a database backup"""
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = os.path.join(BACKUP_DIR, f"greymatter_backup_{timestamp}.sql")
    
    # Set password for pg_dump
    env = os.environ.copy()
    env["PGPASSWORD"] = DB_PASSWORD
    
    # Run pg_dump
    cmd = f"pg_dump -h {DB_HOST} -p {DB_PORT} -U {DB_USER} -d {DB_NAME} -f {backup_file}"
    
    try:
        result = subprocess.run(cmd, shell=True, env=env, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"✅ Backup created: {backup_file}")
            
            # Compress the backup
            compressed_file = f"{backup_file}.gz"
            with open(backup_file, 'rb') as f_in:
                import gzip
                with gzip.open(compressed_file, 'wb') as f_out:
                    f_out.write(f_in.read())
            
            # Remove uncompressed file
            os.remove(backup_file)
            print(f"✅ Compressed: {compressed_file}")
            
            # Clean old backups (keep last 30 days)
            clean_old_backups()
            
            return compressed_file
        else:
            print(f"❌ Backup failed: {result.stderr}")
            return None
            
    except Exception as e:
        print(f"❌ Backup error: {e}")
        return None

def clean_old_backups(days=30):
    """Delete backups older than specified days"""
    cutoff = datetime.datetime.now() - datetime.timedelta(days=days)
    
    for filename in os.listdir(BACKUP_DIR):
        filepath = os.path.join(BACKUP_DIR, filename)
        if os.path.isfile(filepath):
            file_time = datetime.datetime.fromtimestamp(os.path.getmtime(filepath))
            if file_time < cutoff:
                os.remove(filepath)
                print(f"🗑️ Deleted old backup: {filename}")

def restore_backup(backup_file):
    """Restore database from backup"""
    env = os.environ.copy()
    env["PGPASSWORD"] = DB_PASSWORD
    
    # Check if file is gzipped
    if backup_file.endswith('.gz'):
        import gzip
        with gzip.open(backup_file, 'rb') as f_in:
            sql_content = f_in.read().decode('utf-8')
        
        # Write to temp file
        temp_file = backup_file.replace('.gz', '_temp.sql')
        with open(temp_file, 'w') as f_out:
            f_out.write(sql_content)
        backup_file = temp_file
    
    cmd = f"psql -h {DB_HOST} -p {DB_PORT} -U {DB_USER} -d {DB_NAME} -f {backup_file}"
    
    try:
        result = subprocess.run(cmd, shell=True, env=env, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"✅ Database restored from: {backup_file}")
        else:
            print(f"❌ Restore failed: {result.stderr}")
            
    except Exception as e:
        print(f"❌ Restore error: {e}")
    
    # Clean up temp file
    if backup_file.endswith('_temp.sql') and os.path.exists(backup_file):
        os.remove(backup_file)

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "restore":
        if len(sys.argv) > 2:
            restore_backup(sys.argv[2])
        else:
            print("Usage: python backup_db.py restore <backup_file>")
    else:
        create_backup()