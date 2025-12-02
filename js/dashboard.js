// Script pour le dashboard utilisateur
console.log('=== DASHBOARD.JS: FICHIER CHARGÉ ===');
console.log('Dashboard: Script dashboard.js chargé');

document.addEventListener('DOMContentLoaded', function() {
    console.log('=== DASHBOARD: DOMContentLoaded DÉCLENCHÉ ===');
    console.log('Dashboard: Page dashboard.html chargée');
    
    // Vérifier le localStorage AVANT tout
    const storedUser = localStorage.getItem('ecoride_current_user');
    console.log('Dashboard: localStorage AVANT userManager:', storedUser);
    console.log('Dashboard: userManager existe?', typeof userManager !== 'undefined');
    
    // Attendre un peu pour que userManager soit initialisé
    setTimeout(function() {
        console.log('Dashboard: localStorage APRÈS userManager:', localStorage.getItem('ecoride_current_user'));
        console.log('Dashboard: userManager.users:', userManager.users.length);
        console.log('Dashboard: userManager.employees:', userManager.employees.length);
        console.log('Dashboard: userManager.admins:', userManager.admins.length);
        
        // Vérifier l'authentification
        const isLoggedIn = userManager.isLoggedIn();
        console.log('Dashboard: isLoggedIn() =', isLoggedIn);
        
        if (!isLoggedIn) {
            const stored = localStorage.getItem('ecoride_current_user');
            console.error('Dashboard: PROBLÈME - isLoggedIn() = false');
            console.error('Dashboard: localStorage contient:', stored);
            console.error('Dashboard: userManager.currentUser:', userManager.currentUser);
            
            console.error('Dashboard: PROBLÈME DE CONNEXION - Redirection immédiate vers login');
            // Redirection immédiate
            window.location.href = 'login.html';
            return;
        }
        
        // Synchroniser l'utilisateur avec les données en base
        console.log('Dashboard: Tentative de synchronisation...');
        const syncResult = userManager.syncCurrentUser();
        console.log('Dashboard: syncCurrentUser() =', syncResult);
        
        if (!syncResult) {
            console.error('Dashboard: PROBLÈME - syncCurrentUser() = false - Redirection immédiate vers login');
            // Redirection immédiate
            window.location.href = 'login.html';
            return;
        }
        
        const user = userManager.getCurrentUser();
        console.log('Dashboard: Utilisateur récupéré:', user);
        
        // Vérifier que l'utilisateur est bien chargé
        if (!user) {
            console.error('Dashboard: PROBLÈME - user = null - Redirection immédiate vers login');
            // Redirection immédiate
            window.location.href = 'login.html';
            return;
        }
        
        console.log('Dashboard: SUCCÈS ! Utilisateur connecté:', user.pseudo);
        console.log('Dashboard: Rôle de l\'utilisateur:', user.role);
        console.log('Dashboard: Crédits:', user.credits || 'N/A (admin/employee)');
        console.log('=== DASHBOARD: INITIALISATION RÉUSSIE ===');
        
        // Vérifier le rôle de l'utilisateur et rediriger si nécessaire
        if (user.role === 'admin') {
            console.warn('Dashboard: ATTENTION - Un admin est connecté sur dashboard.html');
            console.warn('Dashboard: Redirection vers admin-dashboard.html');
            window.location.href = 'admin-dashboard.html';
            return;
        } else if (user.role === 'employee') {
            console.warn('Dashboard: ATTENTION - Un employé est connecté sur dashboard.html');
            console.warn('Dashboard: Redirection vers employee-dashboard.html');
            window.location.href = 'employee-dashboard.html';
            return;
        }
        
        // Initialiser l'interface
        initializeDashboard(user);
        
        // Charger les données
        loadUserData(user);
        
        // Gestionnaires d'événements
        setupEventListeners();
        
        // Charger les données de recherche depuis le JSON
        loadSearchData();
    }, 100); // Fin du setTimeout - attendre 100ms pour que userManager soit initialisé
});

