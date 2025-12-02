<?php
// API de notifications EcoRide
// Utilise MySQL pour stocker les notifications

require_once 'config.php';

class NotificationsAPI {
    private $conn;
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }
    
    // Obtenir les notifications d'un utilisateur
    public function getUserNotifications() {
        session_start();
        
        if (!isset($_SESSION['user_token'])) {
            sendResponse(['success' => false, 'message' => 'Non connecté'], 401);
        }
        
        $user_id = verifyToken($_SESSION['user_token']);
        
        if (!$user_id) {
            sendResponse(['success' => false, 'message' => 'Session expirée'], 401);
        }
        
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        
        $stmt = $this->conn->prepare("
            SELECT id, type, message, data, is_read, created_at
            FROM notifications
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ?
        ");
        $stmt->execute([$user_id, $limit]);
        $notifications = $stmt->fetchAll();
        
        // Décoder les données JSON
        foreach ($notifications as &$notification) {
            if ($notification['data']) {
                $notification['data'] = json_decode($notification['data'], true);
            }
        }
        
        sendResponse([
            'success' => true,
            'notifications' => $notifications,
            'count' => count($notifications)
        ]);
    }
    
    // Marquer une notification comme lue
    public function markAsRead($data) {
        session_start();
        
        if (!isset($_SESSION['user_token'])) {
            sendResponse(['success' => false, 'message' => 'Non connecté'], 401);
        }
        
        $user_id = verifyToken($_SESSION['user_token']);
        
        if (!$user_id) {
            sendResponse(['success' => false, 'message' => 'Session expirée'], 401);
        }
        
        if (!isset($data['notification_id'])) {
            sendResponse(['success' => false, 'message' => 'ID de notification requis'], 400);
        }
        
        $notification_id = (int)$data['notification_id'];
        
        // Vérifier que la notification appartient à l'utilisateur
        $stmt = $this->conn->prepare("
            UPDATE notifications 
            SET is_read = TRUE 
            WHERE id = ? AND user_id = ?
        ");
        $stmt->execute([$notification_id, $user_id]);
        
        if ($stmt->rowCount() > 0) {
            sendResponse(['success' => true, 'message' => 'Notification marquée comme lue']);
        } else {
            sendResponse(['success' => false, 'message' => 'Notification introuvable'], 404);
        }
    }
}

// Gestion des requêtes
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

$notificationsAPI = new NotificationsAPI();

switch ($method) {
    case 'GET':
        switch ($action) {
            case 'list':
                $notificationsAPI->getUserNotifications();
                break;
            default:
                sendResponse(['success' => false, 'message' => 'Action non trouvée'], 404);
        }
        break;
        
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        
        switch ($action) {
            case 'read':
                $notificationsAPI->markAsRead($input);
                break;
            default:
                sendResponse(['success' => false, 'message' => 'Action non trouvée'], 404);
        }
        break;
        
    default:
        sendResponse(['success' => false, 'message' => 'Méthode non autorisée'], 405);
}
?>
