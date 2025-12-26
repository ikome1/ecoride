# 📋 Cahier des Charges - EcoRide

## 🌿 Application Web de Covoiturage Écologique

---

## 1. Présentation du Projet

### 1.1 Contexte

**EcoRide** est une application web de covoiturage écologique développée pour répondre à un besoin croissant de mobilité durable et responsable. L'application permet de mettre en relation des conducteurs et des passagers souhaitant partager leurs trajets afin de réduire l'empreinte carbone des déplacements tout en facilitant la mobilité.

### 1.2 Objectifs Principaux

- ✅ Réduire l'empreinte carbone des déplacements en favorisant le partage de véhicules
- ✅ Faciliter la rencontre entre conducteurs et passagers
- ✅ Offrir une solution économique pour les utilisateurs
- ✅ Créer une communauté engagée pour un avenir plus vert
- ✅ Développer une application web moderne, sécurisée et performante

### 1.3 Portée du Projet

Le projet consiste en une application web complète comprenant :
- Une interface utilisateur moderne et responsive
- Un système d'authentification multi-rôles
- Une gestion complète des covoiturages (CRUD)
- Un système de crédits intégré
- Un système d'avis et de notation
- Des espaces dédiés pour utilisateurs, employés et administrateurs

---

## 2. Analyse des Besoins

### 2.1 Besoins Fonctionnels

#### 2.1.1 Gestion des Utilisateurs

**Acteurs** : Utilisateurs, Employés, Administrateurs

- **Inscription** : Création de compte avec validation des données
- **Connexion/Déconnexion** : Authentification sécurisée avec sessions
- **Profils** : Gestion des informations personnelles
- **Rôles** : Système de rôles (utilisateur, employé, administrateur)
- **Crédits** : Attribution de 20 crédits à l'inscription, gestion des crédits

#### 2.1.2 Gestion des Covoiturages

**Acteurs** : Utilisateurs (Chauffeurs et Passagers)

- **Recherche** : Recherche de trajets par ville de départ/destination et date
- **Création** : Proposition de nouveaux trajets avec véhicule associé
- **Réservation** : Participation à un covoiturage avec vérification des crédits
- **Modification** : Mise à jour des trajets (conducteur uniquement)
- **Annulation** : Suppression de trajets
- **Historique** : Consultation de l'historique des trajets

#### 2.1.3 Gestion des Véhicules

**Acteurs** : Utilisateurs (Chauffeurs)

- **Enregistrement** : Ajout de véhicules (plaque, marque, modèle, couleur, type, places)
- **Types de véhicules** : Essence, Diesel, Électrique, Hybride
- **Association** : Lien entre véhicule et utilisateur

#### 2.1.4 Système de Crédits

**Acteurs** : Tous les utilisateurs

- **Attribution initiale** : 20 crédits offerts à l'inscription
- **Débit** : Paiement en crédits lors d'une réservation
- **Crédit** : Gain de crédits pour le conducteur lors de la création d'un trajet
- **Commission plateforme** : 2 crédits pour la plateforme par réservation
- **Historique** : Traçabilité complète via la table `transactions`

#### 2.1.5 Système d'Avis et Notes

**Acteurs** : Utilisateurs, Employés

- **Notation** : Système de notation de 1 à 5 étoiles
- **Commentaires** : Possibilité de laisser des commentaires textuels
- **Modération** : Modération des avis par les employés
- **Statuts** : en_attente, approuvé, refusé

#### 2.1.6 Notifications

**Acteurs** : Tous les utilisateurs

- **Notifications en temps réel** : Alertes pour réservations, annulations, avis
- **Types** : réservation, annulation, avis, crédits
- **Gestion** : Marquage comme lu/non lu

#### 2.1.7 Statistiques

**Acteurs** : Utilisateurs, Administrateurs

- **Utilisateur** : Nombre de trajets, crédits, avis reçus
- **Plateforme** : Trajets totaux, crédits gagnés, graphiques

