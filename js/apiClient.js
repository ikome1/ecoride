/**
 * ============================================
 * API CLIENT - EcoRide
 * ============================================
 * 
 * Ce fichier contient la classe APIClient qui gère TOUS les appels
 * vers l'API PHP backend.
 * 
 * Fonctionnalités :
 * - Méthode générique makeRequest() pour tous les appels HTTP
 * - Méthodes spécifiques pour chaque type d'opération (auth, trips, etc.)
 * - Gestion de l'utilisateur connecté (currentUser)
 * - Redirection automatique selon les rôles
 * 
 * Architecture :
 * Front-end (HTML/JS) → APIClient → API PHP → MySQL
 */

/**
 * Classe APIClient
 * 
 * Point d'entrée unique pour toutes les communications avec le backend.
 * Centralise la gestion des requêtes HTTP et des réponses JSON.
 */
class APIClient {
    /**
     * Constructeur : Initialise les propriétés
     */
    constructor() {
        this.baseURL = 'api/';        // Chemin de base vers les endpoints API
        this.currentUser = null;      // Utilisateur actuellement connecté (mis à jour après login)
    }

    /**
     * Méthode générique pour effectuer des requêtes HTTP vers l'API
     * 
     * Cette méthode est utilisée par TOUTES les autres méthodes de la classe.
     * Elle gère :
     * - La construction de l'URL complète
     * - L'envoi des données en JSON
     * - La réception et le parsing des réponses JSON
     * - La gestion des erreurs
     * 
     * @param {string} endpoint Le chemin de l'endpoint (ex: 'auth.php?action=login')
     * @param {string} method La méthode HTTP ('GET', 'POST', 'PUT', 'DELETE')
     * @param {object|null} data Les données à envoyer (sera converti en JSON)
     * @returns {Promise<object>} La réponse JSON de l'API
     * 
     * @example
     * // Requête GET
     * const result = await apiClient.makeRequest('auth.php?action=check-session', 'GET');
     * 
     * // Requête POST avec données
     * const result = await apiClient.makeRequest('auth.php?action=login', 'POST', {
     *     pseudo: 'user',
     *     password: 'user123'
     * });
     */
    async makeRequest(endpoint, method = 'GET', data = null) {
        // Construire l'URL complète (ex: 'api/auth.php?action=login')
        const url = this.baseURL + endpoint;
        
        // Options de la requête HTTP
        const options = {
            method: method, // GET, POST, etc.
            headers: {
                'Content-Type': 'application/json', // Indique qu'on envoie du JSON
            }
        };

        // Si des données sont fournies, les convertir en JSON et les ajouter au body
        if (data) {
            options.body = JSON.stringify(data); // Convertir l'objet JavaScript en JSON
        }

        try {
            // Effectuer la requête HTTP avec fetch() (API native du navigateur)
            const response = await fetch(url, options);
            
            // Parser la réponse JSON
            const result = await response.json();
            
            // Vérifier si la requête a réussi (code HTTP 200-299)
            if (!response.ok) {
                // Si erreur, lancer une exception avec le message
                throw new Error(result.message || 'Erreur API');
            }
            
            // Retourner le résultat si tout est OK
            return result;
        } catch (error) {
            // En cas d'erreur (réseau, parsing JSON, etc.), logger et relancer
            console.error('Erreur API:', error);
            throw error; // Permet au code appelant de gérer l'erreur
        }
    }

    /**
     * ============================================
     * SECTION AUTHENTIFICATION
     * ============================================
     * 
     * Toutes les méthodes liées à l'authentification :
     * - Inscription, connexion, déconnexion
     * - Vérification de session
     * - Mise à jour du profil
     */
    
    /**
     * Inscription d'un nouvel utilisateur
     * 
     * @param {string} pseudo Le pseudo de l'utilisateur
     * @param {string} email L'email de l'utilisateur
     * @param {string} password Le mot de passe (sera hashé côté serveur)
     * @returns {Promise<object>} Réponse avec success, message, et user si succès
     */
    async register(pseudo, email, password) {
        return await this.makeRequest('auth.php?action=register', 'POST', {
            pseudo: pseudo,
            email: email,
            password: password
        });
    }

