# 🌿 EcoRide - Présentation du Projet

## 📋 Vue d'ensemble

**EcoRide** est une application web de covoiturage écologique développée dans le cadre de l'acquisition de compétences en développement web et web mobile sécurisé. Cette application permet aux utilisateurs de proposer, rechercher et réserver des trajets en covoiturage, avec un système de crédits intégré et une gestion complète des utilisateurs, véhicules et voyages.

---

## 🎯 Objectifs du Projet

Ce projet a été développé pour acquérir et démontrer les compétences suivantes :

### Front-end
- ✅ Installer et configurer son environnement de travail
- ✅ Maquetter des interfaces utilisateur web/mobile
- ✅ Réaliser des interfaces utilisateur statiques
- ✅ Développer la partie dynamique des interfaces utilisateur

### Back-end
- ✅ Mettre en place une base de données relationnelle
- ✅ Développer des composants d'accès aux données SQL
- ✅ Développer des composants métier côté serveur
- ✅ Documenter le déploiement d'une application dynamique

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
- **MySQL 8.0** : Base de données relationnelle (100% SQL)
- **PDO (PHP Data Objects)** : Accès sécurisé à la base de données
- **Apache** : Serveur web

### Outils et Infrastructure
- **Docker & Docker Compose** : Containerisation pour un déploiement simplifié
- **Git** : Gestion de version
- **XAMPP** : Alternative pour le développement local

---

## 🏗️ Architecture du Projet

### Structure des Fichiers

```
EcoRide--main/
├── api/                    # API REST PHP
│   ├── auth.php           # Authentification (login, register, logout)
│   ├── trips.php           # Gestion des covoiturages (CRUD)
│   ├── reviews.php         # Système d'avis et notes
│   ├── stats.php           # Statistiques utilisateur et plateforme
│   ├── notifications.php   # Gestion des notifications
│   ├── cache.php           # Service de cache (désactivé)
│   └── config.php          # Configuration base de données
├── css/                    # Feuilles de style
│   └── home.css           # Styles personnalisés
├── js/                     # Scripts JavaScript
│   ├── apiClient.js       # Client API réutilisable
│   ├── auth.js            # Gestion authentification côté client
│   ├── dashboard.js       # Logique du tableau de bord
│   ├── tripManager.js     # Gestion des trajets
│   ├── userManager.js    # Gestion des utilisateurs
│   └── navbar.js          # Navigation dynamique
├── database/               # Base de données
│   └── ecoride.sql        # Schéma SQL complet
├── images/                 # Ressources images
├── *.html                  # Pages HTML (home, login, register, dashboard, etc.)
├── docker-compose.yml      # Configuration Docker
├── Dockerfile              # Image Docker PHP/Apache
└── Documentation/          # Documentation du projet
```