### 2.2 Besoins Non Fonctionnels

#### 2.2.1 Performance

- Interface réactive et fluide
- Temps de chargement optimisé
- Gestion efficace des requêtes base de données

#### 2.2.2 Sécurité

- Hashage des mots de passe (bcrypt)
- Protection contre les injections SQL (requêtes préparées)
- Protection contre les attaques XSS
- Gestion sécurisée des sessions
- Validation des données côté client et serveur

#### 2.2.3 Utilisabilité

- Interface intuitive et ergonomique
- Design responsive (mobile, tablette, desktop)
- Messages d'erreur et de succès clairs
- Navigation simple et logique

#### 2.2.4 Accessibilité

- Compatibilité avec les navigateurs modernes
- Design responsive (mobile first)
- Structure sémantique HTML5

#### 2.2.5 Maintenabilité

- Code propre et commenté
- Structure modulaire
- Séparation des responsabilités (front-end / back-end)
- Documentation complète

---

## 3. Contraintes Techniques

### 3.1 Technologies Imposées

- **Backend** : PHP 8.1 ou supérieur
- **Base de données** : MySQL 8.0 (100% SQL, pas de NoSQL)
- **Serveur web** : Apache 2.4+
- **Frontend** : HTML5, CSS3, JavaScript (ES6+)
- **Accès base de données** : PDO (PHP Data Objects)

### 3.2 Technologies Recommandées

- **CSS Framework** : Tailwind CSS (pour un design moderne)
- **Visualisation** : Chart.js (pour les graphiques)
- **Containerisation** : Docker & Docker Compose (pour le déploiement)

### 3.3 Contraintes Architecturales

- **API REST** : Architecture client-serveur avec API REST PHP
- **Base de données relationnelle** : Structure conforme au Modèle Conceptuel de Données (MCD)
- **Pas de framework JavaScript lourd** : Vanilla JavaScript recommandé

---

## 4. Utilisateurs Cibles

### 4.1 Utilisateurs Standards

- **Chauffeurs** : Personnes possédant un véhicule souhaitant partager leurs trajets
- **Passagers** : Personnes cherchant un moyen de transport économique et écologique
- **Chauffeurs-Passagers** : Utilisateurs pouvant être les deux

### 4.2 Employés

- Modération des avis
- Consultation des utilisateurs et véhicules
- Gestion des notifications

### 4.3 Administrateurs

- Gestion globale de la plateforme
- Consultation des statistiques détaillées
- Gestion des comptes utilisateurs

---

## 5. Architecture et Structure

