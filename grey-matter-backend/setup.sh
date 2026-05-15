#!/bin/bash

# Exit on error
set -e

echo "========================================="
echo "Grey Matter Server Setup"
echo "========================================="

# Update system
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
echo "Installing Python, Nginx, PostgreSQL, and Git..."
sudo apt install -y python3-pip python3-venv nginx postgresql postgresql-contrib git certbot python3-certbot-nginx

# Create application directories
echo "Creating application directories..."
sudo mkdir -p /var/www/greymatter
sudo mkdir -p /var/www/greymatter-frontend/dist
sudo mkdir -p /var/www/greymatter/uploads/avatars
sudo chown -R ubuntu:ubuntu /var/www/greymatter
sudo chown -R ubuntu:ubuntu /var/www/greymatter-frontend

# Setup PostgreSQL database
echo "Setting up PostgreSQL database..."
sudo -u postgres psql -c "CREATE DATABASE greymatter_db;"
sudo -u postgres psql -c "CREATE USER greymatter_user WITH PASSWORD 'GreyMatter2025';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE greymatter_db TO greymatter_user;"
sudo -u postgres psql -c "ALTER DATABASE greymatter_db OWNER TO greymatter_user;"

# Install Python dependencies
echo "Setting up Python virtual environment..."
cd /var/www/greymatter
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install flask flask-cors flask-limiter flask-wtf bcrypt psycopg2-binary email-validator password-validator phonenumbers python-dotenv bleach gunicorn

# Create systemd service for backend
echo "Creating systemd service..."
sudo tee /etc/systemd/system/greymatter.service > /dev/null << 'EOF'
[Unit]
Description=Grey Matter Flask App
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/var/www/greymatter
Environment="PATH=/var/www/greymatter/venv/bin"
ExecStart=/var/www/greymatter/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:5000 App:app
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Create Nginx configuration
echo "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/greymatter > /dev/null << 'EOF'
server {
    listen 80;
    server_name 18.132.41.103;

    root /var/www/greymatter-frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /auth/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /persona/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /uploads/ {
        alias /var/www/greymatter/uploads/;
    }
}
EOF

# Enable Nginx site
sudo ln -sf /etc/nginx/sites-available/greymatter /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Start and enable services
sudo systemctl daemon-reload
sudo systemctl enable greymatter
sudo systemctl start greymatter

# Configure firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

echo "========================================="
echo "Setup complete!"
echo "========================================="
echo "Next steps:"
echo "1. Upload your backend code to /var/www/greymatter"
echo "2. Upload your frontend build to /var/www/greymatter-frontend/dist"
echo "3. Create .env file in /var/www/greymatter"
echo "4. Run: sudo systemctl restart greymatter"
echo "========================================="