function initializeDashboard(user) {
    // Mettre à jour l'en-tête
    const userNameEl = document.getElementById('userName');
    if (userNameEl) {
        userNameEl.textContent = 'Bonjour, ' + user.pseudo + ' (' + user.role + ')';
    }
    
    const userCreditsEl = document.getElementById('userCredits');
    if (userCreditsEl) {
        // Les admins et employés n'ont pas de crédits
        if (user.role === 'admin' || user.role === 'employee') {
            userCreditsEl.textContent = 'N/A';
            const creditsLabel = userCreditsEl.parentElement.querySelector('.text-sm');
            if (creditsLabel) {
                creditsLabel.textContent = 'Compte ' + user.role;
            }
        } else {
            userCreditsEl.textContent = user.credits || 0;
        }
    }
    
    // Mettre à jour le profil
    document.getElementById('profilePseudo').value = user.pseudo;
    document.getElementById('profileEmail').value = user.email;
    document.getElementById('profileType').value = user.type || 'passager';
    
    // Mettre à jour les préférences
    document.getElementById('prefFumeur').checked = user.preferences?.fumeur || false;
    document.getElementById('prefAnimaux').checked = user.preferences?.animaux || false;
    document.getElementById('prefAutres').value = user.preferences?.autres?.join(', ') || '';
    
    // Afficher l'onglet par défaut
    showTab('profile');
}

function loadUserData(user) {
    loadVehicles(user);
    loadTrips(user);
    loadVehicleOptions(user);
}

function loadVehicles(user) {
    const vehiclesList = document.getElementById('vehiclesList');
    vehiclesList.innerHTML = '';
    
    if (!user.vehicles || user.vehicles.length === 0) {
        vehiclesList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <div class="text-4xl mb-3">🚗</div>
                <p class="text-lg font-semibold">Aucun véhicule enregistré</p>
                <p class="text-sm">Ajoutez votre premier véhicule pour devenir chauffeur</p>
            </div>
        `;
        return;
    }
    
    user.vehicles.forEach(vehicle => {
        const vehicleCard = document.createElement('div');
        vehicleCard.className = 'bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow';
        vehicleCard.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-900">${vehicle.marque} ${vehicle.modele}</h4>
                    <p class="text-sm text-gray-600">${vehicle.couleur} • ${vehicle.type}</p>
                    <p class="text-sm text-gray-600">Plaque: ${vehicle.plaque}</p>
                    <p class="text-sm text-gray-600">${vehicle.places} places</p>
                    <p class="text-xs text-gray-500">Ajouté le ${new Date(vehicle.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
                <div class="flex flex-col items-end space-y-2">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${vehicle.type === 'Électrique' ? 'bg-green-100 text-green-800' : vehicle.type === 'Hybride' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}">
                        ${vehicle.type === 'Électrique' ? '🌱 Écologique' : vehicle.type === 'Hybride' ? '🔋 Hybride' : '🚗 Classique'}
                    </span>
                    <button onclick="removeVehicle(${vehicle.id})" class="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition">
                        Supprimer
                    </button>
                </div>
            </div>
        `;
        vehiclesList.appendChild(vehicleCard);
    });
}