### 5.1 Architecture Générale

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Front-end     │  HTTP   │   Back-end      │   SQL    │   Base de       │
│   (HTML/CSS/JS) │ ◄─────► │   (PHP API)     │ ◄──────► │   Données       │
│                 │         │                 │          │   (MySQL)       │
└─────────────────┘         └─────────────────┘          └─────────────────┘
```

### 5.2 Structure des Fichiers

```
EcoRide--main/
├── api/                    # API REST PHP
│   ├── auth.php           # Authentification
│   ├── trips.php           # Gestion des covoiturages
│   ├── reviews.php         # Système d'avis
│   ├── stats.php           # Statistiques
│   ├── notifications.php   # Notifications
│   ├── cache.php           # Service de cache
│   └── config.php          # Configuration base de données
├── css/                    # Feuilles de style
├── js/                     # Scripts JavaScript
│   ├── apiClient.js       # Client API réutilisable
│   ├── auth.js            # Gestion authentification
│   ├── dashboard.js       # Logique du tableau de bord
│   ├── tripManager.js     # Gestion des trajets
│   └── userManager.js     # Gestion des utilisateurs
├── database/               # Base de données
│   └── ecoride.sql        # Schéma SQL complet
├── images/                 # Ressources images
├── *.html                  # Pages HTML
├── docker-compose.yml      # Configuration Docker
└── Dockerfile              # Image Docker PHP/Apache
```

### 5.3 Base de Données

#### 5.3.1 Tables Principales

- **users** : Utilisateurs de la plateforme
- **vehicles** : Véhicules enregistrés
- **trips** : Voyages proposés
- **reservations** : Réservations de trajets
- **reviews** : Avis et notes
- **transactions** : Historique des crédits
- **notifications** : Notifications utilisateur
- **employees** : Comptes employés
- **admins** : Comptes administrateurs
- **platform_stats** : Statistiques de la plateforme

#### 5.3.2 Contraintes d'Intégrité

- Clés étrangères avec `ON DELETE CASCADE` et `ON DELETE SET NULL`
- Contraintes d'unicité (`UNIQUE`)
- Contraintes de validation (`CHECK`)
- Index sur les colonnes fréquemment interrogées

---

## 6. Interface Utilisateur

### 6.1 Design System

#### 6.1.1 Palette de Couleurs Écologique

- **Vert foncé** (#2E7D32) : Titres, accents
- **Vert principal** (#66BB6A) : Boutons, liens
- **Vert clair** (#A5D6A7) : Arrière-plans
- **Fond** (#F1F8E9) : Écran principal
- **Texte** (#263238) : Texte principal

#### 6.1.2 Typographie

- Police principale : "Segoe UI", Roboto, Arial, sans-serif
- Hiérarchie claire des titres

### 6.2 Pages Principales

1. **home.html** : Page d'accueil avec présentation et recherche
2. **login.html** : Page de connexion
3. **register.html** : Page d'inscription
4. **dashboard.html** : Tableau de bord utilisateur
5. **covoiurage-disponibles.html** : Liste des trajets disponibles
6. **admin-dashboard.html** : Tableau de bord administrateur
7. **employee-dashboard.html** : Tableau de bord employé
8. **contact.html** : Page de contact
9. **mentions-legales.html** : Mentions légales

### 6.3 Responsive Design

- **Mobile First** : Design pensé d'abord pour mobile
- **Breakpoints** :
  - Mobile : < 768px
  - Tablette : 768px - 1024px
  - Desktop : > 1024px

---

## 7. API REST

### 7.1 Endpoints Principaux

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

### 7.2 Format de Réponse

Toutes les réponses API sont en JSON avec la structure :
```json
{
  "success": true/false,
  "message": "Message descriptif",
  "data": { ... }
}
```

---

## 8. Règles Métier

### 8.1 Système de Crédits

- **Inscription** : Attribution de 20 crédits gratuits
- **Réservation** : Déduction du prix du trajet en crédits
- **Création trajet** : Gain de crédits pour le conducteur (prix × nombre de passagers)
- **Commission** : 2 crédits pour la plateforme par réservation

### 8.2 Réservation

- Vérification des crédits suffisants avant réservation
- Vérification des places disponibles
- Double confirmation avant réservation définitive
- Déduction immédiate des crédits

### 8.3 Avis

- Notation de 1 à 5 étoiles
- Commentaires textuels optionnels
- Modération obligatoire par les employés avant publication
- Statuts : en_attente, approuvé, refusé

---

## 9. Sécurité

### 9.1 Mesures de Sécurité

- **Mots de passe** : Hashage avec `password_hash()` (bcrypt)
- **Injection SQL** : Requêtes préparées avec PDO
- **XSS** : Échappement des données avec `htmlspecialchars()`
- **Sessions** : Gestion sécurisée des sessions PHP
- **Validation** : Validation côté client et serveur
- **CORS** : Headers CORS configurés pour l'API

### 9.2 Contraintes de Sécurité

- Pas de stockage de mots de passe en clair
- Aucune concaténation directe de variables dans les requêtes SQL
- Validation stricte de toutes les entrées utilisateur
- Gestion des erreurs sans exposer d'informations sensibles

---

## 10. Déploiement

### 10.1 Option 1 : Docker (Recommandé)

**Avantages** :
- Configuration automatique
- Base de données créée et importée automatiquement
- Environnement isolé et reproductible
- Une seule commande : `docker-compose up -d`

**Accès** : `http://localhost:8080`

