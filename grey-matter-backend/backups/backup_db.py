import os
import datetime
import subprocess
from dotenv import load_dotenv
import glob

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

# ============================================================
# BATCH BACKUP FUNCTIONS
# ============================================================

def list_backups():
    """List all available backups with details"""
    backups = []
    for filepath in glob.glob(os.path.join(BACKUP_DIR, "*.gz")):
        filename = os.path.basename(filepath)
        size = os.path.getsize(filepath)
        modified = datetime.datetime.fromtimestamp(os.path.getmtime(filepath))
        
        # Parse timestamp from filename
        try:
            timestamp_str = filename.replace("greymatter_backup_", "").replace(".sql.gz", "")
            timestamp = datetime.datetime.strptime(timestamp_str, "%Y%m%d_%H%M%S")
        except ValueError:
            timestamp = modified
        
        backups.append({
            "filename": filename,
            "filepath": filepath,
            "size_bytes": size,
            "size_mb": round(size / (1024 * 1024), 2),
            "created_at": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "modified_at": modified.strftime("%Y-%m-%d %H:%M:%S")
        })
    
    # Sort by timestamp (newest first)
    backups.sort(key=lambda x: x["created_at"], reverse=True)
    return backups

def batch_cleanup_backups(keep_count=10):
    """Keep only the N most recent backups, delete the rest"""
    backups = list_backups()
    
    if len(backups) <= keep_count:
        print(f"✅ Only {len(backups)} backups found. Keeping all.")
        return
    
    to_delete = backups[keep_count:]
    print(f"🗑️ Deleting {len(to_delete)} old backups...")
    
    for backup in to_delete:
        try:
            os.remove(backup["filepath"])
            print(f"   Deleted: {backup['filename']} ({backup['size_mb']} MB)")
        except OSError as e:
            print(f"   ❌ Failed to delete {backup['filename']}: {e}")

def backup_specific_tables(tables, backup_name=None):
    """Backup only specific tables"""
    if not backup_name:
        backup_name = f"partial_backup_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    backup_file = os.path.join(BACKUP_DIR, f"{backup_name}.sql")
    
    env = os.environ.copy()
    env["PGPASSWORD"] = DB_PASSWORD
    
    # Build table list
    table_args = " ".join([f"-t {table}" for table in tables])
    
    cmd = f"pg_dump -h {DB_HOST} -p {DB_PORT} -U {DB_USER} -d {DB_NAME} {table_args} -f {backup_file}"
    
    try:
        result = subprocess.run(cmd, shell=True, env=env, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"✅ Partial backup created: {backup_file}")
            print(f"   Tables: {', '.join(tables)}")
            
            # Compress
            compressed_file = f"{backup_file}.gz"
            with open(backup_file, 'rb') as f_in:
                import gzip
                with gzip.open(compressed_file, 'wb') as f_out:
                    f_out.write(f_in.read())
            os.remove(backup_file)
            
            return compressed_file
        else:
            print(f"❌ Partial backup failed: {result.stderr}")
            return None
            
    except Exception as e:
        print(f"❌ Partial backup error: {e}")
        return None

def backup_batch(backup_type="full", tables=None, keep_count=10):
    """Batch backup - can do full or partial backups"""
    print(f"🔄 Starting batch backup ({backup_type})...")
    
    if backup_type == "full":
        result = create_backup()
        if result:
            print("✅ Batch backup completed successfully")
        else:
            print("❌ Batch backup failed")
        return result
    
    elif backup_type == "partial":
        if not tables:
            print("❌ No tables specified for partial backup")
            return None
        
        result = backup_specific_tables(tables)
        if result:
            print("✅ Batch partial backup completed successfully")
        else:
            print("❌ Batch partial backup failed")
        return result
    
    else:
        print(f"❌ Unknown backup type: {backup_type}")
        return None