### Architecture Client-Serveur

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Front-end     │  HTTP   │   Back-end      │   SQL    │   Base de       │
│   (HTML/CSS/JS) │ ◄─────► │   (PHP API)     │ ◄──────► │   Données       │
│                 │         │                 │          │   (MySQL)       │
└─────────────────┘         └─────────────────┘          └─────────────────┘
```

---

## 🗄️ Base de Données

### Schéma Relationnel

Le projet utilise **MySQL 8.0** avec une architecture 100% SQL (aucune base NoSQL).

#### Tables Principales

1. **users** : Utilisateurs de la plateforme
   - Champs : id, pseudo, email, password (hashé), credits, role, type, préférences
   - Relations : Clé étrangère vers vehicles

2. **vehicles** : Véhicules enregistrés
   - Champs : id, user_id, plaque, marque, modèle, couleur, places, type
   - Relations : Clé étrangère vers users

3. **trips** : Voyages proposés
   - Champs : id, user_id, vehicle_id, départ, destination, date, heure, prix, places
   - Relations : Clés étrangères vers users et vehicles

4. **reservations** : Réservations de trajets
   - Champs : id, trip_id, user_id, prix_payé, statut
   - Relations : Clés étrangères vers trips et users

5. **reviews** : Avis et notes
   - Champs : id, trip_id, reviewer_id, reviewed_id, note, commentaire, statut
   - Relations : Clés étrangères vers trips et users

6. **transactions** : Historique des crédits
   - Champs : id, user_id, type, montant, description, trip_id
   - Relations : Clés étrangères vers users et trips

7. **notifications** : Notifications utilisateur
   - Champs : id, user_id, message, type, lu, created_at
   - Relations : Clé étrangère vers users

8. **employees** : Comptes employés
   - Champs : id, pseudo, email, password, role

9. **admins** : Comptes administrateurs
   - Champs : id, pseudo, email, password, role

10. **platform_stats** : Statistiques de la plateforme
    - Champs : id, date_stat, nb_trips, credits_gagnés

### Intégrité Référentielle

- Utilisation de **clés étrangères** avec `ON DELETE CASCADE` et `ON DELETE SET NULL`
- Contraintes d'unicité (`UNIQUE`) pour éviter les doublons
- Contraintes de validation (`CHECK`) pour les notes (1-5)
- Index sur les colonnes fréquemment interrogées

---

## ✨ Fonctionnalités Principales

### 1. Authentification Multi-Rôles
- **Inscription** : Création de compte avec validation
- **Connexion** : Authentification sécurisée avec sessions PHP
- **Déconnexion** : Gestion de la session
- **Rôles** : Utilisateur, Employé, Administrateur
- **Sécurité** : Mots de passe hashés avec `password_hash()` (bcrypt)

### 2. Gestion des Covoiturages (CRUD Complet)
- **Créer** : Proposer un nouveau trajet avec véhicule
- **Lire** : Rechercher des trajets (départ, destination, date)
- **Mettre à jour** : Modifier un trajet (chauffeur uniquement)
- **Supprimer** : Annuler un trajet

### 3. Système de Réservation
- Recherche avancée de trajets
- Réservation avec déduction de crédits
- Gestion des places disponibles
- Historique des réservations

### 4. Système de Crédits
- Crédits initiaux : 20 crédits offerts à l'inscription
- Débit : Paiement lors de la réservation
- Crédit : Gain lors de la création d'un trajet
- Historique : Table `transactions` pour tracer toutes les opérations

### 5. Système d'Avis et Notes
- Notation de 1 à 5 étoiles
- Commentaires textuels
- Modération par les employés
- Statuts : en_attente, approuvé, refusé

### 6. Notifications
- Notifications en temps réel
- Types : réservation, annulation, avis, etc.
- Marquage comme lu/non lu
- Stockage en base MySQL

### 7. Statistiques
- **Utilisateur** : Nombre de trajets, crédits, avis reçus
- **Plateforme** : Trajets totaux, crédits gagnés, graphiques Chart.js

### 8. Gestion des Véhicules
- Enregistrement de véhicules (plaque, marque, modèle, etc.)
- Types : Essence, Diesel, Électrique, Hybride
- Association véhicule-utilisateur

---

## 🔒 Sécurité

### Mesures de Sécurité Implémentées

1. **Hachage des Mots de Passe**
   - Utilisation de `password_hash()` avec bcrypt
   - Vérification avec `password_verify()`
   - Pas de stockage en clair

2. **Protection contre les Injections SQL**
   - Utilisation de **requêtes préparées** (PDO)
   - Paramètres liés avec `bindParam()` / `bindValue()`
   - Aucune concaténation directe de variables dans les requêtes

3. **Protection contre les XSS**
   - Échappement des données avec `htmlspecialchars()`
   - Nettoyage avec `strip_tags()` et `trim()`
   - Validation des entrées utilisateur

4. **Gestion des Sessions**
   - Sessions PHP sécurisées
   - Vérification de session à chaque requête API
   - Déconnexion automatique en cas d'inactivité

5. **Validation des Données**
   - Validation côté client (JavaScript)
   - Validation côté serveur (PHP)
   - Contraintes de base de données (UNIQUE, CHECK, FOREIGN KEY)

6. **CORS et Headers**
   - Headers CORS configurés pour l'API
   - Headers de sécurité HTTP

---

## 🚀 Installation et Déploiement

### Option 1 : Docker (Recommandé) ⭐

**Une seule commande pour tout lancer :**

```bash
docker-compose up -d
```

**Avantages :**
- ✅ Configuration automatique (PHP, Apache, MySQL)
- ✅ Base de données créée et importée automatiquement
- ✅ Comptes de test pré-configurés
- ✅ Aucune configuration manuelle nécessaire
- ✅ Environnement isolé et reproductible

**Accès :** `http://localhost:8080`

