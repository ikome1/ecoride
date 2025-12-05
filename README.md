# 🌿 EcoRide - Application de Covoiturage

Application web de covoiturage écologique.

## 🚀 Démarrage Rapide en Local

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
- ✅ PHP 8.1 + Apache + toutes les extensions
- ✅ MySQL 8.0 + base de données créée + SQL importé
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

**Tu peux voir [INSTALLATION.md](INSTALLATION.md) pour plus de détails.**

---

## 🧪 Tester l'Application

### Comptes de Test

- **Utilisateur** : `user` / `user123`
- **Admin** : `admin` / `admin123`
- **Employés** : `employe1` à `employe5` / `employe123`

Voir [COMPTES_TEST.md](COMPTES_TEST.md) pour tous les comptes.

### Tests à Effectuer

1. **Connexion** : Se connecter avec un compte de test
2. **Inscription** : Créer un nouveau compte (20 crédits offerts)
3. **Recherche** : Chercher un covoiturage (ex: "Paris" + date)
4. **Réservation** : Réserver un trajet (crédits déduits)
5. **Dashboard** : Voir ses voyages et statistiques

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
│   └── notifications.php   # Notifications
├── css/                    # Styles
├── js/                     # Scripts JavaScript
├── database/               # Base de données
│   └── ecoride.sql         # Schéma SQL
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
- HTML5, CSS3, JavaScript (ES6+)
- Tailwind CSS (framework CSS)
- Chart.js (graphiques)

### Back-end
- **PHP 8.1+** (API REST)
- **MySQL 8.0** (base de données relationnelle - SQL uniquement)

### Outils
- Docker & Docker Compose
- Git

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

### MySQL (SQL uniquement)
- Tables : users, vehicles, trips, reservations, reviews, transactions, notifications
- Schéma : `database/ecoride.sql`
- **100% SQL** - Aucune base de données NoSQL utilisée

---

## 📚 Documentation

- **[INSTALLATION.md](INSTALLATION.md)** - Guide d'installation
- **[COMPTES_TEST.md](COMPTES_TEST.md)** - Comptes de test
- **[CONFORMITE.md](CONFORMITE.md)** - Vérification de conformité aux critères

---

## ⚙️ Configuration

### Fichier de Configuration
Modifier `api/config.php` si nécessaire :
```php
private $host = 'localhost';
private $db_name = 'ecoride';
private $username = 'root';
private $password = '';
```

---

## 🐛 Problèmes Courants

### Erreur de connexion à la base
- Vérifier que MySQL est démarré
- Vérifier les paramètres dans `api/config.php`

---

## ✅ Fonctionnalités

- ✅ Authentification multi-rôles
- ✅ Gestion des covoiturages
- ✅ Système de crédits
- ✅ Recherche et réservation
- ✅ Avis et notes
- ✅ Statistiques
- ✅ Notifications

---

**Bon développement ! 🚀**
