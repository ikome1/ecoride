# Comptes de test EcoRide

## 📋 Comptes disponibles

### 👤 Utilisateur standard
- **Pseudo** : `user`
- **Mot de passe** : `user123`
- **Rôle** : Utilisateur
- **Accès** : Dashboard utilisateur

### 👷 Employés (5 comptes)
Tous les employés ont le même mot de passe : `employe123`

1. **Employé 1**
   - Pseudo : `employe1`
   - Email : `employe1@ecoride.fr`
   - Mot de passe : `employe123`

2. **Employé 2**
   - Pseudo : `employe2`
   - Email : `employe2@ecoride.fr`
   - Mot de passe : `employe123`

3. **Employé 3**
   - Pseudo : `employe3`
   - Email : `employe3@ecoride.fr`
   - Mot de passe : `employe123`

4. **Employé 4**
   - Pseudo : `employe4`
   - Email : `employe4@ecoride.fr`
   - Mot de passe : `employe123`

5. **Employé 5**
   - Pseudo : `employe5`
   - Email : `employe5@ecoride.fr`
   - Mot de passe : `employe123`

### 👑 Administrateur
- **Pseudo** : `admin`
- **Email** : `admin@ecoride.fr`
- **Mot de passe** : `admin123`
- **Rôle** : Administrateur
- **Accès** : Dashboard administrateur

## 🎯 Accès selon les rôles

- **Utilisateur** → `dashboard.html`
- **Employé** → `employee-dashboard.html`
- **Administrateur** → `admin-dashboard.html`

## 🔐 Note importante

Les mots de passe sont stockés en base64 dans le localStorage. Pour la production, utilisez un système de hachage sécurisé (bcrypt).