    /**
     * Connexion d'un utilisateur
     * 
     * Après une connexion réussie, met à jour this.currentUser
     * pour garder en mémoire l'utilisateur connecté.
     * 
     * @param {string} pseudo Le pseudo
     * @param {string} password Le mot de passe
     * @returns {Promise<object>} Réponse avec success, token, et user si succès
     */
    async login(pseudo, password) {
        const result = await this.makeRequest('auth.php?action=login', 'POST', {
            pseudo: pseudo,
            password: password
        });
        
        // Si connexion réussie, stocker l'utilisateur en mémoire
        // Cela évite de refaire un appel API à chaque fois qu'on a besoin de l'utilisateur
        if (result.success) {
            this.currentUser = result.user;
        }
        
        return result;
    }

    async logout() {
        const result = await this.makeRequest('auth.php?action=logout', 'POST');
        this.currentUser = null;
        return result;
    }

    async checkSession() {
        try {
            const result = await this.makeRequest('auth.php?action=check-session', 'GET');
            if (result.success) {
                this.currentUser = result.user;
            }
            return result;
        } catch (error) {
            this.currentUser = null;
            return { success: false, message: 'Session expirée' };
        }
    }

    async updateProfile(updates) {
        return await this.makeRequest('auth.php?action=update-profile', 'POST', updates);
    }

    /**
     * ============================================
     * SECTION COVOITURAGES
     * ============================================
     * 
     * Toutes les méthodes liées aux trajets :
     * - Recherche de trajets
     * - Réservation (participation)
     * - Création de trajets
     * - Gestion des véhicules
     */
    
    /**
     * Rechercher des trajets disponibles
     * 
     * @param {string} depart Ville de départ (recherche partielle)
     * @param {string} destination Ville de destination (optionnel)
     * @param {string} date Date du voyage (format YYYY-MM-DD)
     * @returns {Promise<object>} Liste des trajets correspondants
     */
    async searchTrips(depart, destination, date) {
        return await this.makeRequest('trips.php?action=search', 'POST', {
            depart: depart,
            destination: destination,
            date: date
        });
    }

    /**
     * Réserver un trajet (participer à un covoiturage)
     * 
     * Cette action :
     * - Déduit les crédits de l'utilisateur
     * - Crée une réservation
     * - Décrémente les places disponibles
     * - Crédite le chauffeur
     * 
     * ⚠️ Nécessite d'être connecté (session active)
     * 
     * @param {number} tripId L'ID du trajet à réserver
     * @returns {Promise<object>} Confirmation avec informations du conducteur
     */
    async participateTrip(tripId) {
        return await this.makeRequest('trips.php?action=participate', 'POST', {
            trip_id: tripId
        });
    }

    async addVehicle(vehicleData) {
        return await this.makeRequest('trips.php?action=add-vehicle', 'POST', vehicleData);
    }

    async createTrip(tripData) {
        return await this.makeRequest('trips.php?action=create-trip', 'POST', tripData);
    }

    async getUserVehicles() {
        return await this.makeRequest('trips.php?action=vehicles', 'GET');
    }

    async getUserTrips() {
        return await this.makeRequest('trips.php?action=trips', 'GET');
    }

    /**
     * ============================================
     * SECTION UTILITAIRES
     * ============================================
     * 
     * Méthodes utilitaires pour gérer l'état de l'application
     */
    
    /**
     * Vérifie si un utilisateur est actuellement connecté
     * 
     * @returns {boolean} true si connecté, false sinon
     */
    isLoggedIn() {
        return this.currentUser !== null;
    }

