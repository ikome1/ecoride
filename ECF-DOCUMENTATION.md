# 📚 Documentation ECF - EcoRide

**Application Web de Covoiturage Écologique**

---

## 📋 Table des Matières

1. [Analyse des Besoins](#1-analyse-des-besoins)
2. [Maquettage](#2-maquettage)
3. [Intégration](#3-intégration)
4. [Développement des Règles de Gestion](#4-développement-des-règles-de-gestion)
5. [Déploiement](#5-déploiement)
6. [Dispositions de Sécurité](#6-dispositions-de-sécurité)
7. [Justifications des Choix Techniques](#7-justifications-des-choix-techniques)

---

## 1. Analyse des Besoins

### 1.1 Contexte et Objectifs

**EcoRide** est une application web de covoiturage écologique développée pour répondre à un besoin croissant de mobilité durable. L'objectif principal est de réduire l'empreinte carbone des déplacements tout en facilitant la rencontre entre conducteurs et passagers.

### 1.2 Analyse Fonctionnelle

#### 1.2.1 User Stories Identifiées

13 User Stories ont été identifiées et implémentées :

1. **US 1** : Page d'accueil avec présentation, recherche et footer
2. **US 2** : Menu de navigation complet
3. **US 3** : Vue des covoiturages avec recherche avancée
4. **US 4** : Filtres (écologique, prix, durée, note)
5. **US 5** : Vue détaillée d'un covoiturage
6. **US 6** : Participation à un covoiturage avec double confirmation
7. **US 7** : Création de compte sécurisée
8. **US 8** : Espace utilisateur (chauffeur/passager)
9. **US 9** : Saisie d'un voyage par le chauffeur
10. **US 10** : Historique des covoiturages
11. **US 11** : Démarrer et arrêter un covoiturage
12. **US 12** : Espace employé (modération avis)
13. **US 13** : Espace administrateur (statistiques, gestion)

#### 1.2.2 Contraintes Identifiées

- **Thème écologique** : Les couleurs et le design doivent refléter l'engagement écologique
- **Sécurité** : Protection des données utilisateur, mots de passe sécurisés
- **Performance** : Interface réactive et fluide
- **Accessibilité** : Responsive design (mobile, tablette, desktop)
- **Base de données** : 100% SQL (MySQL uniquement, pas de NoSQL)

### 1.3 Analyse Technique

#### 1.3.1 Besoins Techniques

- **Frontend** : Interface moderne et intuitive
- **Backend** : API REST sécurisée
- **Base de données** : Structure relationnelle conforme au MCD fourni
- **Déploiement** : Solution simple et reproductible (Docker)

#### 1.3.2 Contraintes Techniques

- PHP 8.1+ pour le backend
- MySQL 8.0 pour la base de données
- Compatibilité navigateurs modernes
- Pas de framework JavaScript lourd (vanilla JS)

---

## 2. Maquettage

### 2.1 Approche de Maquettage

Le maquettage a été réalisé en deux étapes :

1. **Maquette HTML/CSS interactive** : Création d'une maquette fonctionnelle directement en HTML/CSS pour valider le design
2. **Maquette de référence** : Fichier `maquette.html` créé pour présenter toutes les pages principales

### 2.2 Design System

#### 2.2.1 Palette de Couleurs Écologique

```css
--vert-fonce: #2E7D32    /* Vert foncé (titres, accents) */
--vert: #66BB6A           /* Vert principal (boutons, liens) */
--vert-clair: #A5D6A7     /* Vert clair (arrière-plans) */
--fond: #F1F8E9           /* Fond très clair (écran principal) */
--texte: #263238          /* Texte principal (gris foncé) */
--blanc: #FFFFFF          /* Blanc pur */
```

**Justification** : Palette verte cohérente qui évoque l'écologie et la nature, alignée avec les valeurs de l'application.

#### 2.2.2 Typographie

- **Police principale** : "Segoe UI", Roboto, Arial, sans-serif
- **Hiérarchie** :
  - Titres principaux : 4rem, font-weight 800
  - Titres sections : 2.5rem, font-weight 700
  - Sous-titres : 1.8rem, font-weight 600
  - Texte normal : 1rem

**Justification** : Polices système pour un chargement rapide et une bonne lisibilité sur tous les appareils.

### 2.3 Maquettes des Pages Principales

#### 2.3.1 Page d'Accueil

- **Hero section** : Titre accrocheur avec statistiques (10K+ utilisateurs, 50K+ trajets, 200T CO₂ économisé)
- **Barre de recherche** : Formulaire avec départ, destination, date
- **Section avantages** : 3 cartes (Écologique, Économique, Communautaire)
- **Section présentation** : Qui sommes-nous avec image
- **Section avis** : Témoignages clients
- **Footer** : Liens, contact, mentions légales

#### 2.3.2 Page Covoiturages Disponibles

- **Hero section** : Titre et description
- **Formulaire de recherche** : Filtres de base
- **Filtres rapides** : Tous, Électrique, Disponible
- **Filtres avancés** : Prix max, durée max, note min
- **Grille de trajets** : Cartes avec toutes les informations (conducteur, route, prix, places)

#### 2.3.3 Pages Authentification

- **Connexion** : Formulaire épuré avec gestion d'erreurs
- **Inscription** : Formulaire complet avec indicateur de force du mot de passe en temps réel

#### 2.3.4 Dashboards

- **Utilisateur** : Statistiques, historique trajets, gestion véhicules
- **Employé** : Modération avis, vue utilisateurs/véhicules
- **Admin** : Graphiques, statistiques globales, gestion comptes

### 2.4 Responsive Design

- **Mobile First** : Design pensé d'abord pour mobile
- **Breakpoints** :
  - Mobile : < 768px
  - Tablette : 768px - 1024px
  - Desktop : > 1024px
- **Adaptations** : Navigation hamburger sur mobile, grilles adaptatives

---

## 3. Intégration

### 3.1 Structure du Projet

```
EcoRide--main/
├── api/                    # API REST PHP
│   ├── auth.php           # Authentification
│   ├── trips.php           # Gestion covoiturages
│   ├── reviews.php         # Système d'avis
│   ├── stats.php           # Statistiques
│   ├── notifications.php   # Notifications
│   └── config.php          # Configuration DB
├── css/                    # Feuilles de style
│   ├── home.css           # Styles principaux
│   └── covoiturage.css    # Styles covoiturages
├── js/                     # Scripts JavaScript
│   ├── userManager.js     # Gestion utilisateurs
│   ├── dashboard.js       # Dashboard utilisateur
│   ├── admin-dashboard.js # Dashboard admin
│   ├── employee-dashboard.js # Dashboard employé
│   └── apiClient.js       # Client API
├── database/               # Base de données
│   └── ecoride.sql        # Schéma SQL complet
├── images/                 # Ressources images
├── *.html                  # Pages HTML
├── docker-compose.yml      # Configuration Docker
└── Dockerfile              # Image Docker
```

### 3.2 Architecture Client-Serveur

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Front-end     │  HTTP   │   Back-end      │   SQL    │   Base de       │
│   (HTML/CSS/JS) │ ◄─────► │   (PHP API)     │ ◄──────► │   Données       │
│                 │         │                 │          │   (MySQL)       │
└─────────────────┘         └─────────────────┘          └─────────────────┘
```

### 3.3 Intégration Frontend

#### 3.3.1 Technologies Frontend

- **HTML5** : Structure sémantique
- **CSS3** : Styles personnalisés avec variables CSS
- **JavaScript ES6+** : Classes, async/await, modules
- **localStorage** : Stockage côté client pour la démo

#### 3.3.2 Gestion des Données

- **UserManager** : Classe JavaScript pour gérer les utilisateurs
- **API Client** : Classe pour communiquer avec l'API PHP
- **Synchronisation** : Données synchronisées entre localStorage et API

### 3.4 Intégration Backend

#### 3.4.1 API REST

- **Endpoints** : `/api/auth.php`, `/api/trips.php`, `/api/reviews.php`, etc.
- **Format** : JSON pour toutes les réponses
- **Méthodes HTTP** : GET, POST (conformes REST)

#### 3.4.2 Base de Données

- **MySQL 8.0** : Base de données relationnelle
- **PDO** : Accès sécurisé avec requêtes préparées
- **Schéma conforme MCD** : Toutes les tables respectent le modèle fourni

---

## 4. Développement des Règles de Gestion

### 4.1 Règles d'Authentification

#### 4.1.1 Création de Compte

```php
// Règle 1 : Validation des champs requis
- Pseudo : obligatoire, unique
- Email : obligatoire, format valide, unique
- Mot de passe : obligatoire, sécurisé (8+ caractères, majuscule, minuscule, chiffre)

// Règle 2 : Attribution automatique de crédits
- Nouveaux utilisateurs : 20 crédits offerts à l'inscription

// Règle 3 : Hachage du mot de passe
- Utilisation de password_hash() avec bcrypt (PASSWORD_DEFAULT)
```

**Fichier** : `api/auth.php` lignes 59-136

#### 4.1.2 Connexion

```php
// Règle 1 : Vérification dans 3 tables
- users (utilisateurs standards)
- employees (employés)
- admins (administrateurs)

// Règle 2 : Vérification du mot de passe
- Utilisation de password_verify() pour comparer avec le hash

// Règle 3 : Génération de token de session
- Token valide 24h
- Stockage en session PHP
```

**Fichier** : `api/auth.php` lignes 156-235

### 4.2 Règles de Gestion des Covoiturages

#### 4.2.1 Recherche de Trajets

```javascript
// Règle 1 : Recherche basée sur ville + date
- Recherche dans départ OU destination
- Filtre par date exacte

// Règle 2 : Affichage uniquement des trajets avec places disponibles
- places_disponibles > 0

// Règle 3 : Si aucun trajet trouvé, proposer date alternative
- Trouver le premier trajet disponible le plus proche
```

**Fichier** : `js/database.js` lignes 69-152

#### 4.2.2 Création d'un Trajet

```php
// Règle 1 : Vérification du rôle
- Seuls les utilisateurs "chauffeur" ou "chauffeur-passager" peuvent créer

// Règle 2 : Prix minimum
- Prix minimum : 3 crédits (2 crédits pour la plateforme + 1 pour le chauffeur)

// Règle 3 : Calcul des places disponibles
- places_disponibles = places_vehicule - 1 (le chauffeur occupe une place)

// Règle 4 : Déduction plateforme
- 2 crédits prélevés par la plateforme sur chaque réservation
- Crédits restants au chauffeur = prix - 2
```

**Fichier** : `api/trips.php` lignes 320-363

#### 4.2.3 Participation à un Trajet

```php
// Règle 1 : Vérifications préalables
- Utilisateur connecté
- Place disponible (places_disponibles > 0)
- Crédits suffisants (user.credits >= trip.prix)

// Règle 2 : Double confirmation
- Première confirmation : Détails du trajet
- Deuxième confirmation : Validation finale

// Règle 3 : Transactions atomiques
- Création réservation
- Décrémentation places
- Déduction crédits passager
- Crédit chauffeur (prix - 2)
- Enregistrement transactions
```

**Fichier** : `api/trips.php` lignes 132-270, `js/script.js` lignes 374-389

### 4.3 Règles de Gestion des Véhicules

#### 4.3.1 Ajout d'un Véhicule

```javascript
// Règle 1 : Champs obligatoires
- Plaque d'immatriculation (unique)
- Date de première immatriculation
- Marque, modèle, couleur
- Nombre de places (min 2, max 9)
- Type d'énergie (Essence, Diesel, Électrique, Hybride)

// Règle 2 : Vérification unicité
- Une plaque ne peut être utilisée qu'une seule fois
```

**Fichier** : `js/dashboard.js` lignes 444-472

### 4.4 Règles de Gestion des Avis

#### 4.4.1 Soumission d'un Avis

```php
// Règle 1 : Conditions
- Trajet terminé et validé
- Participant a effectué le trajet

// Règle 2 : Modération
- Statut initial : "en_attente"
- Validation par un employé ou admin requise
- Statuts possibles : en_attente, approuvé, refusé
```

**Fichier** : `api/reviews.php`

### 4.5 Règles de Gestion des Crédits

#### 4.5.1 Attribution

```php
// Règle 1 : Inscription
- 20 crédits offerts à la création du compte

// Règle 2 : Réservation
- Déduction immédiate lors de la réservation
- Montant = prix du trajet

// Règle 3 : Crédit chauffeur
- Crédit = prix_trajet - 2 (2 crédits pour la plateforme)
- Crédit après validation du trajet par les passagers
```

**Fichier** : `api/trips.php` lignes 204-230

### 4.6 Règles de Gestion des Rôles

#### 4.6.1 Hiérarchie des Rôles

```
Admin
  ├── Peut créer des comptes employés
  ├── Peut suspendre n'importe quel compte
  ├── Accès à toutes les statistiques
  └── Graphiques de la plateforme

Employé
  ├── Peut modérer les avis
  ├── Peut voir tous les utilisateurs et véhicules
  └── Accès limité aux statistiques de modération

Utilisateur
  ├── Peut créer des trajets (si chauffeur)
  ├── Peut réserver des trajets
  └── Accès à son propre dashboard
```

---

## 5. Déploiement

### 5.1 Solution Docker (Recommandée)

#### 5.1.1 Configuration Docker

**Fichier** : `docker-compose.yml`

```yaml
services:
  web:
    build: .
    ports:
      - "8080:80"
    environment:
      - DB_HOST=db
      - DB_NAME=ecoride
      - DB_USER=ecoride_user
      - DB_PASS=ecoride_password
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      - MYSQL_DATABASE=ecoride
      - MYSQL_USER=ecoride_user
      - MYSQL_PASSWORD=ecoride_password
    volumes:
      - ./database/ecoride.sql:/docker-entrypoint-initdb.d/init.sql
```

**Justification** : Docker permet un déploiement reproductible et isolé, sans configuration manuelle.

#### 5.1.2 Dockerfile

**Fichier** : `Dockerfile`

```dockerfile
FROM php:8.1-apache

# Installation extensions PHP
RUN docker-php-ext-install gd pdo pdo_mysql

# Activation mod_rewrite
RUN a2enmod rewrite

# Copie des fichiers
COPY . /var/www/html/

# Permissions
RUN chown -R www-data:www-data /var/www/html
```

**Justification** : Image PHP officielle avec Apache, extensions nécessaires, configuration optimale.

#### 5.1.3 Déploiement en Une Commande

```bash
docker-compose up -d
```

**Avantages** :
- ✅ Installation automatique de PHP, Apache, MySQL
- ✅ Création automatique de la base de données
- ✅ Import automatique du schéma SQL
- ✅ Configuration automatique des connexions
- ✅ Aucune configuration manuelle nécessaire

### 5.2 Solution XAMPP (Alternative)

#### 5.2.1 Prérequis

- XAMPP avec PHP 8.1+
- MySQL 8.0
- Extensions PHP : pdo, pdo_mysql

#### 5.2.2 Étapes de Déploiement

1. Démarrer Apache et MySQL dans XAMPP
2. Créer la base de données `ecoride` via phpMyAdmin
3. Importer `database/ecoride.sql`
4. Copier les fichiers dans `htdocs/ecoride/`
5. Accéder à `http://localhost/ecoride/`

**Justification** : Solution classique pour le développement local, familière aux développeurs.

### 5.3 Détection Automatique de l'Environnement

**Fichier** : `api/config.php` lignes 41-56

```php
public function __construct() {
    if (getenv('DB_HOST')) {
        // Configuration Docker
        $this->host = getenv('DB_HOST');
        // ...
    } else {
        // Configuration XAMPP
        $this->host = 'localhost';
        // ...
    }
}
```

**Justification** : Une seule configuration qui s'adapte automatiquement à l'environnement, évitant les erreurs de configuration.

### 5.4 Documentation de Déploiement

- **README.md** : Guide complet d'installation et de démarrage (Docker + XAMPP)
- **docker-compose.yml** : Configuration Docker complète
- **Dockerfile** : Image Docker optimisée

---

## 6. Dispositions de Sécurité

### 6.1 Sécurité des Mots de Passe

#### 6.1.1 Hachage

```php
// Utilisation de bcrypt (algorithme recommandé par PHP)
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Vérification
if (password_verify($password, $hashedPassword)) {
    // Connexion autorisée
}
```

**Fichier** : `api/auth.php` lignes 97-99, 181

**Justification** :
- ✅ Bcrypt est un algorithme de hachage unidirectionnel sécurisé
- ✅ `PASSWORD_DEFAULT` utilise automatiquement l'algorithme le plus sûr
- ✅ Coût de hachage élevé (résistant aux attaques par force brute)
- ✅ Salt automatique (chaque hash est unique)

#### 6.1.2 Validation de la Force

```php
private function isPasswordSecure($password) {
    return strlen($password) >= 8 && 
           preg_match('/[A-Z]/', $password) && 
           preg_match('/[a-z]/', $password) && 
           preg_match('/\d/', $password);
}
```

**Fichier** : `api/auth.php` lignes 357-362

**Justification** :
- ✅ Minimum 8 caractères (recommandation OWASP)
- ✅ Au moins une majuscule, une minuscule, un chiffre
- ✅ Réduit le risque d'attaque par dictionnaire

### 6.2 Protection contre les Injections SQL

#### 6.2.1 Requêtes Préparées

```php
// ❌ DANGEREUX (injection SQL possible)
$sql = "SELECT * FROM users WHERE pseudo = '$pseudo'";

// ✅ SÉCURISÉ (requête préparée)
$stmt = $this->conn->prepare("SELECT * FROM users WHERE pseudo = ?");
$stmt->execute([$pseudo]);
```

**Fichier** : `api/config.php` lignes 84-86

**Justification** :
- ✅ Les requêtes préparées séparent le code SQL des données
- ✅ Les données sont automatiquement échappées
- ✅ Protection contre toutes les formes d'injection SQL
- ✅ Configuration PDO : `ATTR_EMULATE_PREPARES => false` (vraies requêtes préparées)

#### 6.2.2 Utilisation de PDO

```php
$this->conn = new PDO(
    "mysql:host=$host;dbname=$db_name;charset=utf8mb4",
    $username,
    $password,
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_EMULATE_PREPARES => false  // Sécurité maximale
    ]
);
```

**Fichier** : `api/config.php` lignes 75-87

**Justification** :
- ✅ PDO est l'extension PHP recommandée pour MySQL
- ✅ Support natif des requêtes préparées
- ✅ Gestion d'erreurs robuste
- ✅ `ATTR_EMULATE_PREPARES => false` : Force les vraies requêtes préparées côté MySQL

### 6.3 Protection contre les Attaques XSS

#### 6.3.1 Nettoyage des Données

```php
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}
```

**Fichier** : `api/config.php` lignes 183-196

**Justification** :
- ✅ `trim()` : Supprime les espaces en début/fin
- ✅ `strip_tags()` : Supprime toutes les balises HTML (`<script>`, etc.)
- ✅ `htmlspecialchars()` : Échappe les caractères spéciaux (`<` devient `&lt;`)
- ✅ `ENT_QUOTES` : Échappe aussi les guillemets simples et doubles
- ✅ `UTF-8` : Gère correctement les caractères spéciaux (é, è, à, etc.)

#### 6.3.2 Application Systématique

```php
// Toutes les données utilisateur sont nettoyées avant traitement
$pseudo = sanitizeInput($data['pseudo']);
$email = sanitizeInput($data['email']);
```

**Fichier** : `api/auth.php` lignes 70-71

**Justification** : Application systématique sur toutes les entrées utilisateur pour éviter toute faille XSS.

### 6.4 Gestion des Sessions

#### 6.4.1 Tokens de Session

```php
function generateToken($user_id) {
    $token_data = $user_id . ':' . time() . ':' . bin2hex(random_bytes(16));
    return base64_encode($token_data);
}

function verifyToken($token) {
    $decoded = base64_decode($token);
    $parts = explode(':', $decoded);
    
    // Vérification expiration (24h)
    if (time() - $parts[1] > 86400) {
        return false;
    }
    
    return $parts[0]; // user_id
}
```

**Fichier** : `api/config.php` lignes 213-256

**Justification** :
- ✅ Token contient : user_id, timestamp, random bytes
- ✅ Expiration automatique après 24h
- ✅ Stockage en session PHP (côté serveur)
- ⚠️ Note : Pour la production, JWT serait plus sécurisé

#### 6.4.2 Vérification de Session

```php
session_start();

if (!isset($_SESSION['user_token'])) {
    sendResponse(['success' => false, 'message' => 'Non connecté'], 401);
    return;
}

$user_id = verifyToken($_SESSION['user_token']);
if (!$user_id) {
    sendResponse(['success' => false, 'message' => 'Session expirée'], 401);
    return;
}
```

**Fichier** : `api/trips.php` lignes 133-143

**Justification** : Vérification systématique de la session avant chaque action sensible.

### 6.5 Validation des Données

#### 6.5.1 Validation des Champs Requis

```php
function validateInput($data, $required_fields) {
    $errors = [];
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            $errors[] = "Le champ '$field' est requis";
        }
    }
    return $errors;
}
```

**Fichier** : `api/config.php` lignes 152-164

**Justification** :
- ✅ Vérification que tous les champs requis sont présents
- ✅ Vérification que les champs ne sont pas vides
- ✅ Retour d'erreurs claires pour l'utilisateur

#### 6.5.2 Validation des Types

```php
// Validation du prix (doit être un entier positif)
$prix = (int)$data['prix'];
if ($prix < 3) {
    sendResponse(['success' => false, 'message' => 'Prix minimum : 3 crédits'], 400);
}
```

**Fichier** : `api/trips.php` lignes 349-352

**Justification** : Validation des types et des contraintes métier pour éviter les données invalides.

### 6.6 Contrôle d'Accès

#### 6.6.1 Vérification des Rôles

```php
// Vérifier que l'utilisateur est admin
$stmt = $this->conn->prepare("SELECT role FROM admins WHERE id = ?");
$stmt->execute([$user_id]);
$admin = $stmt->fetch();

if (!$admin) {
    sendResponse(['success' => false, 'message' => 'Accès refusé'], 403);
    return;
}
```

**Fichier** : `api/stats.php` lignes 29-36

**Justification** :
- ✅ Vérification du rôle avant chaque action sensible
- ✅ Code HTTP 403 (Forbidden) pour les accès refusés
- ✅ Séparation des tables selon les rôles (users, employees, admins)

### 6.7 Sécurité CORS

#### 6.7.1 Configuration CORS

```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

**Fichier** : `api/config.php` lignes 125-127

**Justification** :
- ✅ Permet les requêtes depuis n'importe quelle origine (développement)
- ⚠️ En production, limiter aux domaines autorisés : `Access-Control-Allow-Origin: https://ecoride.fr`

### 6.8 Protection de la Base de Données

#### 6.8.1 Contraintes d'Intégrité

```sql
-- Clés étrangères avec ON DELETE CASCADE
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

-- Contraintes d'unicité
UNIQUE (pseudo), UNIQUE (email)

-- Contraintes de validation
CHECK (note >= 1 AND note <= 5)
```

**Fichier** : `database/ecoride.sql`

**Justification** :
- ✅ Intégrité référentielle garantie
- ✅ Pas de doublons (UNIQUE)
- ✅ Validation des données au niveau base (CHECK)

### 6.9 Résumé des Mesures de Sécurité

| Mesure | Implémentation | Fichier |
|--------|---------------|---------|
| Hachage mots de passe | bcrypt (password_hash) | `api/auth.php` |
| Protection SQL injection | Requêtes préparées PDO | `api/config.php` |
| Protection XSS | sanitizeInput() | `api/config.php` |
| Gestion sessions | Tokens avec expiration | `api/config.php` |
| Validation données | validateInput() | `api/config.php` |
| Contrôle d'accès | Vérification rôles | Tous les endpoints |
| CORS | Headers configurés | `api/config.php` |
| Intégrité DB | Clés étrangères, UNIQUE, CHECK | `database/ecoride.sql` |

---

## 7. Justifications des Choix Techniques

### 7.1 Frontend

#### 7.1.1 HTML5 / CSS3 / JavaScript Vanilla

**Choix** : Pas de framework JavaScript lourd (React, Vue, Angular)

**Justification** :
- ✅ **Simplicité** : Pas de dépendances externes, pas de build complexe
- ✅ **Performance** : Pas de surcharge de framework, chargement rapide
- ✅ **Maintenabilité** : Code simple et lisible, facile à comprendre
- ✅ **Compatibilité** : Fonctionne sur tous les navigateurs modernes
- ✅ **Apprentissage** : Permet de maîtriser les bases avant les frameworks

**Alternative considérée** : React/Vue.js
- ❌ Complexité inutile pour ce projet
- ❌ Nécessite un build (webpack, etc.)
- ❌ Courbe d'apprentissage plus élevée

#### 7.1.2 CSS Personnalisé vs Framework CSS

**Choix** : CSS personnalisé avec variables CSS

**Justification** :
- ✅ **Contrôle total** : Design sur mesure, pas de contraintes de framework
- ✅ **Performance** : Pas de CSS inutilisé, fichier optimisé
- ✅ **Cohérence** : Variables CSS pour une palette uniforme
- ✅ **Maintenabilité** : Facile à modifier et étendre

**Alternative considérée** : Bootstrap/Tailwind CSS
- ❌ Taille importante (même avec purge)
- ❌ Classes utilitaires peuvent rendre le HTML verbeux
- ✅ Utilisé partiellement pour certains composants (dashboards)

### 7.2 Backend

#### 7.2.1 PHP 8.1+

**Choix** : PHP plutôt que Node.js, Python, Java

**Justification** :
- ✅ **Simplicité** : Langage facile à apprendre et déployer
- ✅ **Performance** : PHP 8.1+ est très performant (JIT compiler)
- ✅ **Écosystème** : Nombreuses bibliothèques et ressources
- ✅ **Intégration** : S'intègre naturellement avec Apache/MySQL
- ✅ **Déploiement** : Facile à déployer (XAMPP, Docker, hébergement partagé)

**Alternative considérée** : Node.js
- ❌ Nécessite npm/node_modules (complexité)
- ❌ Asynchrone peut être complexe pour débutants
- ✅ Bon pour les applications temps réel (non nécessaire ici)

#### 7.2.2 API REST

**Choix** : Architecture REST plutôt que GraphQL ou SOAP

**Justification** :
- ✅ **Simplicité** : Standard HTTP simple (GET, POST)
- ✅ **Stateless** : Chaque requête est indépendante
- ✅ **Cacheable** : Les réponses peuvent être mises en cache
- ✅ **Interopérabilité** : Fonctionne avec n'importe quel client (web, mobile)
- ✅ **Standard** : Architecture largement adoptée

**Alternative considérée** : GraphQL
- ❌ Complexité inutile pour ce projet
- ❌ Nécessite un serveur GraphQL dédié
- ✅ Avantage : Requêtes flexibles (non nécessaire ici)

### 7.3 Base de Données

#### 7.3.1 MySQL 8.0

**Choix** : MySQL plutôt que PostgreSQL, MongoDB, SQLite

**Justification** :
- ✅ **Familiarité** : MySQL est largement utilisé et documenté
- ✅ **Performance** : Excellent pour les applications web
- ✅ **Intégration** : S'intègre parfaitement avec PHP/PDO
- ✅ **Fonctionnalités** : Supporte toutes les fonctionnalités nécessaires (transactions, clés étrangères, etc.)
- ✅ **Déploiement** : Facile à déployer (Docker, XAMPP)

**Alternative considérée** : PostgreSQL
- ✅ Plus de fonctionnalités avancées
- ❌ Moins familier pour les débutants
- ❌ Configuration légèrement plus complexe

**Alternative considérée** : MongoDB (NoSQL)
- ❌ Non conforme aux exigences (100% SQL demandé)
- ❌ Pas de relations (nécessaires pour ce projet)
- ✅ Avantage : Flexibilité du schéma (non nécessaire ici)

#### 7.3.2 PDO (PHP Data Objects)

**Choix** : PDO plutôt que mysqli ou ORM (Doctrine, Eloquent)

**Justification** :
- ✅ **Sécurité** : Support natif des requêtes préparées
- ✅ **Portabilité** : Fonctionne avec plusieurs SGBD (MySQL, PostgreSQL, etc.)
- ✅ **Simplicité** : API simple et intuitive
- ✅ **Performance** : Pas de surcharge d'ORM
- ✅ **Contrôle** : Contrôle total sur les requêtes SQL

**Alternative considérée** : ORM (Doctrine, Eloquent)
- ❌ Complexité inutile pour ce projet
- ❌ Courbe d'apprentissage plus élevée
- ❌ Moins de contrôle sur les requêtes SQL
- ✅ Avantage : Abstraction de la base (non nécessaire ici)

### 7.4 Déploiement

#### 7.4.1 Docker

**Choix** : Docker plutôt que déploiement manuel ou PaaS (Heroku, Vercel)

**Justification** :
- ✅ **Reproductibilité** : Même environnement partout (dev, test, prod)
- ✅ **Simplicité** : Une seule commande (`docker-compose up -d`)
- ✅ **Isolation** : Chaque service dans son conteneur
- ✅ **Portabilité** : Fonctionne sur Windows, Mac, Linux
- ✅ **Documentation** : Configuration visible dans les fichiers (docker-compose.yml, Dockerfile)

**Alternative considérée** : Déploiement manuel
- ❌ Configuration différente selon l'environnement
- ❌ Risque d'erreurs de configuration
- ❌ Temps de setup plus long

**Alternative considérée** : PaaS (Heroku, Vercel)
- ❌ Coût (gratuit limité)
- ❌ Moins de contrôle sur l'environnement
- ❌ Dépendance à un service externe

#### 7.4.2 Docker Compose

**Choix** : Docker Compose pour orchestrer plusieurs services

**Justification** :
- ✅ **Multi-services** : Gère web (PHP/Apache) et db (MySQL) ensemble
- ✅ **Dépendances** : `depends_on` garantit l'ordre de démarrage
- ✅ **Réseau** : Création automatique d'un réseau isolé
- ✅ **Volumes** : Persistance des données MySQL
- ✅ **Variables d'environnement** : Configuration centralisée

### 7.5 Architecture

#### 7.5.1 Architecture Client-Serveur

**Choix** : Architecture classique plutôt que SPA (Single Page Application) ou microservices

**Justification** :
- ✅ **Simplicité** : Architecture classique, facile à comprendre
- ✅ **SEO** : Chaque page a son URL (meilleur référencement)
- ✅ **Performance** : Pas de surcharge JavaScript côté client
- ✅ **Maintenabilité** : Code organisé par pages

**Alternative considérée** : SPA (React, Vue)
- ❌ Complexité inutile pour ce projet
- ❌ Nécessite un router côté client
- ❌ SEO plus complexe (nécessite SSR)

#### 7.5.2 Séparation Frontend/Backend

**Choix** : API REST séparée plutôt que tout mélangé

**Justification** :
- ✅ **Séparation des responsabilités** : Frontend = présentation, Backend = logique métier
- ✅ **Réutilisabilité** : API peut être utilisée par mobile, autre frontend
- ✅ **Testabilité** : API testable indépendamment
- ✅ **Maintenabilité** : Code organisé et modulaire

### 7.6 Sécurité

#### 7.6.1 Bcrypt pour les Mots de Passe

**Choix** : `password_hash()` avec `PASSWORD_DEFAULT` (bcrypt)

**Justification** :
- ✅ **Recommandation PHP** : `PASSWORD_DEFAULT` utilise l'algorithme le plus sûr
- ✅ **Résistant aux attaques** : Coût de hachage élevé (lent pour les attaquants)
- ✅ **Salt automatique** : Chaque hash est unique
- ✅ **Future-proof** : PHP peut changer d'algorithme automatiquement

**Alternative considérée** : MD5, SHA-256
- ❌ Trop rapides (vulnérables aux attaques par force brute)
- ❌ Pas de salt automatique
- ❌ Dépréciés pour les mots de passe

#### 7.6.2 Requêtes Préparées

**Choix** : PDO avec requêtes préparées

**Justification** :
- ✅ **Protection SQL injection** : Séparation code/données
- ✅ **Performance** : Requêtes compilées et réutilisables
- ✅ **Simplicité** : API simple (`prepare()`, `execute()`)
- ✅ **Standard** : Approche recommandée par PHP

**Alternative considérée** : mysqli avec échappement manuel
- ❌ Risque d'oubli d'échappement
- ❌ Code plus verbeux
- ❌ Moins sécurisé

### 7.7 Résumé des Justifications

| Choix Technique | Justification Principale | Alternative Considérée |
|----------------|------------------------|------------------------|
| JavaScript Vanilla | Simplicité, performance | React/Vue (trop complexe) |
| CSS Personnalisé | Contrôle total, performance | Bootstrap (trop lourd) |
| PHP 8.1+ | Simplicité, intégration | Node.js (trop complexe) |
| API REST | Standard, simple | GraphQL (trop complexe) |
| MySQL 8.0 | Familiarité, performance | PostgreSQL (moins familier) |
| PDO | Sécurité, simplicité | ORM (trop complexe) |
| Docker | Reproductibilité, simplicité | Déploiement manuel (erreurs) |
| Bcrypt | Recommandation PHP, sécurité | MD5/SHA (trop rapides) |
| Requêtes préparées | Protection SQL injection | Échappement manuel (risqué) |

---

## 📊 Conclusion

Ce projet respecte intégralement les exigences du cahier des charges avec :

- ✅ **13/13 User Stories** implémentées
- ✅ **Architecture sécurisée** avec toutes les bonnes pratiques
- ✅ **Déploiement simplifié** avec Docker
- ✅ **Code maintenable** et bien documenté
- ✅ **Base de données** conforme au MCD fourni
- ✅ **Thème écologique** cohérent

Le projet démontre la maîtrise de toutes les compétences demandées :
- Analyse des besoins
- Maquettage
- Intégration
- Développement des règles de gestion
- Déploiement
- Sécurité

---

**Document créé le :** 2025  
**Version :** 1.0  
**Auteur :** Équipe EcoRide

