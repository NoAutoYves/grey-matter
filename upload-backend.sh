#!/bin/bash
set -e

REMOTE_ROOT="/var/www/greymatter"
STAGING="/tmp/gm-staging"

# Clear stale bytecode
sudo find "$REMOTE_ROOT/routes" "$REMOTE_ROOT/utils" -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true

# Copy application files
sudo cp "$STAGING/App.py" "$REMOTE_ROOT/App.py"
sudo cp "$STAGING/config_local.py" "$REMOTE_ROOT/config_local.py"
sudo cp "$STAGING/requirements.txt" "$REMOTE_ROOT/requirements.txt"
sudo cp "$STAGING"/utils/*.py "$REMOTE_ROOT/utils/"
sudo cp "$STAGING"/routes/*.py "$REMOTE_ROOT/routes/"
sudo mkdir -p "$REMOTE_ROOT/migrations"
sudo cp "$STAGING"/migrations/*.sql "$REMOTE_ROOT/migrations/"

# Run migrations in order
echo '--- Running migrations ---'
for f in "$REMOTE_ROOT"/migrations/*.sql; do
  echo "  -> $f"
  PGPASSWORD='GreyMatter2025' psql -h localhost -U greymatter_user -d greymatter_db -f "$f" || exit 1
done
echo '--- Migrations done ---'

# Fix ownership
sudo chown -R www-data:www-data \
  "$REMOTE_ROOT/routes/" \
  "$REMOTE_ROOT/utils/" \
  "$REMOTE_ROOT/migrations/" \
  "$REMOTE_ROOT/App.py" \
  "$REMOTE_ROOT/config_local.py" \
  "$REMOTE_ROOT/requirements.txt"

sudo chmod -R 755 \
  "$REMOTE_ROOT/routes/" \
  "$REMOTE_ROOT/utils/" \
  "$REMOTE_ROOT/migrations/"

# Clean up
rm -rf "$STAGING" /tmp/gm-backend.tar.gz

# Restart service
sudo systemctl restart greymatter
sleep 2
systemctl is-active greymatter