    /**
     * Récupère les informations de l'utilisateur connecté
     * 
     * @returns {object|null} L'objet utilisateur ou null si non connecté
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Redirige vers le dashboard approprié selon le rôle de l'utilisateur
     * 
     * Rôles disponibles :
     * - 'admin' → admin-dashboard.html
     * - 'employee' → employee-dashboard.html
     * - 'user' (ou autre) → dashboard.html
     * 
     * Si aucun utilisateur connecté, redirige vers login.html
     */
    redirectToDashboard() {
        // Vérifier qu'un utilisateur est connecté
        if (!this.currentUser) {
            window.location.href = 'login.html';
            return;
        }

        // Rediriger selon le rôle
        switch (this.currentUser.role) {
            case 'admin':
                window.location.href = 'admin-dashboard.html';
                break;
            case 'employee':
                window.location.href = 'employee-dashboard.html';
                break;
            case 'user':
            default:
                window.location.href = 'dashboard.html';
                break;
        }
    }
}

/**
 * ============================================
 * INSTANCE GLOBALE ET FONCTIONS UTILITAIRES
 * ============================================
 */

// Créer une instance globale de l'API Client
// Cette instance est accessible partout dans l'application via 'apiClient'
const apiClient = new APIClient();

/**
 * Fonction globale de déconnexion
 * 
 * Appelée depuis n'importe quelle page pour déconnecter l'utilisateur.
 * Redirige vers la page d'accueil après déconnexion.
 */
async function logout() {
    try {
        // Appeler l'API pour détruire la session côté serveur
        await apiClient.logout();
        // Rediriger vers la page d'accueil
        window.location.href = 'home.html';
    } catch (error) {
        // Même en cas d'erreur, rediriger vers l'accueil
        console.error('Erreur lors de la déconnexion:', error);
        window.location.href = 'home.html';
    }
}

/**
 * Vérifie que l'utilisateur est authentifié
 * 
 * Utilisée pour protéger les pages qui nécessitent une connexion.
 * Si l'utilisateur n'est pas connecté, redirige vers login.html.
 * 
 * @returns {Promise<boolean>} true si authentifié, false sinon (et redirection)
 * 
 * @example
 * // Au début d'une page protégée :
 * if (!await requireAuth()) return; // Arrête l'exécution si non connecté
 */
async function requireAuth() {
    // Vérifier d'abord si l'utilisateur est en mémoire
    if (!apiClient.isLoggedIn()) {
        // Si non, vérifier la session côté serveur
        const sessionCheck = await apiClient.checkSession();
        if (!sessionCheck.success) {
            // Session invalide ou expirée, rediriger vers login
            window.location.href = 'login.html';
            return false;
        }
    }
    return true; // Utilisateur authentifié
}

/**
 * Vérifie que l'utilisateur est administrateur
 * 
 * Utilisée pour protéger les pages réservées aux admins.
 * 
 * @returns {Promise<boolean>} true si admin, false sinon (et redirection)
 */
async function requireAdmin() {
    // D'abord vérifier l'authentification
    if (!await requireAuth()) return false;
    
    // Ensuite vérifier le rôle
    const user = apiClient.getCurrentUser();
    if (user.role !== 'admin') {
        // Pas admin, rediriger vers le dashboard utilisateur
        window.location.href = 'dashboard.html';
        return false;
    }
    return true; // Utilisateur est admin
}

/**
 * Vérifie que l'utilisateur est employé ou administrateur
 * 
 * Utilisée pour protéger les pages réservées aux employés et admins.
 * 
 * @returns {Promise<boolean>} true si employé/admin, false sinon (et redirection)
 */
async function requireEmployee() {
    // D'abord vérifier l'authentification
    if (!await requireAuth()) return false;
    
    // Ensuite vérifier le rôle (employé OU admin)
    const user = apiClient.getCurrentUser();
    if (user.role !== 'employee' && user.role !== 'admin') {
        // Pas employé ni admin, rediriger vers le dashboard utilisateur
        window.location.href = 'dashboard.html';
        return false;
    }
    return true; // Utilisateur est employé ou admin
}
