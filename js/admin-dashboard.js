// Script pour le dashboard administrateur
console.log('=== ADMIN DASHBOARD: FICHIER CHARGÉ ===');

document.addEventListener('DOMContentLoaded', function() {
    console.log('=== ADMIN DASHBOARD: DOMContentLoaded DÉCLENCHÉ ===');
    
    // Vérifier l'authentification et le rôle
    if (!userManager.isLoggedIn()) {
        console.error('Admin Dashboard: Utilisateur non connecté, redirection vers login');
        window.location.href = 'login.html';
        return;
    }
    
    const user = userManager.getCurrentUser();
    if (!user) {
        console.error('Admin Dashboard: Utilisateur non trouvé, redirection vers login');
        window.location.href = 'login.html';
        return;
    }
    
    // Vérifier que l'utilisateur est bien admin
    if (user.role !== 'admin') {
        console.error('Admin Dashboard: Accès refusé - Rôle:', user.role);
        alert('Accès refusé. Cette page est réservée aux administrateurs.');
        window.location.href = 'dashboard.html';
        return;
    }
    
    console.log('Admin Dashboard: Admin connecté:', user.pseudo);
    
    // Initialiser le dashboard admin
    initializeAdminDashboard(user);
    
    // Charger les données
    loadAdminData();
    
    // Afficher l'onglet par défaut
    showTab('overview');
});

function initializeAdminDashboard(admin) {
    // Mettre à jour l'en-tête
    const adminNameEl = document.getElementById('adminName');
    if (adminNameEl) {
        adminNameEl.textContent = 'Bonjour, ' + admin.pseudo + ' !';
    }
    
    // Mettre à jour les champs du profil
    const adminPseudoEl = document.getElementById('adminPseudo');
    if (adminPseudoEl) {
        adminPseudoEl.value = admin.pseudo;
    }
    
    const adminEmailEl = document.getElementById('adminEmail');
    if (adminEmailEl) {
        adminEmailEl.value = admin.email || '';
    }
}

function showTab(tabName) {
    // Masquer tous les contenus
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => {
        content.classList.add('hidden');
    });
    
    // Désactiver tous les boutons
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => {
        button.classList.remove('border-purple-500', 'text-purple-600');
        button.classList.add('border-transparent', 'text-gray-500');
    });
    
    // Afficher le contenu sélectionné
    const selectedContent = document.getElementById('content-' + tabName);
    if (selectedContent) {
        selectedContent.classList.remove('hidden');
    }
    
    // Activer le bouton sélectionné
    const selectedButton = document.getElementById('tab-' + tabName);
    if (selectedButton) {
        selectedButton.classList.remove('border-transparent', 'text-gray-500');
        selectedButton.classList.add('border-purple-500', 'text-purple-600');
    }
    
    // Charger les données spécifiques à l'onglet
    switch(tabName) {
        case 'users':
            loadUsers();
            break;
        case 'trips':
            loadTrips();
            break;
        case 'reviews':
            loadReviews();
            break;
    }
}

function loadAdminData() {
    // Charger les statistiques globales
    loadStatistics();
    
    // Charger les graphiques
    loadCharts();
}

function loadStatistics() {
    // Statistiques depuis userManager
    const stats = userManager.getAdminStats();
    
    // Mettre à jour les statistiques
    const totalUsersEl = document.getElementById('totalUsers');
    if (totalUsersEl) {
        totalUsersEl.textContent = stats.totalUsers || userManager.users.length;
    }
    
    const activeTripsEl = document.getElementById('activeTrips');
    if (activeTripsEl) {
        // Compter les trajets actifs
        let totalTrips = 0;
        userManager.users.forEach(user => {
            if (user.trips) {
                totalTrips += user.trips.length;
            }
        });
        activeTripsEl.textContent = totalTrips;
    }
    
    const totalCreditsEl = document.getElementById('totalCredits');
    if (totalCreditsEl) {
        // Calculer les crédits totaux
        let totalCredits = 0;
        userManager.users.forEach(user => {
            totalCredits += user.credits || 0;
        });
        totalCreditsEl.textContent = totalCredits;
    }
    
    const pendingReviewsEl = document.getElementById('pendingReviews');
    if (pendingReviewsEl) {
        pendingReviewsEl.textContent = '0'; // À implémenter avec les avis
    }
}

