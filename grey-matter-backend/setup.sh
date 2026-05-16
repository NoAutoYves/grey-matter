#!/bin/bash

# Update system
sudo apt update && sudo apt upgrade -y

# Install Python, PostgreSQL, Nginx, Git
sudo apt install python3-pip python3-venv nginx postgresql postgresql-contrib git certbot python3-certbot-nginx -y

# Create directories
sudo mkdir -p /var/www/greymatter-frontend/dist
sudo chown -R ubuntu:ubuntu /var/www

# Set up PostgreSQL
sudo -u postgres psql -c "CREATE DATABASE greymatter_db;"
sudo -u postgres psql -c "CREATE USER greymatter_user WITH PASSWORD 'GreyMatter2025';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE greymatter_db TO greymatter_user;"
sudo -u postgres psql -c "ALTER DATABASE greymatter_db OWNER TO greymatter_user;"

# Set up Python virtual environment
cd /var/www/greymatter
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn psycopg2-binary

# Create systemd service
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

[Install]
WantedBy=multi-user.target
EOF

# Start backend service
sudo systemctl daemon-reload
sudo systemctl start greymatter
sudo systemctl enable greymatter

# Create Nginx config
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
sudo ln -s /etc/nginx/sites-available/greymatter /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Open firewall ports
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

echo "Setup complete!"