function loadTrips(user) {
    const passengerTrips = document.getElementById('passengerTrips');
    const driverTrips = document.getElementById('driverTrips');
    
    // Charger les réservations depuis le localStorage
    const reservations = JSON.parse(localStorage.getItem('ecoride_reservations') || '[]');
    const userReservations = reservations.filter(res => res.userId === user.id);
    
    // Voyages en tant que passager
    const passengerTripsList = user.trips?.filter(trip => trip.type === 'passager') || [];
    passengerTrips.innerHTML = '';
    
    if (passengerTripsList.length === 0 && userReservations.length === 0) {
        passengerTrips.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <div class="text-4xl mb-3">👤</div>
                <p class="text-lg font-semibold">Vous n'avez pas effectué de voyage</p>
                <p class="text-sm">en tant que passager</p>
            </div>
        `;
    } else {
        // Afficher d'abord les voyages depuis user.trips
        passengerTripsList.forEach(trip => {
            const tripCard = document.createElement('div');
            tripCard.className = 'bg-blue-50 border border-blue-200 rounded-lg p-3';
            tripCard.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <h5 class="font-semibold text-blue-900">${trip.depart} → ${trip.destination}</h5>
                        <p class="text-sm text-blue-700">${formaterDate(trip.date)} à ${trip.heureDepart}</p>
                        <p class="text-sm text-blue-600">Conducteur: ${trip.conducteur}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-semibold text-blue-900">${trip.prix} crédits</p>
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            ${trip.statut}
                        </span>
                    </div>
                </div>
            `;
            passengerTrips.appendChild(tripCard);
        });
        
        // Afficher ensuite les réservations depuis le localStorage
        userReservations.forEach(reservation => {
            const tripCard = document.createElement('div');
            tripCard.className = 'bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2';
            tripCard.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <h5 class="font-semibold text-blue-900">${reservation.departure} → ${reservation.destination}</h5>
                        <p class="text-sm text-blue-700">${formaterDate(reservation.date)}</p>
                        <p class="text-sm text-blue-600">Chauffeur: ${reservation.driver}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-semibold text-blue-900">${reservation.price}€</p>
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            ${reservation.status === 'confirmed' ? 'Confirmé' : reservation.status}
                        </span>
                    </div>
                </div>
            `;
            passengerTrips.appendChild(tripCard);
        });
    }
    
    // Voyages en tant que chauffeur
    const driverTripsList = user.trips?.filter(trip => trip.type === 'chauffeur') || [];
    driverTrips.innerHTML = '';
    
    if (driverTripsList.length === 0) {
        driverTrips.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <div class="text-4xl mb-3">🚗</div>
                <p class="text-lg font-semibold">Vous n'avez pas effectué de voyage</p>
                <p class="text-sm">en tant que chauffeur</p>
            </div>
        `;
    } else {
        driverTripsList.forEach(trip => {
            const tripCard = document.createElement('div');
            tripCard.className = 'bg-green-50 border border-green-200 rounded-lg p-3';
            tripCard.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <h5 class="font-semibold text-green-900">${trip.depart} → ${trip.destination}</h5>
                        <p class="text-sm text-green-700">${formaterDate(trip.date)} à ${trip.heureDepart}</p>
                        <p class="text-sm text-green-600">${trip.passagers || 0} passager(s)</p>
                    </div>
                    <div class="text-right">
                        <p class="font-semibold text-green-900">${trip.prix} crédits</p>
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ${trip.statut}
                        </span>
                    </div>
                </div>
            `;
            driverTrips.appendChild(tripCard);
        });
    }
}

function loadVehicleOptions(user) {
    const vehicleSelect = document.getElementById('tripVehicle');
    vehicleSelect.innerHTML = '<option value="">Sélectionner un véhicule</option>';
    
    if (user.vehicles && user.vehicles.length > 0) {
        user.vehicles.forEach(vehicle => {
            const option = document.createElement('option');
            option.value = vehicle.id;
            option.textContent = `${vehicle.marque} ${vehicle.modele} (${vehicle.plaque})`;
            vehicleSelect.appendChild(option);
        });
    }
}

function setupEventListeners() {
    // Formulaire de création de voyage
    const createTripForm = document.getElementById('createTripForm');
    if (createTripForm) {
        createTripForm.addEventListener('submit', handleCreateTrip);
    }
    
    // Formulaire d'ajout de véhicule
    const addVehicleForm = document.getElementById('addVehicleForm');
    if (addVehicleForm) {
        addVehicleForm.addEventListener('submit', handleAddVehicle);
    }
    
    // Formulaire de recherche de voyage
    const searchTripForm = document.getElementById('searchTripForm');
    if (searchTripForm) {
        searchTripForm.addEventListener('submit', handleSearchTrips);
    }
}

function showTab(tabName) {
    // Masquer tous les contenus
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Désactiver tous les onglets
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('border-green-500', 'text-green-600');
        button.classList.add('border-transparent', 'text-gray-500');
    });
    
    // Afficher le contenu sélectionné
    document.getElementById(`content-${tabName}`).classList.remove('hidden');
    
    // Activer l'onglet sélectionné
    const activeTab = document.getElementById(`tab-${tabName}`);
    activeTab.classList.remove('border-transparent', 'text-gray-500');
    activeTab.classList.add('border-green-500', 'text-green-600');
    
    // Charger les statistiques si l'onglet stats est sélectionné
    if (tabName === 'stats') {
        setTimeout(() => {
            loadStatistics();
        }, 100);
    }
}

function saveProfile() {
    const user = userManager.getCurrentUser();
    const updates = {
        type: document.getElementById('profileType').value,
        preferences: {
            fumeur: document.getElementById('prefFumeur').checked,
            animaux: document.getElementById('prefAnimaux').checked,
            autres: document.getElementById('prefAutres').value.split(',').map(s => s.trim()).filter(s => s)
        }
    };
    
    userManager.updateUserProfile(user.id, updates);
    alert('Profil sauvegardé avec succès !');
}

function showAddVehicleModal() {
    document.getElementById('addVehicleModal').classList.remove('hidden');
    document.getElementById('addVehicleModal').classList.add('flex');
}

function hideAddVehicleModal() {
    document.getElementById('addVehicleModal').classList.add('hidden');
    document.getElementById('addVehicleModal').classList.remove('flex');
    document.getElementById('addVehicleForm').reset();
}

function removeVehicle(vehicleId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
        const user = userManager.getCurrentUser();
        const success = userManager.removeVehicle(user.id, vehicleId);
        
        if (success) {
            alert('Véhicule supprimé avec succès !');
            loadVehicles(userManager.getCurrentUser());
            loadVehicleOptions(userManager.getCurrentUser());
        } else {
            alert('Erreur lors de la suppression du véhicule');
        }
    }
}

function handleAddVehicle(e) {
    e.preventDefault();
    
    const user = userManager.getCurrentUser();
    const vehicleData = {
        plaque: document.getElementById('vehiclePlaque').value,
        dateImmatriculation: document.getElementById('vehicleDateImmat').value,
        marque: document.getElementById('vehicleMarque').value,
        modele: document.getElementById('vehicleModele').value,
        couleur: document.getElementById('vehicleCouleur').value,
        places: parseInt(document.getElementById('vehiclePlaces').value),
        type: document.getElementById('vehicleType').value
    };
    
    try {
        const success = userManager.addVehicle(user.id, vehicleData);
        
        if (success) {
            alert('Véhicule ajouté avec succès !');
            hideAddVehicleModal();
            loadVehicles(userManager.getCurrentUser());
            loadVehicleOptions(userManager.getCurrentUser());
        } else {
            alert('Erreur lors de l\'ajout du véhicule');
        }
    } catch (error) {
        alert(error.message);
    }
}

function handleCreateTrip(e) {
    e.preventDefault();
    
    const user = userManager.getCurrentUser();
    
    // Vérifier que l'utilisateur est chauffeur
    if (!user.type || (user.type !== 'chauffeur' && user.type !== 'chauffeur-passager')) {
        alert('Vous devez être chauffeur pour créer un voyage');
        return;
    }
    
    // Vérifier qu'il a des véhicules
    if (!user.vehicles || user.vehicles.length === 0) {
        alert('Vous devez ajouter au moins un véhicule pour créer un voyage');
        return;
    }
    
    const tripData = {
        depart: document.getElementById('tripDepart').value,
        destination: document.getElementById('tripDestination').value,
        date: document.getElementById('tripDate').value,
        heureDepart: document.getElementById('tripHeureDepart').value,
        prix: parseInt(document.getElementById('tripPrix').value),
        vehicleId: parseInt(document.getElementById('tripVehicle').value)
    };
    
    // Validation des données
    if (tripData.prix < 3) {
        alert('Le prix minimum est de 3 crédits (2 crédits pour la plateforme + 1 pour vous)');
        return;
    }
    
    // Créer le voyage
    const vehicle = user.vehicles.find(v => v.id === tripData.vehicleId);
    const tripRecord = {
        id: Date.now(),
        type: 'chauffeur',
        depart: tripData.depart,
        destination: tripData.destination,
        date: tripData.date,
        heureDepart: tripData.heureDepart,
        prix: tripData.prix,
        vehicle: vehicle,
        passagers: 0,
        statut: 'en attente',
        dateCreation: new Date().toISOString().split('T')[0]
    };
    
    user.trips = user.trips || [];
    user.trips.push(tripRecord);
    userManager.updateUserProfile(user.id, { trips: user.trips });
    
    // Créer le covoiturage dans le système
    if (typeof tripManager !== 'undefined') {
        tripManager.createTripFromUserTrip(tripRecord, user);
        // Synchroniser pour mettre à jour la liste
        tripManager.syncUserTrips();
    }
    
    alert('Voyage créé avec succès ! Vous pouvez maintenant le voir sur la page d\'accueil.');
    document.getElementById('createTripForm').reset();
    
    // Recharger les données utilisateur
    const updatedUser = userManager.getCurrentUser();
    loadTrips(updatedUser);
}

// Fonction utilitaire pour formater les dates
function formaterDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Charger les données de recherche depuis le JSON
function loadSearchData() {
    fetch('data/covoiturages.json')
        .then(response => response.json())
        .then(data => {
            window.searchData = data.covoiturages;
        })
        .catch(error => {
            console.error('Erreur lors du chargement des données:', error);
        });
}

// Gérer la recherche de voyages
function handleSearchTrips(e) {
    e.preventDefault();
    
    const depart = document.getElementById('searchDepart').value;
    const destination = document.getElementById('searchDestination').value;
    const date = document.getElementById('searchDate').value;
    
    const results = window.searchData.filter(trip => {
        let match = true;
        
        if (depart && !trip.trajet.depart.toLowerCase().includes(depart.toLowerCase()) && 
            !trip.trajet.adresseDepart.toLowerCase().includes(depart.toLowerCase())) {
            match = false;
        }
        
        if (destination && !trip.trajet.destination.toLowerCase().includes(destination.toLowerCase()) && 
            !trip.trajet.adresseArrivee.toLowerCase().includes(destination.toLowerCase())) {
            match = false;
        }
        
        if (date && trip.details.date !== date) {
            match = false;
        }
        
        return match;
    });
    
    displaySearchResults(results);
}

// Afficher les résultats de recherche
function displaySearchResults(results) {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '';
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <div class="text-4xl mb-3">🔍</div>
                <p>Aucun covoiturage trouvé</p>
                <p class="text-sm">Essayez de modifier vos critères de recherche</p>
            </div>
        `;
        return;
    }
    
    results.forEach(trip => {
        const tripCard = document.createElement('div');
        tripCard.className = 'bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow';
        tripCard.innerHTML = `
            <div class="flex flex-col md:flex-row items-start justify-between">
                <div class="flex items-center space-x-4 mb-4 md:mb-0">
                    <img src="${trip.conducteur.photo}" alt="Photo du chauffeur" class="w-16 h-16 rounded-full">
                    <div>
                        <h3 class="font-bold text-green-700">${trip.conducteur.nom}</h3>
                        <p class="text-yellow-500">⭐ ${trip.conducteur.note}</p>
                        <p class="text-sm text-gray-600">${trip.conducteur.telephone}</p>
                    </div>
                </div>
                <div class="text-center mb-4 md:mb-0">
                    <p><strong>Trajet:</strong> ${trip.trajet.depart} → ${trip.trajet.destination}</p>
                    <p><strong>Distance:</strong> ${trip.trajet.distance}</p>
                    <p><strong>Durée:</strong> ${trip.trajet.duree}</p>
                    <p><strong>Places restantes:</strong> ${trip.details.placesDisponibles}</p>
                    <p><strong>Prix:</strong> ${trip.details.prix} crédits</p>
                    <p><strong>Date:</strong> ${formaterDate(trip.details.date)}</p>
                    <p><strong>Heure:</strong> ${trip.details.heureDepart} - ${trip.details.heureArrivee}</p>
                    <p class="text-green-600 font-semibold">🌱 ${trip.details.vehicule.type}</p>
                </div>
                <div class="flex flex-col space-y-2">
                    <button onclick="reserveTrip(${trip.id})" class="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition">
                        Réserver
                    </button>
                    <button onclick="showTripDetails(${trip.id})" class="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition">
                        Détails
                    </button>
                </div>
            </div>
        `;
        resultsContainer.appendChild(tripCard);
    });
}

// Réserver un voyage
function reserveTrip(tripId) {
    const trip = window.searchData.find(t => t.id === tripId);
    if (!trip) return;
    
    const user = userManager.getCurrentUser();
    
    if (user.credits < trip.details.prix) {
        alert('Crédits insuffisants pour réserver ce voyage');
        return;
    }
    
    if (confirm(`Réserver le voyage ${trip.trajet.depart} → ${trip.trajet.destination} pour ${trip.details.prix} crédits ?`)) {
        // Déduire les crédits
        userManager.deductCredits(user.id, trip.details.prix);
        
        // Ajouter le voyage à l'historique
        const tripRecord = {
            id: tripId,
            type: 'passager',
            depart: trip.trajet.depart,
            destination: trip.trajet.destination,
            date: trip.details.date,
            heureDepart: trip.details.heureDepart,
            prix: trip.details.prix,
            conducteur: trip.conducteur.nom,
            statut: 'confirmé',
            dateCreation: new Date().toISOString().split('T')[0]
        };
        
        user.trips = user.trips || [];
        user.trips.push(tripRecord);
        userManager.updateUserProfile(user.id, { trips: user.trips });
        
        alert('Voyage réservé avec succès !');
        
        // Mettre à jour l'affichage
        initializeDashboard(userManager.getCurrentUser());
        loadUserData(userManager.getCurrentUser());
    }
}

// Afficher les détails d'un voyage
function showTripDetails(tripId) {
    const trip = window.searchData.find(t => t.id === tripId);
    if (!trip) return;
    
    const details = `
        <div class="bg-white border border-gray-200 rounded-lg p-6">
            <h3 class="text-xl font-bold mb-4">Détails du voyage</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 class="font-semibold mb-2">Conducteur</h4>
                    <p><strong>Nom:</strong> ${trip.conducteur.nom}</p>
                    <p><strong>Note:</strong> ⭐ ${trip.conducteur.note}</p>
                    <p><strong>Téléphone:</strong> ${trip.conducteur.telephone}</p>
                    <p><strong>Email:</strong> ${trip.conducteur.email}</p>
                </div>
                <div>
                    <h4 class="font-semibold mb-2">Véhicule</h4>
                    <p><strong>Marque:</strong> ${trip.details.vehicule.marque}</p>
                    <p><strong>Modèle:</strong> ${trip.details.vehicule.modele}</p>
                    <p><strong>Type:</strong> ${trip.details.vehicule.type}</p>
                    <p><strong>Couleur:</strong> ${trip.details.vehicule.couleur}</p>
                    <p><strong>Places:</strong> ${trip.details.vehicule.places}</p>
                </div>
                <div>
                    <h4 class="font-semibold mb-2">Trajet</h4>
                    <p><strong>Départ:</strong> ${trip.trajet.adresseDepart}</p>
                    <p><strong>Arrivée:</strong> ${trip.trajet.adresseArrivee}</p>
                    <p><strong>Distance:</strong> ${trip.trajet.distance}</p>
                    <p><strong>Durée:</strong> ${trip.trajet.duree}</p>
                </div>
                <div>
                    <h4 class="font-semibold mb-2">Options</h4>
                    <p><strong>Climatisation:</strong> ${trip.details.options.climatisation ? '✅' : '❌'}</p>
                    <p><strong>Musique:</strong> ${trip.details.options.musique ? '✅' : '❌'}</p>
                    <p><strong>WiFi:</strong> ${trip.details.options.wifi ? '✅' : '❌'}</p>
                    <p><strong>Bagages:</strong> ${trip.details.options.bagages ? '✅' : '❌'}</p>
                    <p><strong>Animaux:</strong> ${trip.details.options.animaux ? '✅' : '❌'}</p>
                    <p><strong>Fumeur:</strong> ${trip.details.options.fumeur ? '✅' : '❌'}</p>
                </div>
            </div>
            ${trip.commentaires && trip.commentaires.length > 0 ? `
                <div class="mt-6">
                    <h4 class="font-semibold mb-3">Avis des passagers</h4>
                    <div class="space-y-3">
                        ${trip.commentaires.map(comment => `
                            <div class="bg-gray-50 p-3 rounded">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <p class="font-semibold">${comment.passager}</p>
                                        <p class="text-yellow-500">⭐ ${comment.note}/5</p>
                                        <p class="text-sm text-gray-600">${comment.commentaire}</p>
                                    </div>
                                    <span class="text-xs text-gray-500">${comment.date}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    // Créer une modal pour afficher les détails
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
    modal.innerHTML = `
        <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div class="mt-3">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-medium text-gray-900">Détails du voyage</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                        <span class="sr-only">Fermer</span>
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                ${details}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Fonction de déconnexion
function logout() {
    if (confirm('Voulez-vous vous déconnecter ?')) {
        userManager.logout();
        window.location.href = 'home.html';
    }
}

// Exporter la fonction logout pour qu'elle soit accessible depuis navbar.js
window.logout = logout;

// Charger et afficher les statistiques
function loadStatistics() {
    const user = userManager.getCurrentUser();
    
    if (!user.trips || user.trips.length === 0) {
        document.getElementById('totalTrips').textContent = '0';
        document.getElementById('creditsEarned').textContent = '0';
        document.getElementById('creditsSpent').textContent = '0';
        return;
    }
    
    const totalTrips = user.trips.length;
    const creditsEarned = user.trips.filter(trip => trip.type === 'chauffeur').reduce((sum, trip) => sum + (trip.prix - 2), 0);
    const creditsSpent = user.trips.filter(trip => trip.type === 'passager').reduce((sum, trip) => sum + trip.prix, 0);
    
    document.getElementById('totalTrips').textContent = totalTrips;
    document.getElementById('creditsEarned').textContent = creditsEarned;
    document.getElementById('creditsSpent').textContent = creditsSpent;
    
    // Créer les graphiques
    createTripsChart(user.trips);
    createVehiclesChart(user.vehicles || []);
}

// Créer le graphique des voyages
function createTripsChart(trips) {
    const ctx = document.getElementById('tripsChart').getContext('2d');
    
    // Grouper les voyages par mois
    const tripsByMonth = {};
    trips.forEach(trip => {
        const month = new Date(trip.date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        tripsByMonth[month] = (tripsByMonth[month] || 0) + 1;
    });
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(tripsByMonth),
            datasets: [{
                label: 'Voyages effectués',
                data: Object.values(tripsByMonth),
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Créer le graphique des véhicules
function createVehiclesChart(vehicles) {
    const ctx = document.getElementById('vehiclesChart').getContext('2d');
    
    // Compter les types de véhicules
    const vehicleTypes = {};
    vehicles.forEach(vehicle => {
        vehicleTypes[vehicle.type] = (vehicleTypes[vehicle.type] || 0) + 1;
    });
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(vehicleTypes),
            datasets: [{
                data: Object.values(vehicleTypes),
                backgroundColor: [
                    'rgb(34, 197, 94)',   // Vert pour électrique
                    'rgb(59, 130, 246)',  // Bleu pour essence
                    'rgb(245, 158, 11)', // Jaune pour diesel
                    'rgb(168, 85, 247)'  // Violet pour hybride
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}
