// Système de gestion des utilisateurs et authentification
class UserManager {
  constructor() {
    this.currentUser = null;
    // Charger d'abord employees et admins pour pouvoir filtrer users
    this.employees = this.loadEmployees();
    this.admins = this.loadAdmins();
    this.users = this.loadUsers();
    
    // Vérifier et nettoyer les conflits après chargement
    this.cleanConflicts();
  }
  
  // Nettoyer les conflits entre tables
  cleanConflicts() {
    const employeesPseudos = this.employees.map(e => e.pseudo);
    const adminsPseudos = this.admins.map(a => a.pseudo);
    
    // Supprimer les utilisateurs qui sont aussi employés ou admins
    const originalLength = this.users.length;
    this.users = this.users.filter(u => {
      if (employeesPseudos.includes(u.pseudo) || adminsPseudos.includes(u.pseudo)) {
        console.log('UserManager: Suppression du conflit -', u.pseudo, 'existe aussi comme employé/admin');
        return false;
      }
      return true;
    });
    
    if (this.users.length !== originalLength) {
      console.log('UserManager: Conflits nettoyés,', originalLength - this.users.length, 'utilisateurs supprimés');
      this.saveUsers();
    }
  }

  // Charger les utilisateurs depuis le localStorage
  loadUsers() {
    try {
      const users = localStorage.getItem('ecoride_users');
      if (users) {
        const parsed = JSON.parse(users);
        console.log('Utilisateurs chargés depuis localStorage:', parsed.length);
        
        // Charger temporairement les employés et admins pour vérifier les conflits
        const employeesData = localStorage.getItem('ecoride_employees');
        const adminsData = localStorage.getItem('ecoride_admins');
        const employees = employeesData ? JSON.parse(employeesData) : [];
        const admins = adminsData ? JSON.parse(adminsData) : [];
        
        // Vérifier et supprimer les utilisateurs qui sont aussi des employés ou admins
        const employeesPseudos = employees.map(e => e.pseudo);
        const adminsPseudos = admins.map(a => a.pseudo);
        const filteredUsers = parsed.filter(u => {
          if (employeesPseudos.includes(u.pseudo) || adminsPseudos.includes(u.pseudo)) {
            console.log('UserManager: Suppression de l\'utilisateur', u.pseudo, 'car il existe aussi comme employé/admin');
            return false;
          }
          return true;
        });
        
        if (filteredUsers.length !== parsed.length) {
          console.log('UserManager: Utilisateurs filtrés:', filteredUsers.length, 'sur', parsed.length);
          localStorage.setItem('ecoride_users', JSON.stringify(filteredUsers));
          return filteredUsers;
        }
        
        return parsed;
      } else {
        // Initialiser avec un compte utilisateur de test par défaut
        const defaultUsers = [
          {
            id: 1,
            pseudo: 'user',
            email: 'user@user.com',
            password: btoa('user123'),
            credits: 20,
            role: 'user',
            type: 'passager',
            vehicles: [],
            preferences: {
              fumeur: false,
              animaux: false,
              autres: []
            },
            trips: [],
            createdAt: new Date().toISOString()
          }
        ];
        // Sauvegarder les utilisateurs par défaut dans le localStorage
        localStorage.setItem('ecoride_users', JSON.stringify(defaultUsers));
        console.log('Utilisateurs par défaut initialisés');
        return defaultUsers;
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      console.log('Initialisation avec tableau vide');
      return [];
    }
  }

  // Charger les employés depuis le localStorage
  loadEmployees() {
    const employees = localStorage.getItem('ecoride_employees');
    if (employees) {
      const parsed = JSON.parse(employees);
      console.log('Employés chargés depuis localStorage:', parsed.length);
      // S'assurer que tous les employés ont le bon rôle
      parsed.forEach(emp => {
        if (!emp.role || emp.role !== 'employee') {
          console.log('UserManager: Correction du rôle pour', emp.pseudo, ':', emp.role, '-> employee');
          emp.role = 'employee';
        }
      });
      // Sauvegarder les corrections
      localStorage.setItem('ecoride_employees', JSON.stringify(parsed));
      return parsed;
    } else {
      // Initialiser les 5 employés par défaut
      const defaultEmployees = [
        {
          id: 1,
          pseudo: 'employe1',
          email: 'employe1@ecoride.fr',
          password: btoa('employe123'),
          role: 'employee'
        },
        {
          id: 2,
          pseudo: 'employe2',
          email: 'employe2@ecoride.fr',
          password: btoa('employe123'),
          role: 'employee'
        },
        {
          id: 3,
          pseudo: 'employe3',
          email: 'employe3@ecoride.fr',
          password: btoa('employe123'),
          role: 'employee'
        },
        {
          id: 4,
          pseudo: 'employe4',
          email: 'employe4@ecoride.fr',
          password: btoa('employe123'),
          role: 'employee'
        },
        {
          id: 5,
          pseudo: 'employe5',
          email: 'employe5@ecoride.fr',
          password: btoa('employe123'),
          role: 'employee'
        }
      ];
      // Sauvegarder les employés par défaut dans le localStorage
      localStorage.setItem('ecoride_employees', JSON.stringify(defaultEmployees));
      return defaultEmployees;
    }
  }

  // Charger les administrateurs depuis le localStorage
  loadAdmins() {
    const admins = localStorage.getItem('ecoride_admins');
    if (admins) {
      const parsed = JSON.parse(admins);
      console.log('Admins chargés depuis localStorage:', parsed.length);
      return parsed;
    } else {
      // Initialiser avec un compte admin par défaut
      const defaultAdmins = [
        {
          id: 1,
          pseudo: 'admin',
          email: 'admin@ecoride.fr',
          password: btoa('admin123'),
          role: 'admin'
        }
      ];
      // Sauvegarder les admins par défaut dans le localStorage
      localStorage.setItem('ecoride_admins', JSON.stringify(defaultAdmins));
      console.log('Admins par défaut initialisés');
      console.log('Admin - pseudo:', defaultAdmins[0].pseudo);
      console.log('Admin - password hash:', defaultAdmins[0].password);
      console.log('Admin - role:', defaultAdmins[0].role);
      return defaultAdmins;
    }
  }

  // Sauvegarder les utilisateurs
  saveUsers() {
    try {
      const usersJson = JSON.stringify(this.users);
      localStorage.setItem('ecoride_users', usersJson);
      console.log('Utilisateurs sauvegardés:', this.users.length);
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des utilisateurs:', error);
      return false;
    }
  }

  // Sauvegarder les employés
  saveEmployees() {
    localStorage.setItem('ecoride_employees', JSON.stringify(this.employees));
  }

  // Sauvegarder les administrateurs
  saveAdmins() {
    localStorage.setItem('ecoride_admins', JSON.stringify(this.admins));
  }

  // Créer un compte utilisateur (US 7)
  createAccount(pseudo, email, password) {
    console.log('createAccount appelé avec:', { pseudo, email });
    
    // Vérifier si le pseudo ou email existe déjà
    const existingUser = this.users.find(u => u.pseudo === pseudo || u.email === email);
    if (existingUser) {
      console.log('Utilisateur existant trouvé:', existingUser);
      throw new Error('Ce pseudo ou email est déjà utilisé');
    }

    // Vérifier la sécurité du mot de passe
    if (!this.isPasswordSecure(password)) {
      console.log('Mot de passe non sécurisé');
      throw new Error('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre');
    }

    const newUser = {
      id: Date.now(),
      pseudo: pseudo,
      email: email,
      password: this.hashPassword(password),
      credits: 20, // 20 crédits à la création
      role: 'user',
      type: 'passager', // Par défaut passager
      vehicles: [],
      preferences: {
        fumeur: false,
        animaux: false,
        autres: []
      },
      trips: [], // Historique des covoiturages
      createdAt: new Date().toISOString()
    };

    console.log('Nouvel utilisateur créé:', newUser);
    
    this.users.push(newUser);
    console.log('Utilisateur ajouté à la liste, nombre total:', this.users.length);
    
    const saveResult = this.saveUsers();
    if (!saveResult) {
      // Si la sauvegarde échoue, retirer l'utilisateur de la liste
      this.users.pop();
      throw new Error('Erreur lors de la sauvegarde du compte');
    }
    console.log('Utilisateurs sauvegardés dans localStorage');
    
    return newUser;
  }

  // Vérifier la sécurité du mot de passe
  isPasswordSecure(password) {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    return minLength && hasUpperCase && hasLowerCase && hasNumber;
  }

  // Hash simple du mot de passe (en production, utiliser bcrypt)
  hashPassword(password) {
    return btoa(password); // Simple base64 pour la démo
  }

  // Vérifier le mot de passe
  verifyPassword(password, hash) {
    return btoa(password) === hash;
  }

  // Connexion utilisateur
  login(pseudo, password) {
    console.log('UserManager.login: Tentative de connexion pour:', pseudo);
    console.log('UserManager.login: Nombre d\'utilisateurs:', this.users.length);
    console.log('UserManager.login: Nombre d\'employés:', this.employees.length);
    console.log('UserManager.login: Nombre d\'admins:', this.admins.length);
    
    // IMPORTANT: Chercher d'abord dans les employés et admins pour éviter les conflits
    // Si un pseudo existe à la fois dans users et employees, on privilégie employees
    
    // Chercher dans les employés EN PREMIER
    let employee = this.employees.find(e => e.pseudo === pseudo);
    console.log('UserManager.login: Employé trouvé:', employee ? employee.pseudo : 'aucun');
    
    if (employee) {
      console.log('UserManager.login: Employé trouvé, vérification du mot de passe...');
      console.log('UserManager.login: Employé trouvé - pseudo:', employee.pseudo);
      console.log('UserManager.login: Employé trouvé - rôle:', employee.role);
      console.log('UserManager.login: Employé trouvé - données complètes:', employee);
      
      const employeePasswordMatch = this.verifyPassword(password, employee.password);
      console.log('UserManager.login: Mot de passe employé correspond?', employeePasswordMatch);
      
      if (employeePasswordMatch) {
        console.log('UserManager.login: Connexion réussie (employee)');
        // S'assurer que le rôle est bien défini
        if (!employee.role) {
          employee.role = 'employee';
          console.log('UserManager.login: Rôle manquant, défini à "employee"');
        }
        console.log('UserManager.login: Employé avant sauvegarde:', employee);
        this.currentUser = employee;
        localStorage.setItem('ecoride_current_user', JSON.stringify(employee));
        console.log('UserManager.login: Employé sauvegardé dans localStorage');
        const verifyEmployee = localStorage.getItem('ecoride_current_user');
        const parsedEmployee = JSON.parse(verifyEmployee);
        console.log('UserManager.login: Vérification - pseudo sauvegardé:', parsedEmployee.pseudo);
        console.log('UserManager.login: Vérification - rôle sauvegardé:', parsedEmployee.role);
        return { success: true, user: employee };
      } else {
        console.log('UserManager.login: Mot de passe incorrect pour employee');
      }
    }
    
    // Chercher dans les administrateurs
    let admin = this.admins.find(a => a.pseudo === pseudo);
    console.log('UserManager.login: Admin trouvé:', admin ? admin.pseudo : 'aucun');
    
    if (admin) {
      console.log('UserManager.login: Admin trouvé, vérification du mot de passe...');
      console.log('UserManager.login: Password hashé stocké (admin):', admin.password);
      console.log('UserManager.login: Password hashé calculé:', btoa(password));
      const adminPasswordMatch = this.verifyPassword(password, admin.password);
      console.log('UserManager.login: Mot de passe admin correspond?', adminPasswordMatch);
      
      if (adminPasswordMatch) {
        console.log('UserManager.login: Connexion réussie (admin)');
        console.log('UserManager.login: Admin avant sauvegarde:', admin);
        this.currentUser = admin;
        localStorage.setItem('ecoride_current_user', JSON.stringify(admin));
        console.log('UserManager.login: Admin sauvegardé dans localStorage');
        const verifyAdmin = localStorage.getItem('ecoride_current_user');
        const parsedAdmin = JSON.parse(verifyAdmin);
        console.log('UserManager.login: Vérification - pseudo sauvegardé:', parsedAdmin.pseudo);
        console.log('UserManager.login: Vérification - rôle sauvegardé:', parsedAdmin.role);
        return { success: true, user: admin };
      } else {
        console.log('UserManager.login: Mot de passe incorrect pour admin');
      }
    }
    
    // Chercher dans les utilisateurs EN DERNIER (pour éviter les conflits)
    let user = this.users.find(u => u.pseudo === pseudo);
    console.log('UserManager.login: Utilisateur trouvé dans users:', user ? user.pseudo : 'aucun');
    
    if (user) {
      console.log('UserManager.login: Utilisateur trouvé, vérification du mot de passe...');
      console.log('UserManager.login: Password hashé stocké:', user.password);
      console.log('UserManager.login: Password hashé calculé:', btoa(password));
      const passwordMatch = this.verifyPassword(password, user.password);
      console.log('UserManager.login: Mot de passe correspond?', passwordMatch);
      
      if (passwordMatch) {
        console.log('UserManager.login: Connexion réussie (user)');
        this.currentUser = user;
        localStorage.setItem('ecoride_current_user', JSON.stringify(user));
        console.log('UserManager.login: Utilisateur sauvegardé dans localStorage');
        const verify = localStorage.getItem('ecoride_current_user');
        console.log('UserManager.login: Vérification localStorage après sauvegarde:', verify ? 'OK' : 'ÉCHEC');
        return { success: true, user: user };
      } else {
        console.log('UserManager.login: Mot de passe incorrect pour user');
      }
    }


    console.log('UserManager.login: Échec de connexion - identifiants incorrects');
    return { success: false, message: 'Identifiants incorrects' };
  }

  // Déconnexion
  logout() {
    this.currentUser = null;
    localStorage.removeItem('ecoride_current_user');
  }

  // Vérifier si un utilisateur est connecté
  isLoggedIn() {
    // D'abord vérifier le localStorage
    const stored = localStorage.getItem('ecoride_current_user');
    console.log('UserManager.isLoggedIn: localStorage contient:', stored ? 'oui' : 'non');
    
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        console.log('UserManager.isLoggedIn: Données utilisateur parsées:', userData.pseudo, userData.role);
        
        // Si l'utilisateur est déjà en mémoire, le retourner
        if (this.currentUser && this.currentUser.id === userData.id) {
          console.log('UserManager.isLoggedIn: Utilisateur déjà en mémoire, retour true');
          return true;
        }
        
        // Vérifier que l'utilisateur existe dans les tableaux OU accepter s'il est dans localStorage
        // (pour les utilisateurs créés dynamiquement ou connectés via l'API)
        const userExists = this.users.find(u => u.id === userData.id || u.pseudo === userData.pseudo) || 
                          this.employees.find(e => e.id === userData.id || e.pseudo === userData.pseudo) || 
                          this.admins.find(a => a.id === userData.id || a.pseudo === userData.pseudo);
        
        console.log('UserManager.isLoggedIn: Utilisateur trouvé dans tableaux:', userExists ? 'oui' : 'non');
        
        // Si l'utilisateur existe dans les tableaux, utiliser ces données
        if (userExists) {
          this.currentUser = userData;
          console.log('UserManager.isLoggedIn: Utilisateur trouvé dans tableaux, retour true');
          return true;
        }
        
        // Sinon, si l'utilisateur est dans localStorage avec des données valides, l'accepter quand même
        // (cela permet de gérer les utilisateurs créés dynamiquement ou connectés via l'API)
        if (userData && userData.pseudo && userData.role) {
          console.log('UserManager.isLoggedIn: Utilisateur valide dans localStorage (pas dans tableaux), retour true');
          this.currentUser = userData;
          return true;
        }
        
        // Si les données sont invalides, nettoyer
        console.log('UserManager.isLoggedIn: Données invalides, nettoyage');
        localStorage.removeItem('ecoride_current_user');
        this.currentUser = null;
        return false;
      } catch (error) {
        console.error('UserManager.isLoggedIn: Erreur lors du parsing:', error);
        localStorage.removeItem('ecoride_current_user');
        this.currentUser = null;
        return false;
      }
    }
    