### 10.2 Option 2 : XAMPP

**Étapes** :
1. Installer XAMPP avec PHP 8.1+
2. Démarrer Apache et MySQL
3. Créer la base `ecoride` dans phpMyAdmin
4. Importer `database/ecoride.sql`
5. Copier les fichiers dans `htdocs/ecoride/`
6. Accéder à `http://localhost/ecoride/`

---

## 11. Tests et Validation

### 11.1 Comptes de Test

- **Utilisateur** : `user` / `user123`
- **Admin** : `admin` / `admin123`
- **Employés** : `employe1` à `employe5` / `employe123`

### 11.2 Scénarios de Test

1. Inscription d'un nouveau compte
2. Connexion avec un compte existant
3. Recherche de trajets (départ, destination, date)
4. Réservation d'un trajet (vérification des crédits)
5. Création d'un nouveau trajet
6. Consultation du tableau de bord
7. Laisse d'un avis après un trajet
8. Consultation des notifications

---

## 12. Critères de Réussite

### 12.1 Fonctionnels

- ✅ Toutes les fonctionnalités principales implémentées
- ✅ Gestion complète des utilisateurs (inscription, connexion, profils)
- ✅ CRUD complet sur les covoiturages
- ✅ Système de crédits fonctionnel
- ✅ Système d'avis et modération opérationnel
- ✅ Multi-rôles (utilisateur, employé, admin) fonctionnels

### 12.2 Techniques

- ✅ Code propre et documenté
- ✅ Sécurité implémentée à tous les niveaux
- ✅ Base de données relationnelle bien structurée
- ✅ API REST fonctionnelle
- ✅ Interface responsive et moderne
- ✅ Déploiement simplifié (Docker)

### 12.3 Qualité

- ✅ Documentation complète
- ✅ Guide d'installation clair
- ✅ Comptes de test fournis
- ✅ Projet testable en local en moins de 5 minutes

---

## 13. Livrables

### 13.1 Code Source

- Code source complet de l'application
- Base de données SQL avec données de test
- Configuration Docker

### 13.2 Documentation

- README.md : Vue d'ensemble et démarrage rapide
- ECF-DOCUMENTATION.md : Documentation technique complète
- cahier-charge.md : Ce document (cahier des charges)
- Guide d'installation détaillé dans le README

---

## 14. Planning et Étapes de Développement

### 14.1 Phases de Développement

1. **Phase 1** : Analyse et conception
   - Analyse des besoins
   - Conception de la base de données
   - Maquettage des interfaces

2. **Phase 2** : Développement backend
   - Configuration de la base de données
   - Développement de l'API REST
   - Implémentation de la logique métier

3. **Phase 3** : Développement frontend
   - Développement des interfaces HTML/CSS
   - Intégration JavaScript
   - Communication avec l'API

4. **Phase 4** : Sécurité et optimisation
   - Implémentation des mesures de sécurité
   - Optimisation des performances
   - Tests de sécurité

5. **Phase 5** : Tests et déploiement
   - Tests fonctionnels
   - Configuration Docker
   - Documentation finale

---

## 15. Conclusion

Le projet **EcoRide** vise à créer une application web de covoiturage écologique complète, sécurisée et performante. Le cahier des charges définit les objectifs, besoins, contraintes et livrables nécessaires pour garantir le succès du projet.

L'application doit être **100% fonctionnelle**, **testable en local** en moins de 5 minutes grâce à Docker, et **conforme** aux standards de développement web moderne et sécurisé.

---

**Document créé le** : 2025-01-27  
**Version** : 1.0  
**Projet** : EcoRide - Application de Covoiturage Écologique

