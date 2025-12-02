# Guide d'installation EcoRide

## 👨‍🏫 Pour le professeur / Correcteur

Salut ! 👋 Ce guide est fait pour vous faciliter la correction du projet.

**Docker n'est pas obligatoire !** Le projet fonctionne avec deux méthodes :

### Option 1 : Docker (RECOMMANDÉ - Le plus simple) ⭐

**Prérequis** : Avoir Docker Desktop installé sur votre PC

**C'est tout ce qu'il faut faire :**
```bash
# 1. Ouvrir un terminal dans le dossier du projet
cd EcoRide--main

# 2. Lancer cette commande
docker-compose up -d

# 3. Attendre 30 secondes (première fois : 2-3 minutes pour télécharger les images)

# 4. Ouvrir dans le navigateur
http://localhost:8080
```

**C'est tout !** 🎉

**Ce qui se passe automatiquement :**
- ✅ PHP 8.1 + Apache installés et configurés
- ✅ MySQL 8.0 installé et démarré
- ✅ Toutes les extensions PHP installées (PDO uniquement)
- ✅ Base de données `ecoride` créée automatiquement
- ✅ Fichier SQL importé automatiquement (tables + données de test)
- ✅ Comptes de test créés automatiquement
- ✅ Configuration automatique (pas besoin de modifier `config.php`)

**Aucune configuration manuelle nécessaire !** Le fichier `api/config.php` détecte automatiquement si vous êtes dans Docker ou XAMPP.

### Option 2 : XAMPP (Alternative classique)

Si vous préférez XAMPP, il faut :
1. Installer XAMPP (avec PHP 8.1 minimum)
2. Créer la base de données manuellement
3. Importer le fichier SQL
4. Configurer les extensions PHP

**Les deux méthodes fonctionnent parfaitement.** Choisissez celle que vous préférez ! 😊

---

## 📋 Ce qu'il faut avoir sur son PC

### Versions nécessaires

Pour faire tourner le projet, il vous faut :
- **PHP** : version 8.1 ou plus récente (8.2, 8.3, ça marche aussi) moi j'utilise PHP 8.1
- **MySQL** : version 5.7 minimum, mais 8.0 c'est mieux
- **Apache** : version 2.4 ou plus récente

### Extensions PHP à avoir

Le projet utilise ces extensions PHP :
- `pdo` et `pdo_mysql` - Pour parler à MySQL (base de données SQL)
- `json` - Pour gérer les données JSON (généralement déjà là)
- `mbstring` - Pour les caractères spéciaux
- `openssl` - Pour la sécurité

### Comment vérifier ce que vous avez ?

Ouvrez un terminal et tapez :
```bash
# Voir votre version de PHP
php -v

# Voir toutes les extensions installées
php -m

# Voir votre version de MySQL
mysql --version

```

Si vous utilisez XAMPP, vous pouvez aussi créer un fichier `phpinfo.php` dans `htdocs/` avec juste `<?php phpinfo(); ?>` dedans, puis ouvrir `http://localhost/phpinfo.php` dans votre navigateur pour voir tout ce qui est installé.

---

## 🚀 Installation avec XAMPP

### Étape 1 : Installer XAMPP

1. Téléchargez XAMPP depuis https://www.apachefriends.org/
2. **Important** : Prenez une version qui a PHP 8.1 ou plus récent
   - Pour Windows : Version avec PHP 8.1+
   - Pour Mac : Version avec PHP 8.1+
   - Pour Linux : Version avec PHP 8.1+