    console.log('UserManager.isLoggedIn: Pas de données dans localStorage, retour false');
    return false;
  }

  // Obtenir l'utilisateur actuel
  getCurrentUser() {
    if (this.currentUser) return this.currentUser;
    
    // Si pas d'utilisateur en mémoire, vérifier le localStorage
    const stored = localStorage.getItem('ecoride_current_user');
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        
        // Vérifier que l'utilisateur existe dans les tableaux OU accepter s'il est dans localStorage
        const userExists = this.users.find(u => u.id === userData.id || u.pseudo === userData.pseudo) || 
                          this.employees.find(e => e.id === userData.id || e.pseudo === userData.pseudo) || 
                          this.admins.find(a => a.id === userData.id || a.pseudo === userData.pseudo);
        
        // Si l'utilisateur existe dans les tableaux, utiliser ces données
        if (userExists) {
          this.currentUser = userData;
          return userData;
        }
        
        // Sinon, si l'utilisateur est dans localStorage avec des données valides, l'accepter quand même
        if (userData && userData.pseudo && userData.role) {
          this.currentUser = userData;
          return userData;
        }
        
        // Si les données sont invalides, nettoyer
        localStorage.removeItem('ecoride_current_user');
        return null;
      } catch (error) {
        console.error('Erreur lors du parsing de l\'utilisateur:', error);
        localStorage.removeItem('ecoride_current_user');
        return null;
      }
    }
    return null;
  }

  // Mettre à jour le profil utilisateur (US 8)
  updateUserProfile(userId, updates) {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;

    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    this.saveUsers();

    // Mettre à jour l'utilisateur actuel si c'est lui
    if (this.currentUser && this.currentUser.id === userId) {
      this.currentUser = this.users[userIndex];
      localStorage.setItem('ecoride_current_user', JSON.stringify(this.currentUser));
    }

    return true;
  }

  // Ajouter un véhicule à un utilisateur
  addVehicle(userId, vehicle) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return false;

    // Vérifier que la plaque n'existe pas déjà
    const existingVehicle = user.vehicles.find(v => v.plaque === vehicle.plaque);
    if (existingVehicle) {
      throw new Error('Un véhicule avec cette plaque existe déjà');
    }

    const newVehicle = {
      id: Date.now(),
      plaque: vehicle.plaque,
      dateImmatriculation: vehicle.dateImmatriculation,
      marque: vehicle.marque,
      modele: vehicle.modele,
      couleur: vehicle.couleur,
      places: vehicle.places,
      type: vehicle.type || 'Essence',
      createdAt: new Date().toISOString()
    };

    user.vehicles.push(newVehicle);
    this.updateUserProfile(userId, { vehicles: user.vehicles });
    return true;
  }

  // Supprimer un véhicule
  removeVehicle(userId, vehicleId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return false;

    user.vehicles = user.vehicles.filter(v => v.id !== vehicleId);
    this.updateUserProfile(userId, { vehicles: user.vehicles });
    return true;
  }

  // Obtenir les marques de véhicules disponibles
  getAvailableBrands() {
    return [
      { name: 'Toyota', models: ['Corolla', 'Camry', 'Prius', 'RAV4', 'Highlander'] },
      { name: 'Honda', models: ['Civic', 'Accord', 'CR-V', 'Pilot', 'Fit'] },
      { name: 'Tesla', models: ['Model 3', 'Model S', 'Model X', 'Model Y'] },
      { name: 'BMW', models: ['Série 3', 'Série 5', 'X3', 'X5', 'i3', 'i8'] },
      { name: 'Ford', models: ['Mustang', 'Focus', 'Fiesta', 'Escape', 'Explorer'] },
      { name: 'Audi', models: ['A4', 'A6', 'Q5', 'Q7', 'e-tron', 'TT'] },
      { name: 'Volkswagen', models: ['Golf', 'Passat', 'Tiguan', 'Jetta', 'ID.4'] },
      { name: 'Mercedes-Benz', models: ['Classe C', 'Classe E', 'GLC', 'GLE', 'EQC'] },
      { name: 'Porsche', models: ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan'] },
      { name: 'Nissan', models: ['Leaf', 'Altima', 'Sentra', 'Rogue', 'Pathfinder'] },
      { name: 'Renault', models: ['Zoe', 'Clio', 'Megane', 'Kadjar', 'Captur'] },
      { name: 'Peugeot', models: ['208', '308', '3008', '5008', 'e-208'] },
      { name: 'Citroën', models: ['C3', 'C4', 'C5 Aircross', 'Berlingo', 'e-C4'] }
    ];
  }

  // Déduire des crédits
  deductCredits(userId, amount) {
    const user = this.users.find(u => u.id === userId);
    if (!user || user.credits < amount) return false;

    user.credits -= amount;
    this.updateUserProfile(userId, { credits: user.credits });
    return true;
  }

  // Ajouter des crédits
  addCredits(userId, amount) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return false;

    user.credits += amount;
    this.updateUserProfile(userId, { credits: user.credits });
    return true;
  }

  // Synchroniser l'utilisateur actuel avec les données en base
  syncCurrentUser() {
    console.log('UserManager.syncCurrentUser: DÉBUT');
    console.log('UserManager.syncCurrentUser: currentUser avant:', this.currentUser);
    
    if (!this.currentUser) {
      console.log('UserManager.syncCurrentUser: Pas de currentUser, chargement depuis localStorage');
      // Si pas d'utilisateur en mémoire, essayer de le charger depuis localStorage
      const stored = localStorage.getItem('ecoride_current_user');
      console.log('UserManager.syncCurrentUser: localStorage contient:', stored);
      if (stored) {
        try {
          this.currentUser = JSON.parse(stored);
          console.log('UserManager.syncCurrentUser: Utilisateur chargé depuis localStorage:', this.currentUser.pseudo);
        } catch (error) {
          console.error('UserManager.syncCurrentUser: Erreur lors du parsing:', error);
          return false;
        }
      } else {
        console.log('UserManager.syncCurrentUser: localStorage vide, retour false');
        return false;
      }
    }
    
    console.log('UserManager.syncCurrentUser: Recherche de l\'utilisateur dans les tableaux...');
    console.log('UserManager.syncCurrentUser: Recherche pour id:', this.currentUser.id, 'pseudo:', this.currentUser.pseudo);
    console.log('UserManager.syncCurrentUser: Nombre users:', this.users.length);
    console.log('UserManager.syncCurrentUser: Nombre employees:', this.employees.length);
    console.log('UserManager.syncCurrentUser: Nombre admins:', this.admins.length);
    
    // Chercher l'utilisateur dans la base de données
    let foundInUsers = this.users.find(u => u.id === this.currentUser.id || u.pseudo === this.currentUser.pseudo);
    let foundInEmployees = this.employees.find(e => e.id === this.currentUser.id || e.pseudo === this.currentUser.pseudo);
    let foundInAdmins = this.admins.find(a => a.id === this.currentUser.id || a.pseudo === this.currentUser.pseudo);
    
    console.log('UserManager.syncCurrentUser: Trouvé dans users:', foundInUsers ? foundInUsers.pseudo : 'non');
    console.log('UserManager.syncCurrentUser: Trouvé dans employees:', foundInEmployees ? foundInEmployees.pseudo : 'non');
    console.log('UserManager.syncCurrentUser: Trouvé dans admins:', foundInAdmins ? foundInAdmins.pseudo : 'non');
    
    let updatedUser = foundInUsers || foundInEmployees || foundInAdmins;
    
    if (updatedUser) {
      console.log('UserManager.syncCurrentUser: Utilisateur trouvé dans les tableaux, fusion des données');
      // Mettre à jour l'utilisateur actuel avec les données les plus récentes
      // En conservant les propriétés qui pourraient manquer (vehicles, trips, etc.)
      const mergedUser = {
        ...updatedUser,
        vehicles: updatedUser.vehicles || this.currentUser.vehicles || [],
        trips: updatedUser.trips || this.currentUser.trips || [],
        preferences: updatedUser.preferences || this.currentUser.preferences || {
          fumeur: false,
          animaux: false,
          autres: []
        }
      };
      
      this.currentUser = mergedUser;
      localStorage.setItem('ecoride_current_user', JSON.stringify(mergedUser));
      return true;
    } else {
      console.log('UserManager.syncCurrentUser: Utilisateur NON trouvé dans les tableaux');
      // Si l'utilisateur n'est pas dans les tableaux mais est dans localStorage avec des données valides,
      // l'accepter quand même (pour les utilisateurs créés dynamiquement)
      if (this.currentUser && this.currentUser.pseudo && this.currentUser.role) {
        console.log('UserManager.syncCurrentUser: Utilisateur valide dans localStorage, acceptation');
        // S'assurer que les propriétés essentielles existent
        if (!this.currentUser.vehicles) this.currentUser.vehicles = [];
        if (!this.currentUser.trips) this.currentUser.trips = [];
        if (!this.currentUser.preferences) {
          this.currentUser.preferences = {
            fumeur: false,
            animaux: false,
            autres: []
          };
        }
        // Sauvegarder dans localStorage
        localStorage.setItem('ecoride_current_user', JSON.stringify(this.currentUser));
        console.log('UserManager.syncCurrentUser: Utilisateur accepté depuis localStorage, retour true');
        return true;
      }
      
      // Si les données sont invalides, se déconnecter
      console.error('UserManager.syncCurrentUser: Données invalides, déconnexion');
      this.logout();
      return false;
    }
  }

  // Obtenir les statistiques pour l'admin
  getAdminStats() {
    const totalCreditsEarned = this.users.reduce((sum, user) => {
      return sum + (20 - user.credits); // Crédits dépensés
    }, 0);

    const tripsByDay = {};
    this.users.forEach(user => {
      user.trips.forEach(trip => {
        const date = trip.date;
        tripsByDay[date] = (tripsByDay[date] || 0) + 1;
      });
    });

    const creditsByDay = {};
    this.users.forEach(user => {
      user.trips.forEach(trip => {
        const date = trip.date;
        creditsByDay[date] = (creditsByDay[date] || 0) + 2; // 2 crédits par voyage
      });
    });

    return {
      totalUsers: this.users.length,
      totalCreditsEarned: totalCreditsEarned,
      tripsByDay: tripsByDay,
      creditsByDay: creditsByDay
    };
  }
}

// Instance globale du gestionnaire d'utilisateurs
const userManager = new UserManager();

// Export pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UserManager, userManager };
}
