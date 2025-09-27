# 🚀 CI/CD Deployment Guide: GitHub Actions → AWS EC2

## 1. Preparation (One-time setup)

### 1.1. EC2 instance
- Create an Ubuntu EC2 instance.
- Open Security Group:
  - Port 22 (SSH)
  - Application Port (3000 for Node, 8000 for Python, 8080 for Java, 80/443 if using Nginx).

### 1.2. Basic setup on EC2
```bash
sudo apt update
sudo apt install -y git curl unzip
```
Install runtime depending on framework:
- Node.js → `sudo apt install -y nodejs npm && sudo npm install -g pm2`
- Python → `sudo apt install -y python3 python3-pip python3-venv`
- Java → `sudo apt install -y openjdk-17-jdk maven`
- .NET → install SDK from Microsoft repo
- PHP/Laravel → `sudo apt install -y php-cli composer`

### 1.3. Project directory
```bash
sudo mkdir -p /var/www/myapp
sudo chown ubuntu:ubuntu /var/www/myapp
```

---

## 2. SSH Keys for CI/CD
On **local machine**:
```bash
ssh-keygen -t rsa -b 4096 -C "deploy key" -f myapp-key
```
- `myapp-key` → private key (keep secret, upload to GitHub Secrets).
- `myapp-key.pub` → public key (add to EC2).

Copy public key into EC2:
```bash
cat myapp-key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

---

## 3. GitHub Secrets
In GitHub repo → **Settings → Secrets → Actions**:
- `EC2_HOST` → EC2 Public IP (e.g., `54.123.45.67`)
- `EC2_SSH_KEY` → content of `myapp-key` (private key)
- `EC2_USER` → `ubuntu`

---

## 4. GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: CI/CD Deploy to EC2

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Deploy to EC2
        uses: appleboy/ssh-action@v0.1.10
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            set -e
            cd /var/www/myapp
            git fetch origin main
            git reset --hard origin/main
            ./deploy.sh
```

---

## 5. Deployment Scripts per Framework

### Node.js (Express, Next.js, NestJS)
**deploy.sh**
```bash
#!/bin/bash
npm install --production
pm2 restart myapp || pm2 start index.js --name myapp
```

If Next.js:
```bash
npm install
npm run build
pm2 restart myapp || pm2 start "npm run start" --name myapp
```

---

### Python (Django, Flask, FastAPI)
**deploy.sh**
```bash
#!/bin/bash
source venv/bin/activate || python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
if [ -f manage.py ]; then
  python manage.py migrate --noinput
  python manage.py collectstatic --noinput
fi
pkill gunicorn || true
nohup gunicorn app:app --bind 0.0.0.0:8000 --daemon
```

---

### Java (Spring Boot)
**deploy.sh**
```bash
#!/bin/bash
./mvnw clean package -DskipTests
pkill -f myapp.jar || true
nohup java -jar target/myapp.jar --server.port=8080 > app.log 2>&1 &
```

---

### .NET (ASP.NET Core)
**deploy.sh**
```bash
#!/bin/bash
dotnet publish -c Release -o out
pkill dotnet || true
nohup dotnet out/myapp.dll --urls "http://0.0.0.0:5000" > app.log 2>&1 &
```

---

### PHP (Laravel)
**deploy.sh**
```bash
#!/bin/bash
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
sudo systemctl restart apache2 || sudo systemctl restart nginx
```

---

### Dockerized App
**deploy.sh**
```bash
#!/bin/bash
docker-compose pull
docker-compose up -d --build
```

---

## 6. Verification & Debugging

- Check GitHub Actions logs.
- On EC2:
```bash
cd /var/www/myapp
git log -1 --oneline
pm2 list          # Node.js
ps aux | grep java  # Java
ps aux | grep dotnet # .NET
```

---

## 7. Production Tips
- Use **Nginx** reverse proxy (port 80/443).
- Enable **HTTPS** with Let’s Encrypt + Certbot.
- Use `pm2 reload` instead of restart for zero-downtime deploy.
- Separate build steps for heavy apps (React, Angular, Next.js).
- Backup DB before migrations.
- Logs: `pm2 logs`, `journalctl`, or centralized logging.

---

📖 With this cheatsheet, you can deploy any web framework (Node, Python, Java, .NET, PHP, Docker) to EC2 via GitHub Actions automatically.
