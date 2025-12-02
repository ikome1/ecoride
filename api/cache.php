<?php
// API de cache (désactivé - utilisation uniquement de MySQL)
// Le cache est désactivé pour simplifier l'installation

require_once 'config.php';

class CacheService {
    private $enabled;
    
    public function __construct() {
        // Cache désactivé - utilisation uniquement de MySQL
        $this->enabled = false;
    }
    
    // Obtenir une valeur du cache (toujours false - cache désactivé)
    public function get($key) {
        return false;
    }
    
    // Stocker une valeur dans le cache (ne fait rien - cache désactivé)
    public function set($key, $value, $ttl = 3600) {
        return false;
    }
    
    // Supprimer une clé du cache (ne fait rien - cache désactivé)
    public function delete($key) {
        return false;
    }
    
    // Supprimer toutes les clés correspondant à un pattern
    public function deletePattern($pattern) {
        return false;
    }
    
    // Vérifier si une clé existe (toujours false - cache désactivé)
    public function exists($key) {
        return false;
    }
    
    // Incrémenter une valeur (ne fait rien - cache désactivé)
    public function increment($key, $value = 1) {
        return false;
    }
    
    // Obtenir le TTL d'une clé (toujours false - cache désactivé)
    public function getTTL($key) {
        return false;
    }
    
    // Cache avec fallback vers base de données (exécute directement le callback)
    public function remember($key, $callback, $ttl = 3600) {
        // Pas de cache, on exécute directement le callback
        return $callback();
    }
    
    // Vérifier si le cache est activé (toujours false)
    public function isEnabled() {
        return false;
    }
}

// Instance globale du service de cache
$cacheService = new CacheService();

// Fonctions utilitaires pour le cache
function cache_get($key) {
    global $cacheService;
    return $cacheService->get($key);
}

function cache_set($key, $value, $ttl = 3600) {
    global $cacheService;
    return $cacheService->set($key, $value, $ttl);
}

function cache_delete($key) {
    global $cacheService;
    return $cacheService->delete($key);
}

function cache_remember($key, $callback, $ttl = 3600) {
    global $cacheService;
    return $cacheService->remember($key, $callback, $ttl);
}

// Clés de cache standardisées (non utilisées mais conservées pour compatibilité)
class CacheKeys {
    const USER_PROFILE = 'user:profile:%d';
    const USER_STATS = 'user:stats:%d';
    const TRIPS_SEARCH = 'trips:search:%s';
    const PLATFORM_STATS = 'platform:stats';
    const USER_VEHICLES = 'user:vehicles:%d';
    const USER_TRIPS = 'user:trips:%d';
    const PENDING_REVIEWS = 'reviews:pending';
    
    public static function userProfile($user_id) {
        return sprintf(self::USER_PROFILE, $user_id);
    }
    
    public static function userStats($user_id) {
        return sprintf(self::USER_STATS, $user_id);
    }
    
    public static function tripsSearch($query_hash) {
        return sprintf(self::TRIPS_SEARCH, $query_hash);
    }
    
    public static function userVehicles($user_id) {
        return sprintf(self::USER_VEHICLES, $user_id);
    }
    
    public static function userTrips($user_id) {
        return sprintf(self::USER_TRIPS, $user_id);
    }
}
?>
