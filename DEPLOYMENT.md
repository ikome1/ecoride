# 🚀 Guide de Déploiement - EcoRide

Ce document décrit les différentes méthodes de déploiement de l'application EcoRide en environnement de production.

---

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Déploiement avec Docker (Recommandé)](#déploiement-avec-docker-recommandé)
3. [Déploiement sur serveur VPS/Dédié](#déploiement-sur-serveur-vpsdédié)
4. [Déploiement sur Heroku](#déploiement-sur-heroku)
5. [Configuration de la base de données](#configuration-de-la-base-de-données)
6. [Configuration de sécurité](#configuration-de-sécurité)
7. [Monitoring et logs](#monitoring-et-logs)
8. [Sauvegarde](#sauvegarde)

---

## Prérequis

### Système d'exploitation
- **Linux** : Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **Windows Server** : Windows Server 2019+
- **macOS** : macOS 11+ (pour développement uniquement)

### Logiciels requis
- **PHP** : Version 8.1 ou supérieure
- **MySQL** : Version 8.0 ou supérieure
- **MongoDB** : Version 7.0 ou supérieure (pour les logs)
- **Apache** : Version 2.4 ou supérieure (ou Nginx)
- **Docker** : Version 20.10+ (optionnel, pour déploiement containerisé)
- **Composer** : Version 2.0+ (pour les dépendances PHP)

### Extensions PHP requises
```bash
- pdo
- pdo_mysql
- mongodb
- json
- mbstring
- openssl
- gd
- curl
```

---

## Déploiement avec Docker (Recommandé)

### Avantages
- ✅ Configuration automatique
- ✅ Isolation des services
- ✅ Facile à déployer et maintenir
- ✅ Compatible avec tous les environnements

### Étape 1 : Préparer le serveur

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Vérifier l'installation
docker --version
docker-compose --version
```

### Étape 2 : Cloner le projet

```bash
# Cloner le dépôt
git clone https://github.com/ikome1/ecoride.git
cd ecoride

# Vérifier que les fichiers sont présents
ls -la
```

### Étape 3 : Configuration

#### 3.1 Variables d'environnement (optionnel)

Créer un fichier `.env` à la racine du projet :

```env
# Base de données MySQL
DB_HOST=db
DB_NAME=ecoride
DB_USER=ecoride_user
DB_PASS=ecoride_password

# MongoDB
MONGO_HOST=mongodb
MONGO_PORT=27017
MONGO_DB=ecoride_logs

# Sécurité (à générer)
APP_SECRET_KEY=votre_cle_secrete_ici
```

#### 3.2 Générer une clé secrète

```bash
# Générer une clé secrète aléatoire
openssl rand -base64 32
```

### Étape 4 : Démarrage

```bash
# Construire et démarrer les conteneurs
docker-compose up -d

# Vérifier que tout fonctionne
docker-compose ps

# Voir les logs
docker-compose logs -f
```

### Étape 5 : Configuration du reverse proxy (Nginx)

Créer un fichier `/etc/nginx/sites-available/ecoride` :

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activer le site :

```bash
sudo ln -s /etc/nginx/sites-available/ecoride /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Étape 6 : Configuration SSL (Let's Encrypt)

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir un certificat SSL
sudo certbot --nginx -d votre-domaine.com

# Le certificat sera renouvelé automatiquement
```

---

## Déploiement sur serveur VPS/Dédié

### Étape 1 : Installation des dépendances

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer PHP 8.1
sudo apt install php8.1 php8.1-cli php8.1-fpm php8.1-mysql php8.1-mongodb \
    php8.1-mbstring php8.1-xml php8.1-curl php8.1-gd php8.1-zip

# Installer Apache
sudo apt install apache2

# Installer MySQL
sudo apt install mysql-server

# Installer MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
```

### Étape 2 : Configuration MySQL

```bash
# Sécuriser MySQL
sudo mysql_secure_installation

# Créer la base de données
sudo mysql -u root -p
```

Dans MySQL :

```sql
CREATE DATABASE ecoride CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ecoride_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON ecoride.* TO 'ecoride_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Importer le schéma :

```bash
mysql -u ecoride_user -p ecoride < database/ecoride.sql
```

### Étape 3 : Configuration MongoDB

```bash
# Démarrer MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Créer la base de données (se fera automatiquement au premier accès)
mongo
```

Dans MongoDB :

```javascript
use ecoride_logs
db.createCollection("activity_logs")
db.createCollection("search_logs")
db.createCollection("realtime_stats")
exit
```

### Étape 4 : Déployer l'application

```bash
# Cloner le projet
cd /var/www
sudo git clone https://github.com/ikome1/ecoride.git
cd ecoride

# Configurer les permissions
sudo chown -R www-data:www-data /var/www/ecoride
sudo chmod -R 755 /var/www/ecoride

# Configurer Apache
sudo cp /etc/apache2/sites-available/000-default.conf /etc/apache2/sites-available/ecoride.conf
sudo nano /etc/apache2/sites-available/ecoride.conf
```

Configuration Apache :

```apache
<VirtualHost *:80>
    ServerName votre-domaine.com
    DocumentRoot /var/www/ecoride
    
    <Directory /var/www/ecoride>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/ecoride_error.log
    CustomLog ${APACHE_LOG_DIR}/ecoride_access.log combined
</VirtualHost>
```

Activer le site :

```bash
sudo a2enmod rewrite
sudo a2ensite ecoride
sudo systemctl restart apache2
```

### Étape 5 : Configuration de l'application

Modifier `api/config.php` si nécessaire :

```php
// Pour un serveur dédié, utiliser localhost
$this->host = 'localhost';
$this->db_name = 'ecoride';
$this->username = 'ecoride_user';
$this->password = 'votre_mot_de_passe';
```

---

## Déploiement sur Heroku

### Étape 1 : Préparer l'application

Créer un fichier `Procfile` :

```
web: vendor/bin/heroku-php-apache2
```

Créer un fichier `composer.json` :

```json
{
    "require": {
        "php": "^8.1",
        "ext-pdo": "*",
        "ext-pdo_mysql": "*",
        "ext-mongodb": "*"
    }
}
```

### Étape 2 : Déployer

```bash
# Installer Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Se connecter
heroku login

# Créer l'application
heroku create ecoride-app

# Ajouter les add-ons
heroku addons:create cleardb:ignite
heroku addons:create mongolab:sandbox

# Configurer les variables d'environnement
heroku config:set DB_HOST=...
heroku config:set DB_NAME=...
# etc.

# Déployer
git push heroku main
```

---

## Configuration de la base de données

### MySQL

#### Optimisation des performances

```sql
-- Dans MySQL
SET GLOBAL innodb_buffer_pool_size = 1G;
SET GLOBAL max_connections = 200;
SET GLOBAL query_cache_size = 64M;
```

#### Sauvegarde automatique

Créer un script `/usr/local/bin/backup-ecoride.sh` :

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/ecoride"
mkdir -p $BACKUP_DIR
mysqldump -u ecoride_user -p ecoride > $BACKUP_DIR/ecoride_$DATE.sql
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

Ajouter au crontab :

```bash
0 2 * * * /usr/local/bin/backup-ecoride.sh
```

### MongoDB

#### Configuration de réplication (optionnel)

```javascript
// Dans MongoDB
rs.initiate({
    _id: "ecoride-rs",
    members: [
        { _id: 0, host: "localhost:27017" }
    ]
})
```

---

## Configuration de sécurité

### 1. Firewall

```bash
# Configurer UFW
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Sécuriser MySQL

```bash
# Ne pas exposer MySQL sur Internet
# Modifier /etc/mysql/mysql.conf.d/mysqld.cnf
bind-address = 127.0.0.1
```

### 3. Sécuriser MongoDB

```bash
# Créer un utilisateur admin
mongo
use admin
db.createUser({
    user: "admin",
    pwd: "mot_de_passe_fort",
    roles: ["root"]
})
exit

# Activer l'authentification dans /etc/mongod.conf
security:
  authorization: enabled
```

### 4. HTTPS obligatoire

Modifier `.htaccess` :

```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### 5. Headers de sécurité

Ajouter dans `api/config.php` :

```php
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
```

---

## Monitoring et logs

### 1. Logs Apache

```bash
# Voir les logs en temps réel
tail -f /var/log/apache2/ecoride_access.log
tail -f /var/log/apache2/ecoride_error.log
```

### 2. Logs MySQL

```bash
# Activer les logs dans /etc/mysql/mysql.conf.d/mysqld.cnf
general_log = 1
general_log_file = /var/log/mysql/general.log
```

### 3. Monitoring avec MongoDB

Les logs d'activité sont automatiquement stockés dans MongoDB. Pour les consulter :

```javascript
// Se connecter à MongoDB
mongo ecoride_logs

// Voir les dernières activités
db.activity_logs.find().sort({timestamp: -1}).limit(10)

// Statistiques de recherche
db.search_logs.aggregate([
    {$group: {_id: "$search_params.depart", count: {$sum: 1}}},
    {$sort: {count: -1}},
    {$limit: 10}
])
```

### 4. Monitoring système

```bash
# Installer des outils de monitoring
sudo apt install htop iotop nethogs

# Surveiller les ressources
htop
```

---

## Sauvegarde

### Stratégie de sauvegarde recommandée

1. **Sauvegarde quotidienne** : Base de données MySQL
2. **Sauvegarde hebdomadaire** : Fichiers de l'application
3. **Sauvegarde mensuelle** : MongoDB (logs)

### Script de sauvegarde complet

Créer `/usr/local/bin/backup-ecoride-full.sh` :

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/ecoride"
mkdir -p $BACKUP_DIR

# Sauvegarder MySQL
mysqldump -u ecoride_user -p ecoride > $BACKUP_DIR/mysql_$DATE.sql

# Sauvegarder les fichiers
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/ecoride

# Sauvegarder MongoDB
mongodump --db ecoride_logs --out $BACKUP_DIR/mongodb_$DATE

# Compresser MongoDB
tar -czf $BACKUP_DIR/mongodb_$DATE.tar.gz $BACKUP_DIR/mongodb_$DATE

# Supprimer les sauvegardes de plus de 30 jours
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

Ajouter au crontab :

```bash
0 3 * * * /usr/local/bin/backup-ecoride-full.sh
```

---

## Vérification post-déploiement

### Checklist

- [ ] L'application est accessible via HTTPS
- [ ] La base de données MySQL est accessible
- [ ] MongoDB est accessible et fonctionne
- [ ] Les logs sont enregistrés correctement
- [ ] Les sauvegardes sont configurées
- [ ] Le firewall est activé
- [ ] Les certificats SSL sont valides
- [ ] Les performances sont acceptables

### Tests à effectuer

```bash
# Tester la connexion MySQL
mysql -u ecoride_user -p ecoride -e "SELECT COUNT(*) FROM users;"

# Tester MongoDB
mongo ecoride_logs --eval "db.stats()"

# Tester l'API
curl https://votre-domaine.com/api/auth.php?action=check-session
```

---

## Support

En cas de problème lors du déploiement :

1. Vérifier les logs : `docker-compose logs` ou `/var/log/apache2/`
2. Vérifier les permissions des fichiers
3. Vérifier la configuration de la base de données
4. Consulter la documentation : `README.md`

---

**Bon déploiement ! 🚀**