def restore_batch(backup_file, tables=None):
    """Restore database from backup (full or partial)"""
    if not os.path.exists(backup_file):
        print(f"❌ Backup file not found: {backup_file}")
        return False
    
    env = os.environ.copy()
    env["PGPASSWORD"] = DB_PASSWORD
    
    # Check if file is gzipped
    if backup_file.endswith('.gz'):
        import gzip
        with gzip.open(backup_file, 'rb') as f_in:
            sql_content = f_in.read().decode('utf-8')
        
        temp_file = backup_file.replace('.gz', '_temp.sql')
        with open(temp_file, 'w') as f_out:
            f_out.write(sql_content)
        backup_file = temp_file
    
    cmd = f"psql -h {DB_HOST} -p {DB_PORT} -U {DB_USER} -d {DB_NAME} -f {backup_file}"
    
    try:
        result = subprocess.run(cmd, shell=True, env=env, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"✅ Database restored from: {backup_file}")
            return True
        else:
            print(f"❌ Restore failed: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Restore error: {e}")
        return False
    finally:
        # Clean up temp file
        if backup_file.endswith('_temp.sql') and os.path.exists(backup_file):
            os.remove(backup_file)

def get_backup_stats():
    """Get statistics about backups"""
    backups = list_backups()
    
    if not backups:
        return {
            "total_backups": 0,
            "total_size_mb": 0,
            "oldest": None,
            "newest": None,
            "average_size_mb": 0
        }
    
    total_size = sum(b["size_bytes"] for b in backups)
    
    return {
        "total_backups": len(backups),
        "total_size_mb": round(total_size / (1024 * 1024), 2),
        "oldest": backups[-1]["created_at"] if backups else None,
        "newest": backups[0]["created_at"] if backups else None,
        "average_size_mb": round((total_size / len(backups)) / (1024 * 1024), 2) if backups else 0
    }

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        action = sys.argv[1]
        
        if action == "restore":
            if len(sys.argv) > 2:
                restore_backup(sys.argv[2])
            else:
                print("Usage: python backup_db.py restore <backup_file>")
        
        elif action == "list":
            backups = list_backups()
            if backups:
                print(f"\n📋 Available Backups ({len(backups)} found):")
                print("-" * 80)
                for b in backups:
                    print(f"  {b['filename']}")
                    print(f"    Created: {b['created_at']} | Size: {b['size_mb']} MB")
                print("-" * 80)
            else:
                print("📋 No backups found.")
        
        elif action == "stats":
            stats = get_backup_stats()
            print("\n📊 Backup Statistics:")
            print(f"  Total backups: {stats['total_backups']}")
            print(f"  Total size: {stats['total_size_mb']} MB")
            print(f"  Average size: {stats['average_size_mb']} MB")
            print(f"  Newest: {stats['newest']}")
            print(f"  Oldest: {stats['oldest']}")
        
        elif action == "cleanup":
            keep = int(sys.argv[2]) if len(sys.argv) > 2 else 10
            batch_cleanup_backups(keep)
        
        elif action == "partial":
            if len(sys.argv) > 2:
                tables = sys.argv[2].split(',')
                backup_specific_tables(tables)
            else:
                print("Usage: python backup_db.py partial table1,table2,table3")
        
        elif action == "batch":
            if len(sys.argv) > 2:
                backup_type = sys.argv[2]
                if backup_type == "partial" and len(sys.argv) > 3:
                    tables = sys.argv[3].split(',')
                    backup_batch("partial", tables)
                else:
                    backup_batch("full")
            else:
                backup_batch("full")
        
        else:
            print("""
Usage: python backup_db.py [action] [options]

Actions:
  (no args)          Create a full backup
  restore <file>     Restore from backup file
  list               List all backups
  stats              Show backup statistics
  cleanup [N]        Keep N most recent backups (default: 10)
  partial table1,t2  Backup only specific tables
  batch [full|partial] [tables]  Batch backup operation

Examples:
  python backup_db.py                    # Create full backup
  python backup_db.py restore backup.gz  # Restore backup
  python backup_db.py list               # List all backups
  python backup_db.py cleanup 20         # Keep 20 newest backups
  python backup_db.py partial users,exercises  # Backup specific tables
  python backup_db.py batch partial users,exercises  # Batch partial backup
""")
    else:
        create_backup()