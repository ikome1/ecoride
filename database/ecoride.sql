-- Base de données EcoRide
-- Structure MySQL complète pour le système de covoiturage

CREATE DATABASE IF NOT EXISTS ecoride CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecoride;

-- Table des utilisateurs
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pseudo VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    credits INT DEFAULT 20,
    role ENUM('user', 'employee', 'admin') DEFAULT 'user',
    type ENUM('passager', 'chauffeur', 'chauffeur-passager') DEFAULT 'passager',
    preferences_fumeur BOOLEAN DEFAULT FALSE,
    preferences_animaux BOOLEAN DEFAULT FALSE,
    preferences_autres TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des employés
CREATE TABLE employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pseudo VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('employee') DEFAULT 'employee',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des administrateurs
CREATE TABLE admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pseudo VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des véhicules
CREATE TABLE vehicles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    plaque VARCHAR(20) NOT NULL,
    date_immatriculation DATE NOT NULL,
    marque VARCHAR(50) NOT NULL,
    modele VARCHAR(50) NOT NULL,
    couleur VARCHAR(30) NOT NULL,
    places INT NOT NULL,
    type ENUM('Essence', 'Diesel', 'Électrique', 'Hybride') DEFAULT 'Essence',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des voyages
CREATE TABLE trips (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    depart VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    adresse_depart VARCHAR(200),
    adresse_arrivee VARCHAR(200),
    date_voyage DATE NOT NULL,
    heure_depart TIME NOT NULL,
    heure_arrivee TIME NOT NULL,
    prix INT NOT NULL,
    places_disponibles INT NOT NULL,
    statut ENUM('en_attente', 'en_cours', 'termine', 'annule') DEFAULT 'en_attente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Table des réservations
CREATE TABLE reservations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    trip_id INT NOT NULL,
    user_id INT NOT NULL,
    prix_paye INT NOT NULL,
    statut ENUM('confirmee', 'annulee', 'terminee') DEFAULT 'confirmee',
    date_reservation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_trip_user (trip_id, user_id)
);

-- Table des avis
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    trip_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    reviewed_id INT NOT NULL,
    note INT CHECK (note >= 1 AND note <= 5),
    commentaire TEXT,
    statut ENUM('en_attente', 'approuve', 'refuse') DEFAULT 'en_attente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des transactions (pour l'historique des crédits)
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('debit', 'credit') NOT NULL,
    montant INT NOT NULL,
    description VARCHAR(200),
    trip_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL
);

-- Table des statistiques de la plateforme
CREATE TABLE platform_stats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date_stat DATE NOT NULL,
    nb_trips INT DEFAULT 0,
    credits_gagnes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_date (date_stat)
);

-- Insertion des données de test
INSERT INTO users (pseudo, email, password, credits, role, type) VALUES
('user', 'user@ecoride.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 20, 'user', 'chauffeur-passager'),
('testuser', 'test@ecoride.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 20, 'user', 'passager');

INSERT INTO employees (pseudo, email, password) VALUES
('employe1', 'employe@ecoride.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

INSERT INTO admins (pseudo, email, password) VALUES
('admin', 'admin@ecoride.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Insertion de véhicules de test
INSERT INTO vehicles (user_id, plaque, date_immatriculation, marque, modele, couleur, places, type) VALUES
(1, 'AB-123-CD', '2020-01-15', 'Renault', 'Zoe', 'Blanc', 5, 'Électrique'),
(1, 'EF-456-GH', '2019-06-20', 'Peugeot', '208', 'Rouge', 5, 'Essence');

-- Insertion de voyages de test
INSERT INTO trips (user_id, vehicle_id, depart, destination, adresse_depart, adresse_arrivee, date_voyage, heure_depart, heure_arrivee, prix, places_disponibles) VALUES
(1, 1, 'Paris', 'Lyon', 'Gare de Lyon, Paris', 'Gare de Lyon-Perrache, Lyon', '2025-10-20', '09:00:00', '13:30:00', 15, 3),
(1, 2, 'Paris', 'Lyon', 'Châtelet, Paris', 'Part-Dieu, Lyon', '2025-10-20', '14:00:00', '18:15:00', 12, 2);

-- Table des notifications
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    data JSON,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, is_read),
    INDEX idx_created_at (created_at)
);

-- Index pour optimiser les performances
CREATE INDEX idx_trips_date ON trips(date_voyage);
CREATE INDEX idx_trips_depart ON trips(depart);
CREATE INDEX idx_trips_destination ON trips(destination);
CREATE INDEX idx_reservations_trip ON reservations(trip_id);
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_vehicles_user ON vehicles(user_id);
