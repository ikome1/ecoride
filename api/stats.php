<?php
// API de statistiques EcoRide
// Composant métier pour les statistiques de la plateforme

require_once 'config.php';

class StatsAPI {
    private $conn;
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }
    
    // Obtenir les statistiques globales de la plateforme (admin uniquement)
    public function getPlatformStats() {
        session_start();
        
        if (!isset($_SESSION['user_token'])) {
            sendResponse(['success' => false, 'message' => 'Non connecté'], 401);
        }
        
        $user_id = verifyToken($_SESSION['user_token']);
        
        if (!$user_id) {
            sendResponse(['success' => false, 'message' => 'Session expirée'], 401);
        }
        
        // Vérifier que l'utilisateur est admin
        $stmt = $this->conn->prepare("SELECT role FROM admins WHERE id = ?");
        $stmt->execute([$user_id]);
        $admin = $stmt->fetch();
        
        if (!$admin) {
            sendResponse(['success' => false, 'message' => 'Accès refusé'], 403);
        }
        
        // Statistiques globales
        $stats = [];
        
        // Nombre total d'utilisateurs
        $stmt = $this->conn->prepare("SELECT COUNT(*) as total FROM users");
        $stmt->execute();
        $stats['total_users'] = $stmt->fetch()['total'];
        
        // Nombre total de voyages
        $stmt = $this->conn->prepare("SELECT COUNT(*) as total FROM trips");
        $stmt->execute();
        $stats['total_trips'] = $stmt->fetch()['total'];
        
        // Nombre total de réservations
        $stmt = $this->conn->prepare("SELECT COUNT(*) as total FROM reservations WHERE statut = 'confirmee'");
        $stmt->execute();
        $stats['total_reservations'] = $stmt->fetch()['total'];
        
        // Crédits totaux en circulation
        $stmt = $this->conn->prepare("SELECT SUM(credits) as total FROM users");
        $stmt->execute();
        $stats['total_credits'] = $stmt->fetch()['total'] ?? 0;
        
        // Crédits gagnés par la plateforme
        $stmt = $this->conn->prepare("
            SELECT SUM(credits_gagnes) as total FROM platform_stats
        ");
        $stmt->execute();
        $stats['platform_credits'] = $stmt->fetch()['total'] ?? 0;
        
        // Voyages par mois (6 derniers mois)
        $stmt = $this->conn->prepare("
            SELECT DATE_FORMAT(date_voyage, '%Y-%m') as month, COUNT(*) as count
            FROM trips
            WHERE date_voyage >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY month
            ORDER BY month ASC
        ");
        $stmt->execute();
        $stats['trips_by_month'] = $stmt->fetchAll();
        
        // Top 5 villes de départ
        $stmt = $this->conn->prepare("
            SELECT depart, COUNT(*) as count
            FROM trips
            GROUP BY depart
            ORDER BY count DESC
            LIMIT 5
        ");
        $stmt->execute();
        $stats['top_departures'] = $stmt->fetchAll();
        
        // Top 5 villes d'arrivée
        $stmt = $this->conn->prepare("
            SELECT destination, COUNT(*) as count
            FROM trips
            GROUP BY destination
            ORDER BY count DESC
            LIMIT 5
        ");
        $stmt->execute();
        $stats['top_destinations'] = $stmt->fetchAll();
        
        // Répartition des types de véhicules
        $stmt = $this->conn->prepare("
            SELECT type, COUNT(*) as count
            FROM vehicles
            GROUP BY type
        ");
        $stmt->execute();
        $stats['vehicle_types'] = $stmt->fetchAll();
        
        // Statistiques des avis
        $stmt = $this->conn->prepare("
            SELECT AVG(note) as avg_rating, COUNT(*) as total_reviews
            FROM reviews
            WHERE statut = 'approuve'
        ");
        $stmt->execute();
        $reviewStats = $stmt->fetch();
        $stats['average_rating'] = round($reviewStats['avg_rating'] ?? 0, 1);
        $stats['total_reviews'] = $reviewStats['total_reviews'] ?? 0;
        
        sendResponse(['success' => true, 'stats' => $stats]);
    }
    
    // Obtenir les statistiques d'un utilisateur
    public function getUserStats() {
        session_start();
        
        if (!isset($_SESSION['user_token'])) {
            sendResponse(['success' => false, 'message' => 'Non connecté'], 401);
        }
        
        $user_id = verifyToken($_SESSION['user_token']);
        
        if (!$user_id) {
            sendResponse(['success' => false, 'message' => 'Session expirée'], 401);
        }
        
        $stats = [];
        
        // Voyages en tant que chauffeur
        $stmt = $this->conn->prepare("
            SELECT COUNT(*) as total, SUM(prix - 2) as credits_earned
            FROM trips
            WHERE user_id = ?
        ");
        $stmt->execute([$user_id]);
        $driverStats = $stmt->fetch();
        $stats['driver_trips'] = $driverStats['total'] ?? 0;
        $stats['credits_earned'] = $driverStats['credits_earned'] ?? 0;
        
        // Voyages en tant que passager
        $stmt = $this->conn->prepare("
            SELECT COUNT(*) as total, SUM(prix_paye) as credits_spent
            FROM reservations r
            JOIN trips t ON r.trip_id = t.id
            WHERE r.user_id = ? AND r.statut = 'confirmee'
        ");
        $stmt->execute([$user_id]);
        $passengerStats = $stmt->fetch();
        $stats['passenger_trips'] = $passengerStats['total'] ?? 0;
        $stats['credits_spent'] = $passengerStats['credits_spent'] ?? 0;
        
        // Total des voyages
        $stats['total_trips'] = $stats['driver_trips'] + $stats['passenger_trips'];
        
        // Voyages par mois
        $stmt = $this->conn->prepare("
            SELECT DATE_FORMAT(date_voyage, '%Y-%m') as month, COUNT(*) as count
            FROM (
                SELECT date_voyage FROM trips WHERE user_id = ?
                UNION ALL
                SELECT t.date_voyage FROM reservations r
                JOIN trips t ON r.trip_id = t.id
                WHERE r.user_id = ? AND r.statut = 'confirmee'
            ) as all_trips
            WHERE date_voyage >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY month
            ORDER BY month ASC
        ");
        $stmt->execute([$user_id, $user_id]);
        $stats['trips_by_month'] = $stmt->fetchAll();
        
        // Note moyenne reçue
        $stmt = $this->conn->prepare("
            SELECT AVG(note) as avg_rating, COUNT(*) as total
            FROM reviews
            WHERE reviewed_id = ? AND statut = 'approuve'
        ");
        $stmt->execute([$user_id]);
        $ratingStats = $stmt->fetch();
        $stats['average_rating'] = round($ratingStats['avg_rating'] ?? 0, 1);
        $stats['total_reviews_received'] = $ratingStats['total'] ?? 0;
        
        sendResponse(['success' => true, 'stats' => $stats]);
    }
}

// Gestion des requêtes
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

$statsAPI = new StatsAPI();

switch ($method) {
    case 'GET':
        switch ($action) {
            case 'platform':
                $statsAPI->getPlatformStats();
                break;
            case 'user':
                $statsAPI->getUserStats();
                break;
            default:
                sendResponse(['success' => false, 'message' => 'Action non trouvée'], 404);
        }
        break;
        
    default:
        sendResponse(['success' => false, 'message' => 'Méthode non autorisée'], 405);
}
?>