### Option 2 : XAMPP

1. Installer XAMPP avec PHP 8.1+
2. Démarrer Apache et MySQL
3. Créer la base `ecoride` dans phpMyAdmin
4. Importer `database/ecoride.sql`
5. Copier les fichiers dans `htdocs/ecoride/`
6. Accéder à `http://localhost/ecoride/`

**Voir [INSTALLATION.md](INSTALLATION.md) pour les détails complets.**

---

## 🧪 Tests et Validation

### Comptes de Test Disponibles

- **Utilisateur** : `user` / `user123`
- **Admin** : `admin` / `admin123`
- **Employés** : `employe1` à `employe5` / `employe123`

### Scénarios de Test

1. ✅ **Inscription** : Créer un nouveau compte
2. ✅ **Connexion** : Se connecter avec un compte existant
3. ✅ **Recherche** : Chercher un trajet (ex: "Paris" → "Lyon")
4. ✅ **Réservation** : Réserver un trajet (crédits déduits)
5. ✅ **Création** : Proposer un nouveau trajet
6. ✅ **Dashboard** : Voir ses statistiques et historique
7. ✅ **Avis** : Laisser un avis après un trajet
8. ✅ **Notifications** : Recevoir et consulter les notifications

**Voir [COMPTES_TEST.md](COMPTES_TEST.md) pour tous les comptes.**

---

## 📝 API REST

### Endpoints Disponibles

#### Authentification (`api/auth.php`)
- `POST ?action=register` - Inscription
- `POST ?action=login` - Connexion
- `POST ?action=logout` - Déconnexion
- `GET ?action=check-session` - Vérifier session

#### Covoiturages (`api/trips.php`)
- `POST ?action=search` - Rechercher des trajets
- `POST ?action=create-trip` - Créer un trajet
- `POST ?action=participate` - Réserver un trajet
- `GET ?action=trips` - Historique des trajets

#### Avis (`api/reviews.php`)
- `POST ?action=create` - Créer un avis
- `GET ?action=pending` - Avis en attente (modération)
- `POST ?action=moderate` - Modérer un avis

#### Statistiques (`api/stats.php`)
- `GET ?action=user` - Statistiques utilisateur
- `GET ?action=platform` - Statistiques plateforme

#### Notifications (`api/notifications.php`)
- `GET ?action=list` - Liste des notifications
- `POST ?action=read` - Marquer comme lue

**Format de réponse :** JSON avec `success`, `message`, `data`

---

## 🎨 Interface Utilisateur

### Pages Disponibles

1. **home.html** : Page d'accueil avec présentation
2. **login.html** : Page de connexion
3. **register.html** : Page d'inscription
4. **dashboard.html** : Tableau de bord utilisateur
5. **covoiurage-disponibles.html** : Liste des trajets disponibles
6. **contact.html** : Page de contact

### Design Responsive

- ✅ **Mobile First** : Interface adaptée aux petits écrans
- ✅ **Tailwind CSS** : Design moderne et cohérent
- ✅ **Graphiques** : Visualisation des statistiques avec Chart.js
- ✅ **Navigation** : Menu dynamique selon le rôle utilisateur

