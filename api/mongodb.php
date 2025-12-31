<?php
/**
 * ============================================
 * COMPOSANT D'ACCÈS MONGODB - EcoRide
 * ============================================
 * 
 * Ce composant permet d'accéder à MongoDB (NoSQL) pour stocker :
 * - Les logs d'activité des utilisateurs
 * - Les logs de recherche
 * - Les statistiques en temps réel
 * - Les données non structurées
 * 
 * IMPORTANT : MongoDB est utilisé en complément de MySQL (SQL)
 * - MySQL : Données structurées et relationnelles (utilisateurs, trajets, réservations)
 * - MongoDB : Logs, statistiques, données non structurées
 */

/**
 * Classe MongoDBService
 * 
 * Gère la connexion et les opérations sur MongoDB
 */
class MongoDBService {
    private $client;
    private $database;
    private $connected;
    
    /**
     * Constructeur : Initialise la connexion MongoDB
     */
    public function __construct() {
        $this->connected = false;
        
        try {
            // Détecter l'environnement (Docker ou local)
            $host = getenv('MONGO_HOST') ?: 'localhost';
            $port = getenv('MONGO_PORT') ?: '27017';
            $dbName = getenv('MONGO_DB') ?: 'ecoride_logs';
            
            // Vérifier si l'extension MongoDB est disponible
            if (!extension_loaded('mongodb')) {
                // Si l'extension n'est pas disponible, on désactive MongoDB
                $this->connected = false;
                return;
            }
            
            // Créer la connexion MongoDB
            $connectionString = "mongodb://{$host}:{$port}";
            $this->client = new MongoDB\Client($connectionString);
            $this->database = $this->client->selectDatabase($dbName);
            $this->connected = true;
            
        } catch (Exception $e) {
            // En cas d'erreur, on désactive MongoDB (fallback vers MySQL uniquement)
            $this->connected = false;
            error_log("MongoDB connection error: " . $e->getMessage());
        }
    }
    
    /**
     * Vérifier si MongoDB est disponible
     */
    public function isConnected() {
        return $this->connected;
    }
    
    /**
     * Obtenir une collection MongoDB
     * 
     * @param string $collectionName Nom de la collection
     * @return MongoDB\Collection|null La collection ou null si non connecté
     */
    public function getCollection($collectionName) {
        if (!$this->connected) {
            return null;
        }
        
        return $this->database->selectCollection($collectionName);
    }
    
