# 🌿 EcoRide - Application de Covoiturage Écologique

Application web de covoiturage écologique développée avec PHP, MySQL et JavaScript.

## 👨‍🏫 Pour le professeur / Correcteur

Ce guide est fait pour que tu puisses tester le projet sans complication, comme demandé avec Docker. C'est vraiment simple ! J'ai expliqué l'installation de façon détaillée pour permettre aux autres utilisateurs de comprendre, surtout pour les débutants.

**Tu n'es pas obligé d'utiliser Docker !** Le projet fonctionne avec deux méthodes, tu choisis celle que tu préfères.

---

## 🚀 Démarrage Rapide

### Option 1 : Docker (Le plus simple) ⭐

**Il te faut juste** : Docker Desktop installé

```bash
# 1. Tu ouvres un terminal dans le dossier du projet
cd EcoRide--main

# 2. Tu lances cette commande (UNE SEULE COMMANDE !)
docker-compose up -d

# 3. Tu attends 30 secondes (la première fois ça peut prendre 2-3 minutes)

# 4. Tu ouvres ton navigateur sur
http://localhost:8080
```

**Et voilà, c'est tout !** 🎉

**Ce qui se fait tout seul :**
- ✅ PHP 8.1 + Apache + toutes les extensions (y compris MongoDB)
- ✅ MySQL 8.0 + base de données créée + SQL importé
- ✅ MongoDB 7.0 pour les logs d'activité (NoSQL)
- ✅ Configuration automatique (tu n'as pas besoin de modifier `config.php`)
- ✅ Comptes de test créés

**Tu n'as rien à configurer manuellement !**

### Option 2 : XAMPP

```bash
# 1. Tu installes XAMPP avec PHP 8.1+
# Tu télécharges depuis https://www.apachefriends.org/

# 2. Tu démarres Apache et MySQL dans XAMPP

# 3. Tu crées la base de données
# Tu ouvres http://localhost/phpmyadmin
# Tu crées une base "ecoride"
# Tu importes database/ecoride.sql

# 4. Tu copies les fichiers dans
# Windows : C:\xampp\htdocs\ecoride\
# Mac : /Applications/XAMPP/htdocs/ecoride/

# 5. Tu ouvres ton navigateur sur
http://localhost/ecoride/
```

---

## 📋 Prérequis

### Versions nécessaires

Pour faire tourner le projet, il te faut :
- **PHP** : version 8.1 ou plus récente (8.2, 8.3, ça marche aussi)
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

## 🐳 Installation Détaillée avec Docker

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

Tu devrais voir 3 services qui tournent :
- `web` (ton application PHP)
- `db` (MySQL)
- `mongodb` (MongoDB pour les logs)

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

**Résultat :** Tu as une application qui marche avec **MySQL (SQL) + MongoDB (NoSQL)** sans rien configurer manuellement !

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

## 🚀 Installation Détaillée avec XAMPP

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

## 🔧 Configuration de la Base de Données

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

## 🧪 Tester l'Application

### Comptes de Test

- **Utilisateur** : `user` / `user123`
- **Admin** : `admin` / `admin123`
- **Employés** : `employe1` à `employe5` / `employe123`

Voir [COMPTES_TEST.md](COMPTES_TEST.md) pour tous les comptes.

### Tests à Effectuer

#### Test 1 : Se connecter
1. Tu vas sur `http://localhost/ecoride/login.html` (ou `http://localhost:8080/login.html` avec Docker)
2. Tu utilises un des comptes de test ci-dessus

#### Test 2 : Créer un compte
1. Tu vas sur la page d'inscription
2. Tu crées un nouveau compte
3. Tu vérifies que tu as bien 20 crédits au départ

#### Test 3 : Chercher un covoiturage
1. Sur la page d'accueil, tu cherches "Paris" avec la date "2025-10-20"
2. Tu devrais voir des covoiturages s'afficher

#### Test 4 : Réserver un trajet
1. Tu te connectes avec un compte utilisateur
2. Tu cliques sur "Participer" sur un covoiturage
3. Tu vérifies que tes crédits sont bien déduits

---

## 🐛 Dépannage

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

## 📁 Structure du Projet

```
EcoRide--main/
├── api/                    # API PHP
│   ├── auth.php           # Authentification
│   ├── trips.php           # Covoiturages
│   ├── reviews.php         # Avis
│   ├── stats.php           # Statistiques
│   ├── cache.php           # Cache (désactivé - MySQL uniquement)
│   ├── notifications.php   # Notifications
│   └── config.php          # Configuration DB
├── css/                    # Styles
│   ├── home.css           # Styles principaux
│   └── covoiturage.css    # Styles covoiturages
├── js/                     # Scripts JavaScript
│   ├── userManager.js     # Gestion utilisateurs
│   ├── dashboard.js       # Dashboard utilisateur
│   ├── admin-dashboard.js # Dashboard admin
│   ├── employee-dashboard.js # Dashboard employé
│   └── apiClient.js       # Client API
├── database/               # Base de données
│   └── ecoride.sql         # Schéma SQL complet
├── data/                   # Données JSON
├── images/                 # Images
├── *.html                  # Pages HTML
├── docker-compose.yml      # Configuration Docker
├── Dockerfile              # Image Docker
└── Documentation/          # Documentation
```

---

## 🛠️ Technologies Utilisées

### Front-end
- **HTML5** : Structure sémantique des pages
- **CSS3** : Styles et mise en page responsive
- **JavaScript (ES6+)** : Interactivité et logique côté client
- **Tailwind CSS** : Framework CSS pour un design moderne et responsive
- **Chart.js** : Bibliothèque pour l'affichage de graphiques et statistiques

### Back-end
- **PHP 8.1+** : Langage serveur pour l'API REST
- **MySQL 8.0** : Base de données relationnelle (SQL) - Données structurées
- **MongoDB 7.0** : Base de données NoSQL - Logs d'activité et statistiques
- **PDO (PHP Data Objects)** : Accès sécurisé à la base de données MySQL
- **MongoDB PHP Extension** : Accès à MongoDB pour les logs
- **Apache** : Serveur web

### Outils et Infrastructure
- **Docker & Docker Compose** : Containerisation pour un déploiement simplifié
- **Git** : Gestion de version
- **XAMPP** : Alternative pour le développement local

---

## 📝 API Endpoints

### Authentification
- `POST api/auth.php?action=register` - Inscription
- `POST api/auth.php?action=login` - Connexion
- `POST api/auth.php?action=logout` - Déconnexion
- `GET api/auth.php?action=check-session` - Vérifier session

### Covoiturages
- `POST api/trips.php?action=search` - Rechercher
- `POST api/trips.php?action=create-trip` - Créer voyage
- `POST api/trips.php?action=participate` - Réserver
- `GET api/trips.php?action=trips` - Historique

### Avis
- `POST api/reviews.php?action=create` - Créer avis
- `GET api/reviews.php?action=pending` - Avis en attente
- `POST api/reviews.php?action=moderate` - Modérer

### Statistiques
- `GET api/stats.php?action=user` - Stats utilisateur
- `GET api/stats.php?action=platform` - Stats plateforme

### Notifications
- `GET api/notifications.php?action=list` - Liste notifications
- `POST api/notifications.php?action=read` - Marquer comme lue

---

## 🗄️ Base de Données

### MySQL (SQL) - Données structurées
- **Tables** : users, vehicles, trips, reservations, reviews, transactions, notifications, role, Marque, configuration, parametre
- **Schéma** : `database/ecoride.sql`
- **Usage** : Données relationnelles, utilisateurs, trajets, réservations

### MongoDB (NoSQL) - Logs et statistiques
- **Collections** : activity_logs, search_logs, realtime_stats
- **Usage** : Logs d'activité utilisateur, logs de recherche, statistiques en temps réel
- **Composant** : `api/mongodb.php` - Composant d'accès aux données NoSQL

### Structure de la base de données

Le projet utilise plusieurs tables :
- `users` - Les utilisateurs avec leurs crédits
- `vehicles` - Les véhicules des utilisateurs
- `trips` - Les voyages créés
- `reservations` - Les réservations des passagers
- `transactions` - L'historique des crédits
- `platform_stats` - Les statistiques de la plateforme
- `reviews` - Les avis laissés par les utilisateurs
- `role` - Les rôles (user, employee, admin)
- `Marque` - Les marques de véhicules
- `configuration` et `parametre` - Configuration de la plateforme

Des données de test sont déjà incluses dans le fichier SQL :
- Un utilisateur de test
- 2 véhicules (un électrique, un essence)
- 2 voyages Paris → Lyon
- 5 comptes employés
- 1 compte administrateur

---

## 🔒 Sécurité

### Mots de passe
Les mots de passe sont hashés avec `password_hash()` de PHP (bcrypt), donc même si quelqu'un accède à la base de données, il ne peut pas voir les mots de passe en clair.

### Protection SQL
Toutes les requêtes utilisent des requêtes préparées (PDO), ce qui empêche les injections SQL.

### Protection XSS
Les données sont nettoyées avec `sanitizeInput()` avant insertion en base ou affichage, ce qui empêche les attaques XSS.

### Validation
Les données sont validées à la fois côté client (JavaScript) et côté serveur (PHP).

---

## ✅ Fonctionnalités Implémentées

### Authentification
- ✅ Inscription avec validation
- ✅ Connexion pour différents rôles (utilisateur, employé, admin)
- ✅ Sessions sécurisées
- ✅ Déconnexion

### Gestion des covoiturages
- ✅ Recherche par ville et date
- ✅ Filtres avancés (prix, durée, note, type d'énergie)
- ✅ Réservation avec vérifications
- ✅ Gestion automatique des crédits
- ✅ Historique des voyages
- ✅ Démarrer et arrêter un trajet

### Système de crédits
- ✅ 20 crédits offerts à l'inscription
- ✅ Déduction automatique lors d'une réservation
- ✅ Gains pour les chauffeurs
- ✅ 2 crédits pour la plateforme par réservation
- ✅ Historique des transactions

### Système d'avis
- ✅ Notation de 1 à 5 étoiles
- ✅ Commentaires textuels
- ✅ Modération par les employés
- ✅ Statuts : en_attente, approuvé, refusé

### Interface
- ✅ Design responsive (ça marche sur mobile)
- ✅ Messages d'erreur et de succès
- ✅ Navigation intuitive
- ✅ Compatible avec tous les navigateurs modernes
- ✅ Thème écologique cohérent

### Dashboards
- ✅ Dashboard utilisateur (statistiques, historique, véhicules)
- ✅ Dashboard employé (modération avis, vue utilisateurs/véhicules)
- ✅ Dashboard admin (graphiques, statistiques globales, gestion)

---

## 📊 Infos Techniques

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

## 📚 Documentation Complémentaire

- **[COMPTES_TEST.md](COMPTES_TEST.md)** - Tous les comptes de test disponibles
- **[CONFORMITE.md](CONFORMITE.md)** - Vérification de conformité aux critères
- **[ECF-DOCUMENTATION.md](ECF-DOCUMENTATION.md)** - Documentation complète pour l'ECF
- **[PRESENTATION.md](PRESENTATION.md)** - Présentation détaillée du projet
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guide complet de déploiement en production
- **[TESTS.md](TESTS.md)** - Guide complet de test de tous les composants
- **[maquette.html](maquette.html)** - Maquette des interfaces utilisateur

---

## 📞 Besoin d'aide ?

Si tu as un problème :
1. Tu vérifies d'abord les versions installées (PHP, MySQL)
2. Tu vérifies que toutes les extensions PHP sont bien là
3. Tu regardes les logs (XAMPP ou Docker)
4. Tu testes la connexion à la base de données
5. Tu vérifies les permissions des fichiers
6. Tu ouvres la console du navigateur (F12) pour voir les erreurs JavaScript

**Bon développement ! 🚀**