---

## ✅ Compétences Acquises

### Front-end

#### 1. Installation et Configuration de l'Environnement
- ✅ Configuration de l'environnement de développement
- ✅ Utilisation de Docker pour l'isolation
- ✅ Gestion des dépendances (Tailwind CSS, Chart.js)

#### 2. Maquettage des Interfaces
- ✅ Conception des wireframes (pages HTML)
- ✅ Design responsive et accessible
- ✅ Structure sémantique HTML5

#### 3. Interfaces Statiques
- ✅ Pages HTML structurées
- ✅ Styles CSS (personnalisés + Tailwind)
- ✅ Mise en page responsive

#### 4. Interfaces Dynamiques
- ✅ Manipulation du DOM avec JavaScript
- ✅ Appels API asynchrones (fetch)
- ✅ Gestion des événements utilisateur
- ✅ Mise à jour dynamique de l'interface
- ✅ Gestion des sessions côté client

### Back-end

#### 1. Base de Données Relationnelle
- ✅ Conception du schéma (MCD/MLD)
- ✅ Création des tables avec clés primaires/étrangères
- ✅ Relations entre tables (CASCADE, SET NULL)
- ✅ Contraintes d'intégrité (UNIQUE, CHECK)
- ✅ Index pour optimiser les performances

#### 2. Composants d'Accès aux Données SQL
- ✅ Utilisation de PDO pour MySQL
- ✅ Requêtes préparées (protection SQL injection)
- ✅ Gestion des transactions
- ✅ CRUD complet sur toutes les entités
- ✅ Requêtes complexes avec JOIN

#### 3. Composants Métier Côté Serveur
- ✅ API REST avec PHP
- ✅ Authentification et autorisation
- ✅ Validation des données
- ✅ Gestion des erreurs
- ✅ Logique métier (crédits, réservations, avis)

#### 4. Documentation du Déploiement
- ✅ Guide d'installation (INSTALLATION.md)
- ✅ Configuration Docker (docker-compose.yml)
- ✅ README complet
- ✅ Documentation des API
- ✅ Instructions de test

---

## 🌟 Points Forts du Projet

1. **100% SQL** : Aucune dépendance NoSQL, projet simplifié et testable facilement
2. **Docker Ready** : Démarrage en une seule commande (`docker-compose up -d`)
3. **Sécurité** : Mots de passe hashés, requêtes préparées, protection XSS
4. **CRUD Complet** : Toutes les opérations sur les entités principales
5. **Multi-Rôles** : Gestion des utilisateurs, employés et administrateurs
6. **Documentation Complète** : Guides d'installation, comptes de test, API
7. **Code Propre** : Commentaires, structure modulaire, séparation des responsabilités
8. **Testable en Local** : Fonctionne avec Docker ou XAMPP en moins de 5 minutes

---

## 📚 Documentation Disponible

- **[README.md](README.md)** : Vue d'ensemble et démarrage rapide
- **[INSTALLATION.md](INSTALLATION.md)** : Guide d'installation détaillé (Docker + XAMPP)
- **[COMPTES_TEST.md](COMPTES_TEST.md)** : Liste complète des comptes de test
- **[PRESENTATION.md](PRESENTATION.md)** : Ce document (présentation complète)

---

## 🎓 Conclusion

Le projet **EcoRide** démontre une maîtrise complète des compétences requises pour le développement d'une application web sécurisée, avec :

- ✅ Front-end moderne et responsive
- ✅ Back-end robuste avec API REST
- ✅ Base de données relationnelle bien structurée
- ✅ Sécurité implémentée à tous les niveaux
- ✅ Déploiement simplifié avec Docker
- ✅ Documentation complète et claire

Le projet est **100% fonctionnel**, **testable en local** en moins de 5 minutes, et **conforme** aux critères du référentiel Studii.

---

**Développé avec ❤️ pour l'apprentissage et la démonstration des compétences en développement web sécurisé.**