function loadCharts() {
    // Graphique des utilisateurs
    const usersCtx = document.getElementById('usersChart');
    if (usersCtx) {
        const stats = userManager.getAdminStats();
        new Chart(usersCtx, {
            type: 'line',
            data: {
                labels: Object.keys(stats.tripsByDay || {}),
                datasets: [{
                    label: 'Utilisateurs',
                    data: Object.values(stats.tripsByDay || {}),
                    borderColor: 'rgb(99, 102, 241)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.1
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
    
    // Graphique des trajets
    const tripsCtx = document.getElementById('tripsChart');
    if (tripsCtx) {
        const stats = userManager.getAdminStats();
        new Chart(tripsCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(stats.tripsByDay || {}),
                datasets: [{
                    label: 'Trajets',
                    data: Object.values(stats.tripsByDay || {}),
                    backgroundColor: 'rgba(34, 197, 94, 0.5)',
                    borderColor: 'rgb(34, 197, 94)',
                    borderWidth: 1
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
}

function loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // Charger tous les utilisateurs
    const allUsers = [
        ...userManager.users.map(u => ({...u, source: 'users'})),
        ...userManager.employees.map(e => ({...e, source: 'employees'})),
        ...userManager.admins.map(a => ({...a, source: 'admins'}))
    ];
    
    if (allUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-4 text-center text-gray-500">Aucun utilisateur trouvé</td></tr>';
        return;
    }
    
    allUsers.forEach(user => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-4 py-3 text-sm text-gray-900">${user.id}</td>
            <td class="px-4 py-3 text-sm text-gray-900">${user.pseudo}</td>
            <td class="px-4 py-3 text-sm text-gray-900">${user.email || 'N/A'}</td>
            <td class="px-4 py-3 text-sm">
                <span class="px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'employee' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                }">${user.role}</span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-900">${user.credits || 'N/A'}</td>
            <td class="px-4 py-3 text-sm">
                <button onclick="viewUser(${user.id}, '${user.source}')" class="text-blue-600 hover:text-blue-800 mr-2">👁️</button>
                <button onclick="editUser(${user.id}, '${user.source}')" class="text-green-600 hover:text-green-800 mr-2">✏️</button>
                <button onclick="deleteUser(${user.id}, '${user.source}')" class="text-red-600 hover:text-red-800">🗑️</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadTrips() {
    const tripsList = document.getElementById('adminTripsList');
    if (!tripsList) return;
    
    tripsList.innerHTML = '<p class="text-gray-500">Chargement des trajets...</p>';
    
    // Collecter tous les trajets de tous les utilisateurs
    let allTrips = [];
    userManager.users.forEach(user => {
        if (user.trips && user.trips.length > 0) {
            user.trips.forEach(trip => {
                allTrips.push({...trip, user: user.pseudo});
            });
        }
    });
    
    if (allTrips.length === 0) {
        tripsList.innerHTML = '<p class="text-gray-500">Aucun trajet trouvé</p>';
        return;
    }
    
    tripsList.innerHTML = '';
    allTrips.forEach(trip => {
        const tripCard = document.createElement('div');
        tripCard.className = 'bg-white border border-gray-200 rounded-lg p-4';
        tripCard.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="font-semibold">${trip.depart || 'N/A'} → ${trip.destination || 'N/A'}</h3>
                    <p class="text-sm text-gray-600">Par: ${trip.user}</p>
                    <p class="text-sm text-gray-600">Date: ${trip.date || 'N/A'}</p>
                    <p class="text-sm text-gray-600">Prix: ${trip.prix || 'N/A'} crédits</p>
                </div>
                <button onclick="deleteTrip('${trip.id}')" class="text-red-600 hover:text-red-800">🗑️</button>
            </div>
        `;
        tripsList.appendChild(tripCard);
    });
}

function loadReviews() {
    const reviewsList = document.getElementById('reviewsList');
    if (!reviewsList) return;
    
    reviewsList.innerHTML = '<p class="text-gray-500">Aucun avis en attente de modération</p>';
}

function refreshUsers() {
    loadUsers();
}

function refreshTrips() {
    loadTrips();
}

function refreshReviews() {
    loadReviews();
}

function viewUser(userId, source) {
    alert('Fonctionnalité à implémenter: Voir les détails de l\'utilisateur ' + userId);
}

function editUser(userId, source) {
    alert('Fonctionnalité à implémenter: Modifier l\'utilisateur ' + userId);
}

function deleteUser(userId, source) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
        alert('Fonctionnalité à implémenter: Supprimer l\'utilisateur ' + userId);
    }
}

function deleteTrip(tripId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce trajet ?')) {
        alert('Fonctionnalité à implémenter: Supprimer le trajet ' + tripId);
    }
}

function saveSettings() {
    const initialCredits = document.getElementById('initialCredits').value;
    const minTripPrice = document.getElementById('minTripPrice').value;
    
    // Sauvegarder les paramètres (à implémenter avec localStorage ou API)
    localStorage.setItem('ecoride_settings_initialCredits', initialCredits);
    localStorage.setItem('ecoride_settings_minTripPrice', minTripPrice);
    
    alert('Paramètres sauvegardés avec succès !');
}

// Fonction de déconnexion
function logout() {
    if (confirm('Voulez-vous vous déconnecter ?')) {
        userManager.logout();
        window.location.href = 'login.html';
    }
}

// Exporter la fonction logout
window.logout = logout;