    /**
     * Insérer un log d'activité utilisateur
     * 
     * @param int $user_id ID de l'utilisateur
     * @param string $action Action effectuée (login, search, reservation, etc.)
     * @param array $data Données supplémentaires
     * @return bool Succès de l'insertion
     */
    public function logActivity($user_id, $action, $data = []) {
        if (!$this->connected) {
            return false;
        }
        
        try {
            $collection = $this->getCollection('activity_logs');
            
            $document = [
                'user_id' => $user_id,
                'action' => $action,
                'data' => $data,
                'timestamp' => new MongoDB\BSON\UTCDateTime(),
                'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
            ];
            
            $result = $collection->insertOne($document);
            return $result->getInsertedCount() > 0;
            
        } catch (Exception $e) {
            error_log("MongoDB log error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Insérer un log de recherche
     * 
     * @param array $searchParams Paramètres de recherche (depart, destination, date, etc.)
     * @param int $resultsCount Nombre de résultats trouvés
     * @return bool Succès de l'insertion
     */
    public function logSearch($searchParams, $resultsCount = 0) {
        if (!$this->connected) {
            return false;
        }
        
        try {
            $collection = $this->getCollection('search_logs');
            
            $document = [
                'search_params' => $searchParams,
                'results_count' => $resultsCount,
                'timestamp' => new MongoDB\BSON\UTCDateTime(),
                'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
            ];
            
            $result = $collection->insertOne($document);
            return $result->getInsertedCount() > 0;
            
        } catch (Exception $e) {
            error_log("MongoDB search log error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Obtenir les statistiques de recherche
     * 
     * @param int $limit Nombre de résultats à retourner
     * @return array Statistiques de recherche
     */
    public function getSearchStats($limit = 10) {
        if (!$this->connected) {
            return [];
        }
        
        try {
            $collection = $this->getCollection('search_logs');
            
            // Agrégation pour obtenir les recherches les plus fréquentes
            $pipeline = [
                [
                    '$group' => [
                        '_id' => [
                            'depart' => '$search_params.depart',
                            'destination' => '$search_params.destination'
                        ],
                        'count' => ['$sum' => 1],
                        'avg_results' => ['$avg' => '$results_count']
                    ]
                ],
                [
                    '$sort' => ['count' => -1]
                ],
                [
                    '$limit' => $limit
                ]
            ];
            
            $results = $collection->aggregate($pipeline);
            $stats = [];
            
            foreach ($results as $result) {
                $stats[] = [
                    'depart' => $result['_id']['depart'] ?? 'N/A',
                    'destination' => $result['_id']['destination'] ?? 'N/A',
                    'count' => $result['count'],
                    'avg_results' => round($result['avg_results'], 2)
                ];
            }
            
            return $stats;
            
        } catch (Exception $e) {
            error_log("MongoDB stats error: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Obtenir les logs d'activité d'un utilisateur
     * 
     * @param int $user_id ID de l'utilisateur
     * @param int $limit Nombre de logs à retourner
     * @return array Logs d'activité
     */
    public function getUserActivityLogs($user_id, $limit = 50) {
        if (!$this->connected) {
            return [];
        }
        
        try {
            $collection = $this->getCollection('activity_logs');
            
            $options = [
                'sort' => ['timestamp' => -1],
                'limit' => $limit
            ];
            
            $filter = ['user_id' => $user_id];
            $cursor = $collection->find($filter, $options);
            
            $logs = [];
            foreach ($cursor as $document) {
                $logs[] = [
                    'action' => $document['action'],
                    'data' => $document['data'] ?? [],
                    'timestamp' => $document['timestamp']->toDateTime()->format('Y-m-d H:i:s'),
                    'ip_address' => $document['ip_address'] ?? 'unknown'
                ];
            }
            
            return $logs;
            
        } catch (Exception $e) {
            error_log("MongoDB user logs error: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Stocker des statistiques en temps réel
     * 
     * @param string $metric Nom de la métrique (ex: 'active_users', 'searches_today')
     * @param mixed $value Valeur de la métrique
     * @return bool Succès de l'insertion
     */
    public function storeRealtimeStats($metric, $value) {
        if (!$this->connected) {
            return false;
        }
        
        try {
            $collection = $this->getCollection('realtime_stats');
            
            $document = [
                'metric' => $metric,
                'value' => $value,
                'timestamp' => new MongoDB\BSON\UTCDateTime()
            ];
            
            // Utiliser upsert pour mettre à jour ou créer
            $result = $collection->updateOne(
                ['metric' => $metric],
                ['$set' => $document],
                ['upsert' => true]
            );
            
            return true;
            
        } catch (Exception $e) {
            error_log("MongoDB stats store error: " . $e->getMessage());
            return false;
        }
    }
}

// Instance globale du service MongoDB
$mongodbService = new MongoDBService();

// Fonctions utilitaires pour faciliter l'utilisation
function mongodb_log_activity($user_id, $action, $data = []) {
    global $mongodbService;
    return $mongodbService->logActivity($user_id, $action, $data);
}

function mongodb_log_search($searchParams, $resultsCount = 0) {
    global $mongodbService;
    return $mongodbService->logSearch($searchParams, $resultsCount);
}

function mongodb_get_search_stats($limit = 10) {
    global $mongodbService;
    return $mongodbService->getSearchStats($limit);
}

function mongodb_get_user_activity_logs($user_id, $limit = 50) {
    global $mongodbService;
    return $mongodbService->getUserActivityLogs($user_id, $limit);
}

function mongodb_store_realtime_stats($metric, $value) {
    global $mongodbService;
    return $mongodbService->storeRealtimeStats($metric, $value);
}

function mongodb_is_available() {
    global $mongodbService;
    return $mongodbService->isConnected();
}
?>

