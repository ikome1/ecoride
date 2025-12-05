# Guide d'installation EcoRide

## 👨‍🏫 Pour le professeur / Correcteur et tout autres utilisateurs 


Alors, j'ai fait ce guide pour que tu puisses tester mon projet sans complication comme vous l'avez demander avec docker . C'est vraiment simple,! 
j'ai du refaire une mise a jour complete du site ca m'a pris au moins 2 semaines a tout recorriger  
j'ai expliqué l'installation de facon detailler afin de permetre aux autres utilisateurs de comprendre l'installation surtout pour les debutants

**Tu n'es pas obligé d'utiliser Docker !** Le projet marche avec deux méthodes, tu choisis celle que tu préfères.

### Option 1 : Docker (C'est le plus simple, comme vous l'avez demander) ⭐

**Il te faut juste** : Docker Desktop installé sur ton PC (si tu l'as pas, tu le télécharges sur le site de Docker)

**Voilà ce que tu fais :**
```bash
# 1. Tu ouvres un terminal dans le dossier du projet
cd EcoRide--main

# 2. Tu lances cette commande (c'est la seule chose à faire !)
docker-compose up -d

# 3. Tu attends 30 secondes (la première fois ça peut prendre 2-3 minutes, Docker télécharge tout)

# 4. Tu ouvres ton navigateur sur
http://localhost:8080
```

**Et voilà, c'est tout !** 🎉

**Ce qui se passe tout seul (tu n'as rien à faire) :**
- ✅ PHP 8.1 + Apache s'installent et se configurent tout seuls
- ✅ MySQL 8.0 s'installe et démarre tout seul
- ✅ Toutes les extensions PHP nécessaires s'installent
- ✅ La base de données `ecoride` se crée toute seule
- ✅ Le fichier SQL s'importe tout seul (avec toutes les tables et les données de test)
- ✅ Les comptes de test se créent tout seuls
- ✅ La configuration se fait toute seule (tu n'as pas besoin de toucher à `config.php`)

**Tu n'as vraiment rien à configurer manuellement !** Le fichier `api/config.php` détecte tout seul si tu es dans Docker ou XAMPP.

### Option 2 : XAMPP (Si tu préfères l'ancienne méthode)

Si tu préfères utiliser XAMPP ou MAMP, voilà ce qu'il faut faire :
1. Installer XAMPP (avec PHP 8.1 minimum)
2. Créer la base de données à la main
3. Importer le fichier SQL
4. Configurer les extensions PHP

**Les deux méthodes marchent très bien.** Tu choisis celle que tu veux ! 😊

---

## 📋 Ce qu'il faut avoir sur son PC

### Versions nécessaires

Pour faire tourner le projet, il te faut :
- **PHP** : version 8.1 ou plus récente (8.2, 8.3, ça marche aussi, moi j'utilise PHP 8.1)
- **MySQL** : version 5.7 minimum, mais 8.0 c'est mieux
- **Apache** : version 2.4 ou plus récente

### Extensions PHP à avoir

Le projet utilise ces extensions PHP :
- `pdo` et `pdo_mysql` - Pour parler à MySQL (base de données SQL)
- `json` - Pour gérer les données JSON (normalement c'est déjà là)
- `mbstring` - Pour les caractères spéciaux
- `openssl` - Pour la sécurité

### Comment vérifier ce que tu as ?

Tu ouvres un terminal et tu tapes :
```bash
# Pour voir ta version de PHP
php -v

# Pour voir toutes les extensions installées
php -m

# Pour voir ta version de MySQL
mysql --version
```

Si tu utilises XAMPP, tu peux aussi créer un fichier `phpinfo.php` dans `htdocs/` avec juste `<?php phpinfo(); ?>` dedans, puis ouvrir `http://localhost/phpinfo.php` dans ton navigateur pour voir tout ce qui est installé.

---

## 🚀 Installation avec XAMPP

### Étape 1 : Installer XAMPP

1. Tu télécharges XAMPP depuis https://www.apachefriends.org/
2. **Important** : Prends une version qui a PHP 8.1 ou plus récent
   - Pour Windows : Version avec PHP 8.1+
   - Pour Mac : Version avec PHP 8.1+
   - Pour Linux : Version avec PHP 8.1+
3. Tu l'installes (par défaut dans `C:\xampp\` sur Windows ou `/Applications/XAMPP/` sur Mac)
4. Tu démarres Apache et MySQL dans le panneau de contrôle XAMPP
5. Pour vérifier que PHP 8.1+ est bien là, tu ouvres un terminal et tu tapes `php -v`

### Étape 2 : Créer la base de données

1. Tu ouvres phpMyAdmin : `http://localhost/phpmyadmin`
2. Tu crées une nouvelle base de données appelée `ecoride`
3. Tu importes le fichier `database/ecoride.sql` qui est dans le projet

### Étape 3 : Mettre les fichiers au bon endroit

Tu copies tout le dossier du projet dans :
- Windows : `C:\xampp\htdocs\ecoride\`
- Mac : `/Applications/XAMPP/htdocs/ecoride/`

### Étape 4 : C'est parti !

Tu ouvres ton navigateur et tu vas sur :
```
http://localhost/ecoride/
```

---

## 🐳 Installation avec Docker

### Étape 1 : Installer Docker (si tu l'as pas déjà)

**Télécharger Docker Desktop :**
- Windows/Mac : https://www.docker.com/products/docker-desktop
- Linux : Installer Docker et Docker Compose via ton gestionnaire de paquets

**Pour vérifier que c'est bien installé :**
```bash
docker --version
docker-compose --version
```

### Étape 2 : Lancer le projet (UNE SEULE COMMANDE !)

Tu ouvres un terminal dans le dossier du projet et tu tapes :
```bash
docker-compose up -d
```

**C'est la seule commande à faire !** 🚀

### Étape 3 : Attendre le démarrage

- **La première fois** : 2-3 minutes (Docker télécharge les images PHP, MySQL)
- **Les fois suivantes** : 30 secondes environ

Tu peux vérifier que tout démarre avec :
```bash
docker-compose ps
```

Tu devrais voir 2 services qui tournent :
- `web` (ton application PHP)
- `db` (MySQL)

### Étape 4 : Accéder à l'application

Tu ouvres ton navigateur sur :
```
http://localhost:8080
```

**Et voilà, c'est tout !** 🎉

### Ce qui se fait tout seul

Quand tu lances `docker-compose up -d`, Docker fait tout ça automatiquement :

1. **Il télécharge et installe tout seul :**
   - PHP 8.1 avec Apache
   - MySQL 8.0

2. **Il installe toutes les extensions PHP nécessaires :**
   - `pdo` et `pdo_mysql` (pour MySQL)
   - `gd` (pour les images)
   - `mod_rewrite` (pour Apache)

3. **Il configure et démarre MySQL tout seul :**
   - Il crée la base de données `ecoride` automatiquement
   - Il importe le fichier `database/ecoride.sql` automatiquement
   - Il crée tous les comptes de test

4. **Il configure les connexions tout seul :**
   - L'application se connecte automatiquement à MySQL (via `db`)
   - **Tu n'as pas besoin de modifier `config.php` !** Le fichier détecte tout seul si tu es dans Docker.

5. **Il démarre tous les services :**
   - Application web sur le port 8080
   - MySQL sur le port 3306

**Résultat :** Tu as une application qui marche avec **100% SQL (MySQL uniquement)** sans rien configurer manuellement !

### Commandes utiles pour Docker

```bash
# Pour voir si tout tourne bien
docker-compose ps

# Pour voir les logs (si tu veux débugger)
docker-compose logs -f

# Pour arrêter l'application
docker-compose down

# Pour tout réinitialiser (base de données incluse)
docker-compose down -v
```

---

## 🔧 Configuration de la base de données

### Détection automatique de l'environnement

Le fichier `api/config.php` détecte tout seul si tu es dans Docker ou XAMPP :

- **Avec Docker** : Il utilise automatiquement les variables d'environnement (`DB_HOST=db`, etc.)
- **Avec XAMPP** : Il utilise la configuration par défaut (`localhost`, `root`, etc.)

**Tu n'as RIEN à modifier dans `config.php` !** 🎉

### Si tu utilises XAMPP et que tu veux modifier la config

Si tu utilises XAMPP et que tu as changé les paramètres MySQL, tu modifies `api/config.php` :
```php
private $host = 'localhost';
private $db_name = 'ecoride';
private $username = 'root';
private $password = ''; // Tu mets ton mot de passe MySQL si tu en as un
```

### Infos sur MySQL

- **Version** : MySQL 5.7 minimum, mais 8.0 c'est mieux
- **Charset** : utf8mb4 (déjà configuré dans le fichier SQL)
- **Port** : 3306 par défaut

---

## 🧪 Tester que tout fonctionne

### Test 1 : Se connecter
1. Tu vas sur `http://localhost/ecoride/login.html` (ou `http://localhost:8080/login.html` avec Docker)
2. Tu utilises un des comptes de test :
   - **Utilisateur** : `user` / `user123`
   - **Admin** : `admin` / `admin123`
   - **Employés** : `employe1` à `employe5` / `employe123`

### Test 2 : Créer un compte
1. Tu vas sur la page d'inscription
2. Tu crées un nouveau compte
3. Tu vérifies que tu as bien 20 crédits au départ

### Test 3 : Chercher un covoiturage
1. Sur la page d'accueil, tu cherches "Paris" avec la date "2025-10-20"
2. Tu devrais voir des covoiturages s'afficher

### Test 4 : Réserver un trajet
1. Tu te connectes avec un compte utilisateur
2. Tu cliques sur "Participer" sur un covoiturage
3. Tu vérifies que tes crédits sont bien déduits

---

## 🐛 Si ça ne marche pas...

### Erreur : "Version PHP trop ancienne"
Ton PHP est peut-être trop vieux. Vérifie avec `php -v`. Il faut PHP 8.1 minimum.

**Solution** : Tu mets à jour XAMPP ou tu installes une version plus récente de PHP.

### Erreur : "Extension PHP manquante"
Il manque peut-être une extension. Vérifie avec `php -m | grep pdo_mysql`.

**Solution** : 
1. Tu ouvres le fichier `php.ini` de XAMPP (généralement dans `C:\xampp\php\php.ini`)
2. Tu cherches la ligne avec `extension=pdo_mysql` et tu enlèves le `;` devant
3. Tu redémarres Apache

### Erreur : "Impossible de se connecter à la base de données"

**Si tu utilises Docker :**
- Tu vérifies que tous les conteneurs sont démarrés : `docker-compose ps`
- Tu vérifies les logs : `docker-compose logs db` (pour MySQL)
- Tu attends 30 secondes après `docker-compose up -d` (MySQL a besoin de temps pour démarrer)
- Tu vérifies que le fichier `database/ecoride.sql` existe bien

**Si tu utilises XAMPP :**
- MySQL est bien démarré dans XAMPP ?
- Les paramètres dans `api/config.php` sont corrects ?
- La base de données `ecoride` existe bien ?
- Ta version de MySQL est compatible ?

### Erreur 500 (erreur serveur)

**Si tu utilises Docker :**
```bash
# Pour voir les logs de l'application
docker-compose logs web

# Pour voir tous les logs
docker-compose logs
```

**Si tu utilises XAMPP :**
Tu regardes les logs Apache dans XAMPP pour voir ce qui ne va pas. Ça peut être :
- Un problème de permissions sur les fichiers
- Une erreur de syntaxe PHP
- Une extension manquante

### Erreur CORS
Normalement, les en-têtes CORS sont déjà configurés dans `config.php`. Si tu as une erreur :
- Tu vérifies la console du navigateur (F12)
- Tu vérifies que les requêtes sont bien en POST ou GET

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

Si tu as un problème :
1. Tu vérifies d'abord les versions installées (PHP, MySQL)
2. Tu vérifies que toutes les extensions PHP sont bien là
3. Tu regardes les logs (XAMPP ou Docker)
4. Tu testes la connexion à la base de données
5. Tu vérifies les permissions des fichiers
6. Tu ouvres la console du navigateur (F12) pour voir les erreurs JavaScript

Bon courage ! 🚀