3. Installez-le (par défaut dans `C:\xampp\` sur Windows ou `/Applications/XAMPP/` sur Mac)
4. Démarrez Apache et MySQL dans le panneau de contrôle XAMPP
5. Pour vérifier que PHP 8.1+ est bien là, ouvrez un terminal et tapez `php -v`

### Étape 2 : Créer la base de données

1. Ouvrez phpMyAdmin : `http://localhost/phpmyadmin`
2. Créez une nouvelle base de données appelée `ecoride`
3. Importez le fichier `database/ecoride.sql` qui est dans le projet

### Étape 3 : Mettre les fichiers au bon endroit

Copiez tout le dossier du projet dans :
- Windows : `C:\xampp\htdocs\ecoride\`
- Mac : `/Applications/XAMPP/htdocs/ecoride/`

### Étape 4 : C'est parti !

Ouvrez votre navigateur et allez sur :
```
http://localhost/ecoride/
```

---

## 🐳 Installation avec Docker

### Étape 1 : Installer Docker (si pas déjà installé)

**Télécharger Docker Desktop :**
- Windows/Mac : https://www.docker.com/products/docker-desktop
- Linux : Installer Docker et Docker Compose via votre gestionnaire de paquets

**Vérifier l'installation :**
```bash
docker --version
docker-compose --version
```

### Étape 2 : Lancer le projet (UNE SEULE COMMANDE !)

Ouvrez un terminal dans le dossier du projet et tapez :
```bash
docker-compose up -d
```

**C'est la seule commande nécessaire !** 🚀

### Étape 3 : Attendre le démarrage

- **Première fois** : 2-3 minutes (Docker télécharge les images PHP, MySQL)
- **Fois suivantes** : 30 secondes environ

Vous pouvez vérifier que tout démarre avec :
```bash
docker-compose ps
```

Vous devriez voir 2 services en cours d'exécution :
- `web` (votre application PHP)
- `db` (MySQL)

### Étape 4 : Accéder à l'application

Ouvrez votre navigateur sur :
```
http://localhost:8080
```

**C'est tout !** 🎉

### Ce qui est fait automatiquement

Quand vous lancez `docker-compose up -d`, Docker :

1. **Télécharge et installe automatiquement :**
   - PHP 8.1 avec Apache
   - MySQL 8.0

2. **Installe toutes les extensions PHP nécessaires :**
   - `pdo` et `pdo_mysql` (pour MySQL)
   - `gd` (pour les images)
   - `mod_rewrite` (pour Apache)

3. **Configure et démarre MySQL :**
   - Crée la base de données `ecoride` automatiquement
   - Importe le fichier `database/ecoride.sql` automatiquement
   - Crée tous les comptes de test

4. **Configure les connexions :**
   - L'application se connecte automatiquement à MySQL (via `db`)
   - **Aucune modification de `config.php` nécessaire !** Le fichier détecte automatiquement Docker.

5. **Démarre tous les services :**
   - Application web sur le port 8080
   - MySQL sur le port 3306

**Résultat :** Vous avez une application complètement fonctionnelle avec **100% SQL (MySQL uniquement)** sans aucune configuration manuelle !

### Commandes utiles pour Docker

```bash
# Voir si tout tourne bien
docker-compose ps

# Voir les logs (pour débugger si besoin)
docker-compose logs -f

# Arrêter l'application
docker-compose down

# Tout réinitialiser (base de données incluse)
docker-compose down -v
```

---

## 🔧 Configuration de la base de données

### Détection automatique de l'environnement

Le fichier `api/config.php` détecte automatiquement si vous êtes dans Docker ou XAMPP :

- **Avec Docker** : Utilise automatiquement les variables d'environnement (`DB_HOST=db`, etc.)
- **Avec XAMPP** : Utilise la configuration par défaut (`localhost`, `root`, etc.)

**Vous n'avez RIEN à modifier dans `config.php` !** 🎉

### Si vous utilisez XAMPP et voulez modifier la config

Si vous utilisez XAMPP et que vous avez changé les paramètres MySQL, modifiez `api/config.php` :
```php
private $host = 'localhost';
private $db_name = 'ecoride';
private $username = 'root';
private $password = ''; // Mettez votre mot de passe MySQL si vous en avez un
```

### Infos sur MySQL

- **Version** : MySQL 5.7 minimum, mais 8.0 c'est mieux
- **Charset** : utf8mb4 (déjà configuré dans le fichier SQL)
- **Port** : 3306 par défaut

---

## 🧪 Tester que tout fonctionne

### Test 1 : Se connecter
1. Allez sur `http://localhost/ecoride/login.html` (ou `http://localhost:8080/login.html` avec Docker)
2. Utilisez un des comptes de test :
   - **Utilisateur** : `user` / `user123`
   - **Admin** : `admin` / `admin123`
   - **Employés** : `employe1` à `employe5` / `employe123`

### Test 2 : Créer un compte
1. Allez sur la page d'inscription
2. Créez un nouveau compte
3. Vérifiez que vous avez bien 20 crédits au départ

### Test 3 : Chercher un covoiturage
1. Sur la page d'accueil, cherchez "Paris" avec la date "2025-10-20"
2. Vous devriez voir des covoiturages s'afficher

### Test 4 : Réserver un trajet
1. Connectez-vous avec un compte utilisateur
2. Cliquez sur "Participer" sur un covoiturage
3. Vérifiez que vos crédits sont bien déduits

---

## 🐛 Si ça ne marche pas...

### Erreur : "Version PHP trop ancienne"
Votre PHP est peut-être trop vieux. Vérifiez avec `php -v`. Il faut PHP 8.1 minimum.

**Solution** : Mettez à jour XAMPP ou installez une version plus récente de PHP.

### Erreur : "Extension PHP manquante"
Il manque peut-être une extension. Vérifiez avec `php -m | grep pdo_mysql`.

**Solution** : 
1. Ouvrez le fichier `php.ini` de XAMPP (généralement dans `C:\xampp\php\php.ini`)
2. Cherchez la ligne avec `extension=pdo_mysql` et enlevez le `;` devant
3. Redémarrez Apache

### Erreur : "Impossible de se connecter à la base de données"

**Si vous utilisez Docker :**
- Vérifiez que tous les conteneurs sont démarrés : `docker-compose ps`
- Vérifiez les logs : `docker-compose logs db` (pour MySQL)
- Attendez 30 secondes après `docker-compose up -d` (MySQL a besoin de temps pour démarrer)
- Vérifiez que le fichier `database/ecoride.sql` existe bien

**Si vous utilisez XAMPP :**
- MySQL est bien démarré dans XAMPP ?
- Les paramètres dans `api/config.php` sont corrects ?
- La base de données `ecoride` existe bien ?
- Votre version de MySQL est compatible ?

### Erreur 500 (erreur serveur)

**Si vous utilisez Docker :**
```bash
# Voir les logs de l'application
docker-compose logs web

# Voir tous les logs
docker-compose logs
```

**Si vous utilisez XAMPP :**
Regardez les logs Apache dans XAMPP pour voir ce qui ne va pas. Ça peut être :
- Un problème de permissions sur les fichiers
- Une erreur de syntaxe PHP
- Une extension manquante

### Erreur CORS
Normalement, les en-têtes CORS sont déjà configurés dans `config.php`. Si vous avez une erreur :
- Vérifiez la console du navigateur (F12)
- Vérifiez que les requêtes sont bien en POST ou GET

---

## 📊 Structure de la base de données

Le projet utilise plusieurs tables :
- `users` - Les utilisateurs avec leurs crédits
- `vehicles` - Les véhicules des utilisateurs
- `trips` - Les voyages créés
- `reservations` - Les réservations des passagers
- `transactions` - L'historique des crédits
- `platform_stats` - Les statistiques de la plateforme
- `reviews` - Les avis laissés par les utilisateurs

Des données de test sont déjà incluses dans le fichier SQL :
- Un utilisateur de test
- 2 véhicules (un électrique, un essence)
- 2 voyages Paris → Lyon
- 5 comptes employés
- 1 compte administrateur

---

## 🔒 Sécurité

### Mots de passe
Les mots de passe sont hashés avec `password_hash()` de PHP, donc même si quelqu'un accède à la base de données, il ne peut pas voir les mots de passe en clair.

### Protection SQL
Toutes les requêtes utilisent des requêtes préparées (PDO), ce qui empêche les injections SQL.

### Validation
Les données sont validées à la fois côté client (JavaScript) et côté serveur (PHP).

---

## 📈 Ce qui est implémenté

### ✅ Authentification
- Inscription avec validation
- Connexion pour différents rôles (utilisateur, employé, admin)
- Sessions sécurisées
- Déconnexion

### ✅ Gestion des covoiturages
- Recherche par ville et date
- Réservation avec vérifications
- Gestion automatique des crédits
- Historique des voyages

### ✅ Système de crédits
- 20 crédits offerts à l'inscription
- Déduction automatique lors d'une réservation
- Gains pour les chauffeurs
- 2 crédits pour la plateforme par réservation

### ✅ Interface
- Design responsive (ça marche sur mobile)
- Messages d'erreur et de succès
- Navigation intuitive
- Compatible avec tous les navigateurs modernes

---

## 📊 Infos techniques

### Versions testées et qui fonctionnent
- ✅ PHP 8.1.0 - Fonctionne parfaitement
- ✅ PHP 8.2.0 - Fonctionne parfaitement
- ✅ MySQL 8.0 - Fonctionne parfaitement
- ✅ MySQL 5.7 - Fonctionne aussi

### Configuration Apache recommandée
Activez `mod_rewrite` et mettez `AllowOverride All` dans votre configuration Apache.

### Configuration PHP recommandée
Dans votre `php.ini`, vous pouvez mettre :
```ini
memory_limit = 256M
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 300
date.timezone = Europe/Paris
```

### Ports utilisés
- **Apache** : Port 80 (HTTP) ou 443 (HTTPS)
- **MySQL** : Port 3306
- **Docker** : Port 8080 pour le web

---

## 📞 Besoin d'aide ?

Si vous avez un problème :
1. Vérifiez d'abord les versions installées (PHP, MySQL)
2. Vérifiez que toutes les extensions PHP sont bien là
3. Regardez les logs (XAMPP ou Docker)
4. Testez la connexion à la base de données
5. Vérifiez les permissions des fichiers
6. Ouvrez la console du navigateur (F12) pour voir les erreurs JavaScript

Bon courage ! 🚀
