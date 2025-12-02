<?php
// API de gestion des avis EcoRide
// Composant métier pour la gestion des avis et notes

require_once 'config.php';

class ReviewsAPI {
    private $conn;
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }
    
    // Créer un avis après un voyage
    public function createReview($data) {
        session_start();
        
        if (!isset($_SESSION['user_token'])) {
            sendResponse(['success' => false, 'message' => 'Non connecté'], 401);
        }
        
        $user_id = verifyToken($_SESSION['user_token']);
        
        if (!$user_id) {
            sendResponse(['success' => false, 'message' => 'Session expirée'], 401);
        }
        
        $errors = validateInput($data, ['trip_id', 'reviewed_id', 'note', 'commentaire']);
        
        if (!empty($errors)) {
            sendResponse(['success' => false, 'errors' => $errors], 400);
        }
        
        $trip_id = (int)$data['trip_id'];
        $reviewed_id = (int)$data['reviewed_id'];
        $note = (int)$data['note'];
        $commentaire = sanitizeInput($data['commentaire']);
        
        // Vérifier que la note est entre 1 et 5
        if ($note < 1 || $note > 5) {
            sendResponse(['success' => false, 'message' => 'La note doit être entre 1 et 5'], 400);
        }
        
        // Vérifier que l'utilisateur a bien participé au voyage
        $stmt = $this->conn->prepare("
            SELECT id FROM reservations 
            WHERE trip_id = ? AND user_id = ? AND statut = 'confirmee'
        ");
        $stmt->execute([$trip_id, $user_id]);
        
        if ($stmt->rowCount() === 0) {
            // Vérifier si c'est le conducteur qui évalue un passager
            $stmt = $this->conn->prepare("
                SELECT user_id FROM trips WHERE id = ? AND user_id = ?
            ");
            $stmt->execute([$trip_id, $user_id]);
            
            if ($stmt->rowCount() === 0) {
                sendResponse(['success' => false, 'message' => 'Vous n\'avez pas participé à ce voyage'], 403);
            }
        }
        
        // Vérifier qu'un avis n'existe pas déjà
        $stmt = $this->conn->prepare("
            SELECT id FROM reviews 
            WHERE trip_id = ? AND reviewer_id = ? AND reviewed_id = ?
        ");
        $stmt->execute([$trip_id, $user_id, $reviewed_id]);
        
        if ($stmt->rowCount() > 0) {
            sendResponse(['success' => false, 'message' => 'Vous avez déjà laissé un avis pour ce voyage'], 400);
        }
        
        // Créer l'avis (en attente de validation par un employé)
        $stmt = $this->conn->prepare("
            INSERT INTO reviews (trip_id, reviewer_id, reviewed_id, note, commentaire, statut) 
            VALUES (?, ?, ?, ?, ?, 'en_attente')
        ");
        
        if ($stmt->execute([$trip_id, $user_id, $reviewed_id, $note, $commentaire])) {
            sendResponse([
                'success' => true,
                'message' => 'Avis créé avec succès, en attente de validation'
            ]);
        } else {
            sendResponse(['success' => false, 'message' => 'Erreur lors de la création de l\'avis'], 500);
        }
    }
    
    // Obtenir les avis d'un utilisateur
    public function getUserReviews($user_id) {
        $stmt = $this->conn->prepare("
            SELECT r.*, 
                   u1.pseudo as reviewer_name,
                   u2.pseudo as reviewed_name,
                   t.depart, t.destination, t.date_voyage
            FROM reviews r
            JOIN users u1 ON r.reviewer_id = u1.id
            JOIN users u2 ON r.reviewed_id = u2.id
            JOIN trips t ON r.trip_id = t.id
            WHERE r.reviewed_id = ? AND r.statut = 'approuve'
            ORDER BY r.created_at DESC
        ");
        $stmt->execute([$user_id]);
        $reviews = $stmt->fetchAll();
        
        // Calculer la note moyenne
        $averageRating = 0;
        if (count($reviews) > 0) {
            $sum = array_sum(array_column($reviews, 'note'));
            $averageRating = round($sum / count($reviews), 1);
        }
        
        sendResponse([
            'success' => true,
            'reviews' => $reviews,
            'average_rating' => $averageRating,
            'total_reviews' => count($reviews)
        ]);
    }
    
    // Obtenir les avis en attente de validation (pour les employés)
    public function getPendingReviews() {
        session_start();
        
        if (!isset($_SESSION['user_token'])) {
            sendResponse(['success' => false, 'message' => 'Non connecté'], 401);
        }
        
        $user_id = verifyToken($_SESSION['user_token']);
        
        if (!$user_id) {
            sendResponse(['success' => false, 'message' => 'Session expirée'], 401);
        }
        
        // Vérifier que l'utilisateur est employé ou admin
        $stmt = $this->conn->prepare("
            SELECT role FROM users WHERE id = ?
            UNION
            SELECT role FROM employees WHERE id = ?
            UNION
            SELECT role FROM admins WHERE id = ?
        ");
        $stmt->execute([$user_id, $user_id, $user_id]);
        $user = $stmt->fetch();
        
        if (!$user || ($user['role'] !== 'employee' && $user['role'] !== 'admin')) {
            sendResponse(['success' => false, 'message' => 'Accès refusé'], 403);
        }
        
        $stmt = $this->conn->prepare("
            SELECT r.*, 
                   u1.pseudo as reviewer_name,
                   u2.pseudo as reviewed_name,
                   t.depart, t.destination, t.date_voyage
            FROM reviews r
            JOIN users u1 ON r.reviewer_id = u1.id
            JOIN users u2 ON r.reviewed_id = u2.id
            JOIN trips t ON r.trip_id = t.id
            WHERE r.statut = 'en_attente'
            ORDER BY r.created_at DESC
        ");
        $stmt->execute();
        $reviews = $stmt->fetchAll();
        
        sendResponse(['success' => true, 'reviews' => $reviews]);
    }
    
    // Valider ou refuser un avis (employé/admin)
    public function moderateReview($data) {
        session_start();
        
        if (!isset($_SESSION['user_token'])) {
            sendResponse(['success' => false, 'message' => 'Non connecté'], 401);
        }
        
        $user_id = verifyToken($_SESSION['user_token']);
        
        if (!$user_id) {
            sendResponse(['success' => false, 'message' => 'Session expirée'], 401);
        }
        
        // Vérifier que l'utilisateur est employé ou admin
        $stmt = $this->conn->prepare("
            SELECT role FROM users WHERE id = ?
            UNION
            SELECT role FROM employees WHERE id = ?
            UNION
            SELECT role FROM admins WHERE id = ?
        ");
        $stmt->execute([$user_id, $user_id, $user_id]);
        $user = $stmt->fetch();
        
        if (!$user || ($user['role'] !== 'employee' && $user['role'] !== 'admin')) {
            sendResponse(['success' => false, 'message' => 'Accès refusé'], 403);
        }
        
        $errors = validateInput($data, ['review_id', 'action']);
        
        if (!empty($errors)) {
            sendResponse(['success' => false, 'errors' => $errors], 400);
        }
        
        $review_id = (int)$data['review_id'];
        $action = $data['action']; // 'approve' ou 'reject'
        
        if ($action !== 'approve' && $action !== 'reject') {
            sendResponse(['success' => false, 'message' => 'Action invalide'], 400);
        }
        
        $statut = $action === 'approve' ? 'approuve' : 'refuse';
        
        $stmt = $this->conn->prepare("
            UPDATE reviews SET statut = ? WHERE id = ?
        ");
        
        if ($stmt->execute([$statut, $review_id])) {
            sendResponse([
                'success' => true,
                'message' => $action === 'approve' ? 'Avis approuvé' : 'Avis refusé'
            ]);
        } else {
            sendResponse(['success' => false, 'message' => 'Erreur lors de la modération'], 500);
        }
    }
}

// Gestion des requêtes
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

$reviewsAPI = new ReviewsAPI();

switch ($method) {
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        
        switch ($action) {
            case 'create':
                $reviewsAPI->createReview($input);
                break;
            case 'moderate':
                $reviewsAPI->moderateReview($input);
                break;
            default:
                sendResponse(['success' => false, 'message' => 'Action non trouvée'], 404);
        }
        break;
        
    case 'GET':
        switch ($action) {
            case 'user':
                $user_id = $_GET['user_id'] ?? null;
                if (!$user_id) {
                    sendResponse(['success' => false, 'message' => 'user_id requis'], 400);
                }
                $reviewsAPI->getUserReviews($user_id);
                break;
            case 'pending':
                $reviewsAPI->getPendingReviews();
                break;
            default:
                sendResponse(['success' => false, 'message' => 'Action non trouvée'], 404);
        }
        break;
        
    default:
        sendResponse(['success' => false, 'message' => 'Méthode non autorisée'], 405);
}
?>

