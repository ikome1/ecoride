<?php
/**
 * ============================================
 * FICHIER DE CONFIGURATION PRINCIPAL - EcoRide
 * ============================================
 * 
 * Ce fichier contient :
 * - La classe Database pour la connexion MySQL
 * - Les fonctions utilitaires pour l'API (réponses JSON, validation, sécurité)
 * - La gestion des tokens de session
 * 
 * IMPORTANT : Ce fichier est inclus dans tous les endpoints API
 */

/**
 * Classe Database
 * 
 * Gère la connexion à la base de données MySQL avec détection automatique
 * de l'environnement (Docker ou XAMPP).
 * 
 * Fonctionnement :
 * 1. Vérifie si on est dans Docker (via variables d'environnement)
 * 2. Si oui → utilise les variables d'environnement Docker
 * 3. Si non → utilise la configuration XAMPP par défaut
 */
class Database {
    // Propriétés privées pour stocker les paramètres de connexion
    private $host;        // Adresse du serveur MySQL (ex: localhost, db)
    private $db_name;     // Nom de la base de données (ecoride)
    private $username;    // Nom d'utilisateur MySQL
    private $password;    // Mot de passe MySQL
    private $conn;       // Objet PDO de connexion (réutilisable)
    
    /**
     * Constructeur : Initialise les paramètres de connexion
     * 
     * Détecte automatiquement l'environnement :
     * - Docker : utilise getenv() pour récupérer les variables d'environnement
     * - XAMPP : utilise les valeurs par défaut (localhost, root, pas de mot de passe)
     */
    public function __construct() {
        // Vérifier si on est dans Docker (variable d'environnement DB_HOST existe)
        if (getenv('DB_HOST')) {
            // Configuration Docker (définie dans docker-compose.yml)
            $this->host = getenv('DB_HOST');                    // Généralement "db"
            $this->db_name = getenv('DB_NAME') ?: 'ecoride';   // Base de données
            $this->username = getenv('DB_USER') ?: 'ecoride_user';  // Utilisateur
            $this->password = getenv('DB_PASS') ?: 'ecoride_password'; // Mot de passe
        } else {
            // Configuration XAMPP (par défaut)
            $this->host = 'localhost';      // Serveur local
            $this->db_name = 'ecoride';    // Nom de la base
            $this->username = 'root';     // Utilisateur par défaut XAMPP
            $this->password = '';          // Pas de mot de passe par défaut
        }
    }

    /**
     * Établit la connexion à la base de données MySQL
     * 
     * Utilise PDO (PHP Data Objects) pour une connexion sécurisée.
     * 
     * Configuration PDO importante :
     * - ATTR_ERRMODE => EXCEPTION : Lance des exceptions en cas d'erreur SQL
     * - ATTR_DEFAULT_FETCH_MODE => ASSOC : Retourne des tableaux associatifs
     * - ATTR_EMULATE_PREPARES => false : Force les vraies requêtes préparées (sécurité)
     * 
     * @return PDO|null L'objet de connexion PDO ou null en cas d'erreur
     */
    public function getConnection() {
        $this->conn = null;
        
        try {
            // Créer la connexion PDO avec les paramètres configurés
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password,
                [
                    // Mode d'erreur : lancer des exceptions (plus facile à déboguer)
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    // Format de récupération : tableaux associatifs (plus lisible)
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    // Désactiver l'émulation des requêtes préparées (sécurité maximale)
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
        } catch(PDOException $exception) {
            // En cas d'erreur, afficher le message (à remplacer par un log en production)
            echo "Erreur de connexion: " . $exception->getMessage();
        }
        
        return $this->conn;
    }
}

/**
 * ============================================
 * FONCTIONS UTILITAIRES POUR L'API
 * ============================================
 */

/**
 * Envoie une réponse JSON standardisée à l'API
 * 
 * Cette fonction est utilisée par TOUS les endpoints pour garantir
 * un format de réponse cohérent.
 * 
 * @param array $data Les données à renvoyer (sera converti en JSON)
 * @param int $status Code HTTP de la réponse (200 = OK, 400 = erreur client, 500 = erreur serveur)
 * 
 * Exemple d'utilisation :
 * sendResponse(['success' => true, 'message' => 'Opération réussie'], 200);
 * sendResponse(['success' => false, 'message' => 'Erreur'], 400);
 */
function sendResponse($data, $status = 200) {
    // Définir le code HTTP de la réponse
    http_response_code($status);
    
    // Headers HTTP pour une API REST
    header('Content-Type: application/json; charset=utf-8');
    
    // CORS : Autoriser les requêtes depuis n'importe quelle origine
    // ⚠️ En production, limiter aux domaines autorisés pour plus de sécurité
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    
    // Convertir les données en JSON et les envoyer
    // JSON_UNESCAPED_UNICODE : Garde les caractères spéciaux (é, è, à, etc.)
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    
    // Arrêter l'exécution du script (important pour éviter du code après)
    exit;
}

/**
 * Valide que les champs requis sont présents et non vides
 * 
 * Utilisée pour vérifier les données d'entrée avant traitement.
 * 
 * @param array $data Les données à valider (généralement $_POST ou JSON décodé)
 * @param array $required_fields Liste des noms de champs obligatoires
 * @return array Liste des erreurs (vide si tout est OK)
 * 
 * Exemple :
 * $errors = validateInput($_POST, ['pseudo', 'email', 'password']);
 * if (!empty($errors)) {
 *     sendResponse(['success' => false, 'errors' => $errors], 400);
 * }
 */
function validateInput($data, $required_fields) {
    $errors = [];
    
    // Parcourir chaque champ requis
    foreach ($required_fields as $field) {
        // Vérifier si le champ existe ET n'est pas vide (après suppression des espaces)
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            $errors[] = "Le champ '$field' est requis";
        }
    }
    
