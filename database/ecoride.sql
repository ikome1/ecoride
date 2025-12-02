-- Base de données EcoRide
-- Structure MySQL conforme au schéma MCD
-- Conforme au Modèle Conceptuel de Données fourni

CREATE DATABASE IF NOT EXISTS ecoride CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecoride;

-- ============================================
-- TABLE role (conforme MCD)
-- ============================================
CREATE TABLE role (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    libelle VARCHAR(50) UNIQUE NOT NULL
);

-- Insertion des rôles de base
INSERT INTO role (libelle) VALUES 
    ('user'),
    ('employee'),
    ('admin');

-- ============================================
-- TABLE Utilisateur (conforme MCD)
-- ============================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(50),
    prenom VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    telephone VARCHAR(50),
    adresse VARCHAR(50),
    date_naissance DATE,
    photo BLOB,
    pseudo VARCHAR(50) UNIQUE NOT NULL,
    role_id INT NOT NULL,
    credits INT DEFAULT 20,
    type ENUM('passager', 'chauffeur', 'chauffeur-passager') DEFAULT 'passager',
    preferences_fumeur BOOLEAN DEFAULT FALSE,
    preferences_animaux BOOLEAN DEFAULT FALSE,
    preferences_autres TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES role(role_id) ON DELETE RESTRICT
);

-- ============================================
-- TABLE Marque (conforme MCD)
-- ============================================
CREATE TABLE Marque (
    marque_id INT PRIMARY KEY AUTO_INCREMENT,
    libelle VARCHAR(50) UNIQUE NOT NULL
);

-- Insertion des marques courantes
INSERT INTO Marque (libelle) VALUES 
    ('Renault'), ('Peugeot'), ('Citroën'), ('Tesla'), ('BMW'),
    ('Mercedes-Benz'), ('Audi'), ('Volkswagen'), ('Nissan'), ('Hyundai'),
    ('Kia'), ('Smart'), ('Volvo'), ('Ford'), ('Toyota');

-- ============================================
-- TABLE Voiture (conforme MCD)
-- ============================================
CREATE TABLE vehicles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    marque_id INT NOT NULL,
    modele VARCHAR(50) NOT NULL,
    immatriculation VARCHAR(20) NOT NULL,
    energie VARCHAR(50) NOT NULL,
    couleur VARCHAR(30) NOT NULL,
    date_premiere_immatriculation DATE NOT NULL,
    places INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (marque_id) REFERENCES Marque(marque_id) ON DELETE RESTRICT
);

-- ============================================
-- TABLE Covoiturage (conforme MCD)
-- ============================================
CREATE TABLE trips (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    date_depart DATE NOT NULL,
    heure_depart TIME NOT NULL,
    lieu_depart VARCHAR(100) NOT NULL,
    date_arrivee DATE NOT NULL,
    heure_arrivee TIME NOT NULL,
    lieu_arrivee VARCHAR(100) NOT NULL,
    statut VARCHAR(50) DEFAULT 'en_attente',
    nb_place INT NOT NULL,
    prix_personne FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- ============================================
-- TABLE avis (conforme MCD)
-- ============================================
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    commentaire VARCHAR(50),
    note INT CHECK (note >= 1 AND note <= 5),
    statut VARCHAR(50) DEFAULT 'en_attente',
    trip_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    reviewed_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- TABLE configuration (conforme MCD)
-- ============================================
CREATE TABLE configuration (
    id_configuration INT PRIMARY KEY AUTO_INCREMENT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE parametre (conforme MCD)
-- ============================================
CREATE TABLE parametre (
    parametre_id INT PRIMARY KEY AUTO_INCREMENT,
    id_configuration INT,
    propriete VARCHAR(50) NOT NULL,
    valeur VARCHAR(50) NOT NULL,
    FOREIGN KEY (id_configuration) REFERENCES configuration(id_configuration) ON DELETE CASCADE
);

-- ============================================
-- TABLE de liaison Utilisateur-Configuration
-- ============================================
CREATE TABLE utilisateur_configuration (
    utilisateur_id INT,
    id_configuration INT,
    PRIMARY KEY (utilisateur_id, id_configuration),
    FOREIGN KEY (utilisateur_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (id_configuration) REFERENCES configuration(id_configuration) ON DELETE CASCADE
);

-- ============================================
-- TABLE reservations (table de jointure pour relation many-to-many)
-- Utilisateur participe Covoiturage (0,n)
-- ============================================
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

-- ============================================
-- TABLE transactions (pour l'historique des crédits)
-- ============================================
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

-- ============================================
-- TABLE platform_stats (statistiques de la plateforme)
-- ============================================
CREATE TABLE platform_stats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date_stat DATE NOT NULL,
    nb_trips INT DEFAULT 0,
    credits_gagnes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_date (date_stat)
);

-- ============================================
-- TABLE notifications
-- ============================================
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

-- ============================================
-- DONNÉES DE TEST
-- ============================================

-- Utilisateurs de test
INSERT INTO users (nom, prenom, pseudo, email, password, telephone, adresse, date_naissance, role_id, credits, type) VALUES
('Dupont', 'Jean', 'user', 'user@ecoride.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0612345678', 'Paris', '1990-01-15', 1, 20, 'chauffeur-passager'),
('Martin', 'Marie', 'testuser', 'test@ecoride.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0698765432', 'Lyon', '1995-05-20', 1, 20, 'passager');

-- Employés de test
INSERT INTO users (nom, prenom, pseudo, email, password, telephone, role_id) VALUES
('Bernard', 'Sophie', 'employe1', 'employe@ecoride.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0611111111', 2);

-- Administrateurs de test
INSERT INTO users (nom, prenom, pseudo, email, password, telephone, role_id) VALUES
('Admin', 'System', 'admin', 'admin@ecoride.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0600000000', 3);

-- Véhicules de test
INSERT INTO vehicles (user_id, marque_id, modele, immatriculation, energie, couleur, date_premiere_immatriculation, places) VALUES
(1, 1, 'Zoe', 'AB-123-CD', 'Électrique', 'Blanc', '2020-01-15', 5),
(1, 2, '208', 'EF-456-GH', 'Essence', 'Rouge', '2019-06-20', 5);

-- Voyages de test
INSERT INTO trips (user_id, vehicle_id, date_depart, heure_depart, lieu_depart, date_arrivee, heure_arrivee, lieu_arrivee, statut, nb_place, prix_personne) VALUES
(1, 1, '2025-10-20', '09:00:00', 'Paris', '2025-10-20', '13:30:00', 'Lyon', 'en_attente', 3, 15.0),
(1, 2, '2025-10-20', '14:00:00', 'Paris', '2025-10-20', '18:15:00', 'Lyon', 'en_attente', 2, 12.0);

-- ============================================
-- INDEX POUR OPTIMISATION
-- ============================================
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_vehicles_marque ON vehicles(marque_id);
CREATE INDEX idx_vehicles_user ON vehicles(user_id);
CREATE INDEX idx_trips_date ON trips(date_depart);
CREATE INDEX idx_trips_depart ON trips(lieu_depart);
CREATE INDEX idx_trips_destination ON trips(lieu_arrivee);
CREATE INDEX idx_reservations_trip ON reservations(trip_id);
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_parametre_config ON parametre(id_configuration);
