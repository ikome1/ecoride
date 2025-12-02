<?php
// API de gestion des covoiturages EcoRide
// Recherche, création, réservation et gestion des voyages

require_once 'config.php';
require_once 'cache.php';

class TripsAPI {
    private $conn;
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }
    
    // Rechercher des covoiturages
    public function searchTrips($data) {
        $errors = validateInput($data, ['depart', 'date']);
        
        if (!empty($errors)) {
            sendResponse(['success' => false, 'errors' => $errors], 400);
        }
        
        $depart = sanitizeInput($data['depart']);
        $destination = isset($data['destination']) ? sanitizeInput($data['destination']) : '';
        $date = sanitizeInput($data['date']);
        
        // Générer une clé de cache pour cette recherche
        $cache_key = CacheKeys::tripsSearch(md5($depart . $destination . $date));
        
        // Vérifier le cache
        global $cacheService;
        $cached = $cacheService->get($cache_key);
        if ($cached !== false) {
            sendResponse($cached);
            return;
        }
        
        // Requête de base
        $sql = "
            SELECT 
                t.*,
                u.pseudo as conducteur_nom,
                u.email as conducteur_email,
                v.marque,
                v.modele,
                v.couleur,
                v.type as vehicule_type,
                v.places as vehicule_places,
                COUNT(r.id) as reservations_count
            FROM trips t
            JOIN users u ON t.user_id = u.id
            JOIN vehicles v ON t.vehicle_id = v.id
            LEFT JOIN reservations r ON t.id = r.trip_id AND r.statut = 'confirmee'
            WHERE t.places_disponibles > 0
        ";
        
        $params = [];
        
        // Filtre par ville (départ OU destination)
        if (!empty($depart)) {
            $sql .= " AND (t.depart LIKE ? OR t.destination LIKE ?)";
            $params[] = "%$depart%";
            $params[] = "%$depart%";
        }
        
        // Filtre par destination si spécifiée
        if (!empty($destination)) {
            $sql .= " AND (t.depart LIKE ? OR t.destination LIKE ?)";
            $params[] = "%$destination%";
            $params[] = "%$destination%";
        }
        
        // Filtre par date
        if (!empty($date)) {
            $sql .= " AND t.date_voyage = ?";
            $params[] = $date;
        }
        
        $sql .= " GROUP BY t.id ORDER BY t.prix ASC";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->execute($params);
        $trips = $stmt->fetchAll();
        
        // Formater les résultats
        $formattedTrips = [];
        foreach ($trips as $trip) {
            $formattedTrips[] = [
                'id' => $trip['id'],
                'conducteur' => [
                    'nom' => $trip['conducteur_nom'],
                    'email' => $trip['conducteur_email']
                ],
                'trajet' => [
                    'depart' => $trip['depart'],
                    'destination' => $trip['destination'],
                    'adresseDepart' => $trip['adresse_depart'],
                    'adresseArrivee' => $trip['adresse_arrivee']
                ],
                'details' => [
                    'date' => $trip['date_voyage'],
                    'heureDepart' => $trip['heure_depart'],
                    'heureArrivee' => $trip['heure_arrivee'],
                    'placesDisponibles' => $trip['places_disponibles'],
                    'prix' => $trip['prix'],
                    'vehicule' => [
                        'marque' => $trip['marque'],
                        'modele' => $trip['modele'],
                        'couleur' => $trip['couleur'],
                        'type' => $trip['vehicule_type'],
                        'places' => $trip['vehicule_places']
                    ]
                ],
                'statut' => $trip['statut']
            ];
        }
        
        $response = [
            'success' => true,
            'trips' => $formattedTrips,
            'count' => count($formattedTrips)
        ];
        
        // Mettre en cache pour 5 minutes
        $cacheService->set($cache_key, $response, 300);
        
        sendResponse($response);
    }
    
    // Participer à un covoiturage
    public function participateTrip($data) {
        session_start();
        
        if (!isset($_SESSION['user_token'])) {
            sendResponse(['success' => false, 'message' => 'Non connecté'], 401);
        }
        
        $user_id = verifyToken($_SESSION['user_token']);
        
        if (!$user_id) {
            sendResponse(['success' => false, 'message' => 'Session expirée'], 401);
        }
        
        $errors = validateInput($data, ['trip_id']);
        
        if (!empty($errors)) {
            sendResponse(['success' => false, 'errors' => $errors], 400);
        }
        
        $trip_id = (int)$data['trip_id'];
        
        // Vérifier que le voyage existe et a des places disponibles
        $stmt = $this->conn->prepare("
            SELECT t.*, u.credits, u.pseudo as conducteur_nom, u.email as conducteur_email
            FROM trips t
            JOIN users u ON t.user_id = u.id
            WHERE t.id = ? AND t.places_disponibles > 0
        ");
        $stmt->execute([$trip_id]);
        $trip = $stmt->fetch();
        
        if (!$trip) {
            sendResponse(['success' => false, 'message' => 'Voyage introuvable ou complet'], 404);
        }
        
        // Vérifier que l'utilisateur a suffisamment de crédits
        $stmt = $this->conn->prepare("SELECT credits FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch();
        
        if (!$user || $user['credits'] < $trip['prix']) {
            sendResponse(['success' => false, 'message' => 'Crédits insuffisants'], 400);
        }
        
        // Vérifier que l'utilisateur ne participe pas déjà
        $stmt = $this->conn->prepare("
            SELECT id FROM reservations 
            WHERE trip_id = ? AND user_id = ? AND statut = 'confirmee'
        ");
        $stmt->execute([$trip_id, $user_id]);
        
        if ($stmt->rowCount() > 0) {
            sendResponse(['success' => false, 'message' => 'Vous participez déjà à ce voyage'], 400);
        }
        
        try {
            $this->conn->beginTransaction();
            
            // Créer la réservation
            $stmt = $this->conn->prepare("
                INSERT INTO reservations (trip_id, user_id, prix_paye, statut) 
                VALUES (?, ?, ?, 'confirmee')
            ");
            $stmt->execute([$trip_id, $user_id, $trip['prix']]);
            
            // Décrémenter les places disponibles
            $stmt = $this->conn->prepare("
                UPDATE trips SET places_disponibles = places_disponibles - 1 
                WHERE id = ?
            ");
            $stmt->execute([$trip_id]);
            
            // Déduire les crédits de l'utilisateur
            $stmt = $this->conn->prepare("
                UPDATE users SET credits = credits - ? WHERE id = ?
            ");
            $stmt->execute([$trip['prix'], $user_id]);
            
            // Créer une transaction
            $stmt = $this->conn->prepare("
                INSERT INTO transactions (user_id, type, montant, description, trip_id) 
                VALUES (?, 'debit', ?, ?, ?)
            ");
            $stmt->execute([
                $user_id, 
                $trip['prix'], 
                "Participation au voyage {$trip['depart']} → {$trip['destination']}", 
                $trip_id
            ]);
            
            // Ajouter les crédits au chauffeur (prix - 2 crédits plateforme)
            $credits_chauffeur = $trip['prix'] - 2;
            $stmt = $this->conn->prepare("
                UPDATE users SET credits = credits + ? WHERE id = ?
            ");
            $stmt->execute([$credits_chauffeur, $trip['user_id']]);
            
            // Transaction pour le chauffeur
            $stmt = $this->conn->prepare("
                INSERT INTO transactions (user_id, type, montant, description, trip_id) 
                VALUES (?, 'credit', ?, ?, ?)
            ");
            $stmt->execute([
                $trip['user_id'], 
                $credits_chauffeur, 
                "Gains du voyage {$trip['depart']} → {$trip['destination']}", 
                $trip_id
            ]);
            
            // Mettre à jour les statistiques de la plateforme
            $this->updatePlatformStats($trip['date_voyage'], 2);
            
            // Créer une notification pour le conducteur
            $stmt = $this->conn->prepare("
                INSERT INTO notifications (user_id, type, message, data) 
                VALUES (?, 'new_reservation', ?, ?)
            ");
            $stmt->execute([
                $trip['user_id'],
                "Nouvelle réservation pour votre trajet {$trip['depart']} → {$trip['destination']}",
                json_encode(['trip_id' => $trip_id, 'passenger_id' => $user_id])
            ]);
            
            $this->conn->commit();
            
            sendResponse([
                'success' => true,
                'message' => 'Participation confirmée',
                'conducteur' => [
                    'nom' => $trip['conducteur_nom'],
                    'email' => $trip['conducteur_email']
                ],
                'credits_restants' => $user['credits'] - $trip['prix']
            ]);
            
        } catch (Exception $e) {
            $this->conn->rollBack();
            sendResponse(['success' => false, 'message' => 'Erreur lors de la réservation'], 500);
        }
    }
    
    // Ajouter un véhicule
    public function addVehicle($data) {
        session_start();
        
        if (!isset($_SESSION['user_token'])) {
            sendResponse(['success' => false, 'message' => 'Non connecté'], 401);
        }
        
        $user_id = verifyToken($_SESSION['user_token']);
        
        if (!$user_id) {
            sendResponse(['success' => false, 'message' => 'Session expirée'], 401);
        }
        
        $errors = validateInput($data, ['plaque', 'date_immatriculation', 'marque', 'modele', 'couleur', 'places', 'type']);
        
        if (!empty($errors)) {
            sendResponse(['success' => false, 'errors' => $errors], 400);
        }
        
        $stmt = $this->conn->prepare("
            INSERT INTO vehicles (user_id, plaque, date_immatriculation, marque, modele, couleur, places, type) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        if ($stmt->execute([
            $user_id,
            sanitizeInput($data['plaque']),
            $data['date_immatriculation'],
            sanitizeInput($data['marque']),
            sanitizeInput($data['modele']),
            sanitizeInput($data['couleur']),
            (int)$data['places'],
            sanitizeInput($data['type'])
        ])) {
            $vehicle_id = $this->conn->lastInsertId();
            
            sendResponse([
                'success' => true,
                'message' => 'Véhicule ajouté avec succès',
                'vehicle_id' => $vehicle_id
            ]);
        } else {
            sendResponse(['success' => false, 'message' => 'Erreur lors de l\'ajout du véhicule'], 500);
        }
    }
    
    // Créer un voyage
    public function createTrip($data) {
        session_start();
        
        if (!isset($_SESSION['user_token'])) {
            sendResponse(['success' => false, 'message' => 'Non connecté'], 401);
        }
        
        $user_id = verifyToken($_SESSION['user_token']);
        
        if (!$user_id) {
            sendResponse(['success' => false, 'message' => 'Session expirée'], 401);
        }
        
        $errors = validateInput($data, ['depart', 'destination', 'date_voyage', 'heure_depart', 'prix', 'vehicle_id']);
        
        if (!empty($errors)) {
            sendResponse(['success' => false, 'errors' => $errors], 400);
        }
        
        // Vérifier que le véhicule appartient à l'utilisateur
        $stmt = $this->conn->prepare("SELECT places FROM vehicles WHERE id = ? AND user_id = ?");
        $stmt->execute([$data['vehicle_id'], $user_id]);
        $vehicle = $stmt->fetch();
        
        if (!$vehicle) {
            sendResponse(['success' => false, 'message' => 'Véhicule introuvable'], 404);
        }
        
        $prix = (int)$data['prix'];
        if ($prix < 3) {
            sendResponse(['success' => false, 'message' => 'Le prix minimum est de 3 crédits'], 400);
        }
        
        $places_disponibles = $vehicle['places'] - 1; // -1 pour le chauffeur
        
        $stmt = $this->conn->prepare("
            INSERT INTO trips (user_id, vehicle_id, depart, destination, adresse_depart, adresse_arrivee, 
                             date_voyage, heure_depart, heure_arrivee, prix, places_disponibles) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        if ($stmt->execute([
            $user_id,
            $data['vehicle_id'],
            sanitizeInput($data['depart']),
            sanitizeInput($data['destination']),
            sanitizeInput($data['adresse_depart'] ?? ''),
            sanitizeInput($data['adresse_arrivee'] ?? ''),
            $data['date_voyage'],
            $data['heure_depart'],
            $data['heure_arrivee'] ?? '',
            $prix,
            $places_disponibles
        ])) {
            $trip_id = $this->conn->lastInsertId();
            
            sendResponse([
                'success' => true,
                'message' => 'Voyage créé avec succès',
                'trip_id' => $trip_id
            ]);
        } else {
            sendResponse(['success' => false, 'message' => 'Erreur lors de la création du voyage'], 500);
        }
    }
    
    // Obtenir les véhicules d'un utilisateur
    public function getUserVehicles() {
        session_start();
        
        if (!isset($_SESSION['user_token'])) {
            sendResponse(['success' => false, 'message' => 'Non connecté'], 401);
        }
        
        $user_id = verifyToken($_SESSION['user_token']);
        
        if (!$user_id) {
            sendResponse(['success' => false, 'message' => 'Session expirée'], 401);
        }
        
        // Vérifier le cache
        global $cacheService;
        $cache_key = CacheKeys::userVehicles($user_id);
        $cached = $cacheService->get($cache_key);
        if ($cached !== false) {
            sendResponse($cached);
            return;
        }
        
        $stmt = $this->conn->prepare("
            SELECT * FROM vehicles WHERE user_id = ? ORDER BY created_at DESC
        ");
        $stmt->execute([$user_id]);
        $vehicles = $stmt->fetchAll();
        
        $response = ['success' => true, 'vehicles' => $vehicles];
        
        // Mettre en cache pour 10 minutes
        $cacheService->set($cache_key, $response, 600);
        
        sendResponse($response);
    }
    
    // Obtenir l'historique des voyages d'un utilisateur
    public function getUserTrips() {
        session_start();
        
        if (!isset($_SESSION['user_token'])) {
            sendResponse(['success' => false, 'message' => 'Non connecté'], 401);
        }
        
        $user_id = verifyToken($_SESSION['user_token']);
        
        if (!$user_id) {
            sendResponse(['success' => false, 'message' => 'Session expirée'], 401);
        }
        
        // Voyages en tant que chauffeur
        $stmt = $this->conn->prepare("
            SELECT t.*, v.marque, v.modele, v.type as vehicule_type,
                   COUNT(r.id) as nb_passagers
            FROM trips t
            JOIN vehicles v ON t.vehicle_id = v.id
            LEFT JOIN reservations r ON t.id = r.trip_id AND r.statut = 'confirmee'
            WHERE t.user_id = ?
            GROUP BY t.id
            ORDER BY t.date_voyage DESC
        ");
        $stmt->execute([$user_id]);
        $driverTrips = $stmt->fetchAll();
        
        // Voyages en tant que passager
        $stmt = $this->conn->prepare("
            SELECT t.*, r.prix_paye, u.pseudo as conducteur_nom,
                   v.marque, v.modele, v.type as vehicule_type
            FROM reservations r
            JOIN trips t ON r.trip_id = t.id
            JOIN users u ON t.user_id = u.id
            JOIN vehicles v ON t.vehicle_id = v.id
            WHERE r.user_id = ? AND r.statut = 'confirmee'
            ORDER BY t.date_voyage DESC
        ");
        $stmt->execute([$user_id]);
        $passengerTrips = $stmt->fetchAll();
        
        sendResponse([
            'success' => true,
            'driver_trips' => $driverTrips,
            'passenger_trips' => $passengerTrips
        ]);
    }
    
    // Mettre à jour les statistiques de la plateforme
    private function updatePlatformStats($date, $credits) {
        $stmt = $this->conn->prepare("
            INSERT INTO platform_stats (date_stat, nb_trips, credits_gagnes) 
            VALUES (?, 1, ?)
            ON DUPLICATE KEY UPDATE 
            nb_trips = nb_trips + 1,
            credits_gagnes = credits_gagnes + ?
        ");
        $stmt->execute([$date, $credits, $credits]);
    }
}

// Gestion des requêtes
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

$tripsAPI = new TripsAPI();

switch ($method) {
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        
        switch ($action) {
            case 'search':
                $tripsAPI->searchTrips($input);
                break;
            case 'participate':
                $tripsAPI->participateTrip($input);
                break;
            case 'add-vehicle':
                $tripsAPI->addVehicle($input);
                break;
            case 'create-trip':
                $tripsAPI->createTrip($input);
                break;
            default:
                sendResponse(['success' => false, 'message' => 'Action non trouvée'], 404);
        }
        break;
        
    case 'GET':
        switch ($action) {
            case 'vehicles':
                $tripsAPI->getUserVehicles();
                break;
            case 'trips':
                $tripsAPI->getUserTrips();
                break;
            default:
                sendResponse(['success' => false, 'message' => 'Action non trouvée'], 404);
        }
        break;
        
    default:
        sendResponse(['success' => false, 'message' => 'Méthode non autorisée'], 405);
}
?>