    return $errors;
}

/**
 * Nettoie et sécurise les données d'entrée (protection XSS)
 * 
 * Cette fonction applique plusieurs couches de protection :
 * 1. trim() : Supprime les espaces en début/fin
 * 2. strip_tags() : Supprime toutes les balises HTML
 * 3. htmlspecialchars() : Échappe les caractères spéciaux HTML
 * 
 * ⚠️ IMPORTANT : Cette fonction est appliquée sur TOUTES les données utilisateur
 * avant insertion en base de données ou affichage.
 * 
 * @param mixed $data La donnée à nettoyer (string ou array)
 * @return mixed La donnée nettoyée
 * 
 * Exemple :
 * $pseudo = sanitizeInput($_POST['pseudo']); // "<script>alert('XSS')</script>" devient "&lt;script&gt;..."
 */
function sanitizeInput($data) {
    // Si c'est un tableau, appliquer récursivement sur chaque élément
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    
    // Nettoyer la chaîne :
    // 1. trim() : enlever espaces début/fin
    // 2. strip_tags() : supprimer balises HTML (<script>, etc.)
    // 3. htmlspecialchars() : échapper caractères spéciaux (& devient &amp;, etc.)
    //    ENT_QUOTES : échapper aussi les guillemets simples et doubles
    //    'UTF-8' : encodage UTF-8 pour les caractères spéciaux (é, è, etc.)
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

/**
 * Génère un token de session pour l'utilisateur connecté
 * 
 * Le token contient :
 * - L'ID de l'utilisateur
 * - Le timestamp de création (pour expiration)
 * - Un nombre aléatoire (pour éviter les collisions)
 * 
 * Format : base64(user_id:timestamp:random_bytes)
 * 
 * ⚠️ Note : Pour la production, utiliser JWT (JSON Web Tokens) serait plus sécurisé
 * 
 * @param int $user_id L'ID de l'utilisateur
 * @return string Le token encodé en base64
 */
function generateToken($user_id) {
    // Structure du token : user_id:timestamp:random_bytes
    // - user_id : identifie l'utilisateur
    // - time() : timestamp actuel (pour expiration)
    // - bin2hex(random_bytes(16)) : 32 caractères hexadécimaux aléatoires
    $token_data = $user_id . ':' . time() . ':' . bin2hex(random_bytes(16));
    
    // Encoder en base64 pour transmission facile (URL-safe)
    return base64_encode($token_data);
}

/**
 * Vérifie et décode un token de session
 * 
 * Vérifie :
 * 1. Que le token est valide (format correct)
 * 2. Que le token n'est pas expiré (24h maximum)
 * 
 * @param string $token Le token à vérifier
 * @return int|false L'ID de l'utilisateur si valide, false sinon
 */
function verifyToken($token) {
    // Décoder le token base64
    $decoded = base64_decode($token);
    
    // Séparer les parties (user_id:timestamp:random)
    $parts = explode(':', $decoded);
    
    // Vérifier le format (doit avoir 3 parties)
    if (count($parts) !== 3) {
        return false; // Token invalide
    }
    
    $user_id = $parts[0];      // ID utilisateur
    $timestamp = $parts[1];    // Timestamp de création
    
    // Vérifier l'expiration : token valide pendant 24h (86400 secondes)
    if (time() - $timestamp > 86400) {
        return false; // Token expiré
    }
    
    // Token valide, retourner l'ID utilisateur
    return $user_id;
}

/**
 * Gestion des requêtes CORS préliminaires (OPTIONS)
 * 
 * Les navigateurs envoient une requête OPTIONS avant les requêtes POST/PUT/DELETE
 * pour vérifier les permissions CORS. Cette fonction répond immédiatement.
 */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendResponse(['message' => 'OK']);
}
?>
