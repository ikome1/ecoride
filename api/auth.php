<?php
/**
 * ============================================
 * API D'AUTHENTIFICATION - EcoRide
 * ============================================
 * 
 * Ce fichier gère :
 * - L'inscription de nouveaux utilisateurs
 * - La connexion (login) avec vérification des identifiants
 * - La déconnexion (logout)
 * - La vérification de session
 * - La mise à jour du profil utilisateur
 * 
 * Endpoints disponibles :
 * - POST api/auth.php?action=register  → Inscription
 * - POST api/auth.php?action=login     → Connexion
 * - POST api/auth.php?action=logout     → Déconnexion
 * - GET  api/auth.php?action=check-session → Vérifier session
 * - POST api/auth.php?action=update-profile → Mettre à jour profil
 */

require_once 'config.php';

/**
 * Classe AuthAPI
 * 
 * Gère toutes les opérations liées à l'authentification :
 * - Inscription avec validation et hachage du mot de passe
 * - Connexion avec vérification dans 3 tables (users, employees, admins)
 * - Gestion des sessions PHP
 * - Attribution de crédits initiaux à l'inscription
 */
class AuthAPI {
    private $conn; // Connexion PDO à la base de données
    
    /**
     * Constructeur : Initialise la connexion à la base de données
     */
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }
    
    /**
     * Inscription d'un nouvel utilisateur
     * 
     * Processus complet :
     * 1. Validation des champs requis
     * 2. Nettoyage des données (protection XSS)
     * 3. Vérification de la force du mot de passe
     * 4. Vérification de l'unicité du pseudo/email
     * 5. Hachage du mot de passe (bcrypt)
     * 6. Création du compte avec 20 crédits offerts
     * 7. Enregistrement de la transaction pour l'historique
     * 
     * @param array $data Données du formulaire : ['pseudo', 'email', 'password']
     * @return void Envoie une réponse JSON (success ou erreur)
     */
    public function register($data) {
        // Étape 1 : Valider que tous les champs requis sont présents
        $errors = validateInput($data, ['pseudo', 'email', 'password']);
        
        if (!empty($errors)) {
            sendResponse(['success' => false, 'errors' => $errors], 400);
            return; // Arrêter ici si validation échoue
        }
        
        // Étape 2 : Nettoyer les données (protection XSS)
        // ⚠️ Le mot de passe n'est PAS nettoyé (nécessaire pour le hachage)
        $pseudo = sanitizeInput($data['pseudo']);
        $email = sanitizeInput($data['email']);
        $password = $data['password']; // Garder le mot de passe tel quel
        
        // Étape 3 : Vérifier la force du mot de passe
        // Doit contenir : 8 caractères min, 1 majuscule, 1 minuscule, 1 chiffre
        if (!$this->isPasswordSecure($password)) {
            sendResponse([
                'success' => false, 
                'message' => 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre'
            ], 400);
            return;
        }
        
        // Étape 4 : Vérifier que le pseudo ou email n'existe pas déjà
        // Utilisation de requête préparée (protection SQL injection)
        $stmt = $this->conn->prepare("SELECT id FROM users WHERE pseudo = ? OR email = ?");
        $stmt->execute([$pseudo, $email]);
        
        if ($stmt->rowCount() > 0) {
            sendResponse([
                'success' => false, 
                'message' => 'Ce pseudo ou email est déjà utilisé'
            ], 400);
            return;
        }
        
        // Étape 5 : Hacher le mot de passe avec bcrypt
        // PASSWORD_DEFAULT utilise l'algorithme bcrypt (sécurisé)
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        // Étape 6 : Créer le compte dans la base de données
        // Nouveaux utilisateurs reçoivent automatiquement :
        // - 20 crédits (offerts à l'inscription)
        // - Rôle 'user' (utilisateur standard)
        // - Type 'passager' (peut être modifié plus tard)
        $stmt = $this->conn->prepare("
            INSERT INTO users (pseudo, email, password, credits, role, type) 
            VALUES (?, ?, ?, 20, 'user', 'passager')
        ");
        
        if ($stmt->execute([$pseudo, $email, $hashedPassword])) {
            // Récupérer l'ID du nouvel utilisateur créé
            $user_id = $this->conn->lastInsertId();
            
            // Étape 7 : Enregistrer la transaction pour l'historique des crédits
            // Permet de tracer d'où viennent les 20 crédits initiaux
            $this->createTransaction($user_id, 'credit', 20, 'Crédits offerts à l\'inscription');
            
            // Réponse de succès avec les informations de l'utilisateur créé
            sendResponse([
                'success' => true,
                'message' => 'Compte créé avec succès',
                'user' => [
                    'id' => $user_id,
                    'pseudo' => $pseudo,
                    'email' => $email,
                    'credits' => 20,
                    'role' => 'user',
                    'type' => 'passager'
                ]
            ]);
        } else {
            // Erreur lors de l'insertion en base de données
            sendResponse(['success' => false, 'message' => 'Erreur lors de la création du compte'], 500);
        }
    }
    
    /**
     * Connexion d'un utilisateur (login)
     * 
     * Processus :
     * 1. Validation des champs (pseudo, password)
     * 2. Recherche dans 3 tables : users, employees, admins
     * 3. Vérification du mot de passe avec password_verify()
     * 4. Génération d'un token de session
     * 5. Stockage en session PHP
     * 6. Retour des informations utilisateur (sans le mot de passe)
     * 
     * ⚠️ IMPORTANT : Le système cherche dans 3 tables différentes car les rôles
     * sont séparés (users, employees, admins). Cela permet une meilleure séparation
     * des données selon les rôles.
     * 
     * @param array $data Données : ['pseudo', 'password']
     * @return void Envoie une réponse JSON
     */
    public function login($data) {
        // Étape 1 : Validation des champs requis
        $errors = validateInput($data, ['pseudo', 'password']);
        
        if (!empty($errors)) {
            sendResponse(['success' => false, 'errors' => $errors], 400);
            return;
        }
        
        // Étape 2 : Nettoyer le pseudo (pas le mot de passe, nécessaire pour vérification)
        $pseudo = sanitizeInput($data['pseudo']);
        $password = $data['password'];
        
        // Étape 3 : Chercher dans la table des utilisateurs standards
        // Requête préparée : protection contre SQL injection
        $stmt = $this->conn->prepare("
            SELECT id, pseudo, email, password, credits, role, type, 
                   preferences_fumeur, preferences_animaux, preferences_autres
            FROM users WHERE pseudo = ?
        ");
        $stmt->execute([$pseudo]);
        $user = $stmt->fetch();
        
        // Étape 4 : Vérifier le mot de passe si l'utilisateur existe
        // password_verify() compare le mot de passe en clair avec le hash bcrypt
        if ($user && password_verify($password, $user['password'])) {
            // Étape 5 : Générer un token de session unique
            $token = generateToken($user['id']);
            
            // Étape 6 : Démarrer la session PHP et stocker les informations
            session_start();
            $_SESSION['user_token'] = $token;  // Token pour vérification
            $_SESSION['user_id'] = $user['id']; // ID pour accès rapide
            
            // Sécurité : Ne jamais renvoyer le mot de passe hashé au client
            unset($user['password']);
            
            // Réponse de succès avec token et informations utilisateur
            sendResponse([
                'success' => true,
                'message' => 'Connexion réussie',
                'token' => $token,
                'user' => $user
            ]);
            return; // Arrêter ici si connexion réussie
        }
        
        // Chercher dans les employés
        $stmt = $this->conn->prepare("SELECT id, pseudo, email, password, role FROM employees WHERE pseudo = ?");
        $stmt->execute([$pseudo]);
        $employee = $stmt->fetch();
        
        if ($employee && password_verify($password, $employee['password'])) {
            $token = generateToken($employee['id']);
            
            session_start();
            $_SESSION['user_token'] = $token;
            $_SESSION['user_id'] = $employee['id'];
            
            unset($employee['password']);
            
            sendResponse([
                'success' => true,
                'message' => 'Connexion employé réussie',
                'token' => $token,
                'user' => $employee
            ]);
        }
        
        // Chercher dans les administrateurs
        $stmt = $this->conn->prepare("SELECT id, pseudo, email, password, role FROM admins WHERE pseudo = ?");
        $stmt->execute([$pseudo]);
        $admin = $stmt->fetch();
        
        if ($admin && password_verify($password, $admin['password'])) {
            $token = generateToken($admin['id']);
            
            session_start();
            $_SESSION['user_token'] = $token;
            $_SESSION['user_id'] = $admin['id'];
            
            unset($admin['password']);
            
            sendResponse([
                'success' => true,
                'message' => 'Connexion administrateur réussie',
                'token' => $token,
                'user' => $admin
            ]);
        }
        
        sendResponse(['success' => false, 'message' => 'Identifiants incorrects'], 401);
    }
    
    // Déconnexion
    public function logout() {
        session_start();
        session_destroy();
        sendResponse(['success' => true, 'message' => 'Déconnexion réussie']);
    }
    
    // Vérifier la session
    public function checkSession() {
        session_start();
        
        if (!isset($_SESSION['user_token'])) {
            sendResponse(['success' => false, 'message' => 'Non connecté'], 401);
        }
        
        $user_id = verifyToken($_SESSION['user_token']);
        
        if (!$user_id) {
            session_destroy();
            sendResponse(['success' => false, 'message' => 'Session expirée'], 401);
        }
        
        // Récupérer les informations utilisateur
        $stmt = $this->conn->prepare("
            SELECT id, pseudo, email, credits, role, type, preferences_fumeur, preferences_animaux, preferences_autres
            FROM users WHERE id = ?
        ");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch();
        
        if (!$user) {
            // Vérifier dans les employés
            $stmt = $this->conn->prepare("SELECT id, pseudo, email, role FROM employees WHERE id = ?");
            $stmt->execute([$user_id]);
            $user = $stmt->fetch();
            
            if (!$user) {
                // Vérifier dans les admins
                $stmt = $this->conn->prepare("SELECT id, pseudo, email, role FROM admins WHERE id = ?");
                $stmt->execute([$user_id]);
                $user = $stmt->fetch();
            }
        }
        
        if ($user) {
            sendResponse(['success' => true, 'user' => $user]);
        } else {
            session_destroy();
            sendResponse(['success' => false, 'message' => 'Utilisateur introuvable'], 401);
        }
    }
    
    // Mettre à jour le profil utilisateur
    public function updateProfile($data) {
        session_start();
        
        if (!isset($_SESSION['user_token'])) {
            sendResponse(['success' => false, 'message' => 'Non connecté'], 401);
        }
        
        $user_id = verifyToken($_SESSION['user_token']);
        
        if (!$user_id) {
            sendResponse(['success' => false, 'message' => 'Session expirée'], 401);
        }
        
        $updates = [];
        $params = [];
        
        if (isset($data['type'])) {
            $updates[] = "type = ?";
            $params[] = sanitizeInput($data['type']);
        }
        
        if (isset($data['preferences_fumeur'])) {
            $updates[] = "preferences_fumeur = ?";
            $params[] = $data['preferences_fumeur'] ? 1 : 0;
        }
        
        if (isset($data['preferences_animaux'])) {
            $updates[] = "preferences_animaux = ?";
            $params[] = $data['preferences_animaux'] ? 1 : 0;
        }
        
        if (isset($data['preferences_autres'])) {
            $updates[] = "preferences_autres = ?";
            $params[] = sanitizeInput($data['preferences_autres']);
        }
        
        if (empty($updates)) {
            sendResponse(['success' => false, 'message' => 'Aucune donnée à mettre à jour'], 400);
        }
        
        $params[] = $user_id;
        
        $stmt = $this->conn->prepare("
            UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?
        ");
        
        if ($stmt->execute($params)) {
            sendResponse(['success' => true, 'message' => 'Profil mis à jour avec succès']);
        } else {
            sendResponse(['success' => false, 'message' => 'Erreur lors de la mise à jour'], 500);
        }
    }
    
    // Vérifier la sécurité du mot de passe
    private function isPasswordSecure($password) {
        return strlen($password) >= 8 && 
               preg_match('/[A-Z]/', $password) && 
               preg_match('/[a-z]/', $password) && 
               preg_match('/\d/', $password);
    }
    
    // Créer une transaction
    private function createTransaction($user_id, $type, $montant, $description, $trip_id = null) {
        $stmt = $this->conn->prepare("
            INSERT INTO transactions (user_id, type, montant, description, trip_id) 
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$user_id, $type, $montant, $description, $trip_id]);
    }
}

// Gestion des requêtes
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

$authAPI = new AuthAPI();

switch ($method) {
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        
        switch ($action) {
            case 'register':
                $authAPI->register($input);
                break;
            case 'login':
                $authAPI->login($input);
                break;
            case 'logout':
                $authAPI->logout();
                break;
            case 'update-profile':
                $authAPI->updateProfile($input);
                break;
            default:
                sendResponse(['success' => false, 'message' => 'Action non trouvée'], 404);
        }
        break;
        
    case 'GET':
        switch ($action) {
            case 'check-session':
                $authAPI->checkSession();
                break;
            default:
                sendResponse(['success' => false, 'message' => 'Action non trouvée'], 404);
        }
        break;
        
    default:
        sendResponse(['success' => false, 'message' => 'Méthode non autorisée'], 405);
}
?>
