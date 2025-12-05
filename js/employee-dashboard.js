// Script pour le dashboard employé
console.log('=== EMPLOYEE DASHBOARD: FICHIER CHARGÉ ===');

let currentReviewId = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('=== EMPLOYEE DASHBOARD: DOMContentLoaded DÉCLENCHÉ ===');
    console.log('Employee Dashboard: localStorage:', localStorage.getItem('ecoride_current_user'));
    
    // Attendre un peu pour que userManager soit initialisé
    setTimeout(function() {
        console.log('Employee Dashboard: Vérification après 100ms');
        console.log('Employee Dashboard: userManager.users:', userManager.users.length);
        console.log('Employee Dashboard: userManager.employees:', userManager.employees.length);
        console.log('Employee Dashboard: userManager.admins:', userManager.admins.length);
        
        // Vérifier l'authentification et le rôle
        const isLoggedIn = userManager.isLoggedIn();
        console.log('Employee Dashboard: isLoggedIn() =', isLoggedIn);
        
        if (!isLoggedIn) {
            console.error('Employee Dashboard: Utilisateur non connecté, redirection vers login');
            const stored = localStorage.getItem('ecoride_current_user');
            console.error('Employee Dashboard: localStorage contient:', stored);
            window.location.href = 'login.html';
            return;
        }
        
        // Synchroniser l'utilisateur
        console.log('Employee Dashboard: Tentative de synchronisation...');
        const syncResult = userManager.syncCurrentUser();
        console.log('Employee Dashboard: syncCurrentUser() =', syncResult);
        
        if (!syncResult) {
            console.error('Employee Dashboard: Synchronisation échouée, redirection vers login');
            window.location.href = 'login.html';
            return;
        }
        
        const user = userManager.getCurrentUser();
        console.log('Employee Dashboard: Utilisateur récupéré:', user);
        
        if (!user) {
            console.error('Employee Dashboard: Utilisateur non trouvé, redirection vers login');
            window.location.href = 'login.html';
            return;
        }
        
        // Vérifier que l'utilisateur est bien employé ou admin
        if (user.role !== 'employee' && user.role !== 'admin') {
            console.error('Employee Dashboard: Accès refusé - Rôle:', user.role);
            alert('Accès refusé. Cette page est réservée aux employés.');
            window.location.href = 'dashboard.html';
            return;
        }
        
        console.log('Employee Dashboard: Employé connecté:', user.pseudo, 'Rôle:', user.role);
        
        // Initialiser le dashboard employé
        initializeEmployeeDashboard(user);
        
        // Charger les données
        loadEmployeeData();
        
        // Afficher l'onglet par défaut
        showTab('reviews');
    }, 100);
});

function initializeEmployeeDashboard(employee) {
    // Mettre à jour l'en-tête
    const employeeNameEl = document.getElementById('employeeName');
    if (employeeNameEl) {
        employeeNameEl.textContent = 'Bonjour, ' + employee.pseudo + ' !';
    }
    
    // Mettre à jour les champs du profil
    const employeePseudoEl = document.getElementById('employeePseudo');
    if (employeePseudoEl) {
        employeePseudoEl.value = employee.pseudo;
    }
    
    const employeeEmailEl = document.getElementById('employeeEmail');
    if (employeeEmailEl) {
        employeeEmailEl.value = employee.email || '';
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
        button.classList.remove('border-blue-500', 'text-blue-600');
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
        selectedButton.classList.add('border-blue-500', 'text-blue-600');
    }
    
    // Charger les données spécifiques à l'onglet
    switch(tabName) {
        case 'reviews':
            loadReviews();
            break;
        case 'users':
            loadUsersEmployee();
            break;
        case 'vehicles':
            loadVehiclesEmployee();
            break;
        case 'stats':
            loadStats();
            break;
    }
}

function loadEmployeeData() {
    // Charger les statistiques
    loadStatistics();
}

function loadStatistics() {
    // Statistiques depuis localStorage ou données par défaut
    const pendingReviews = parseInt(localStorage.getItem('ecoride_pending_reviews') || '0');
    const moderatedToday = parseInt(localStorage.getItem('ecoride_moderated_today') || '0');
    const totalModerated = parseInt(localStorage.getItem('ecoride_total_moderated') || '0');
    
    const pendingReviewsEl = document.getElementById('pendingReviews');
    if (pendingReviewsEl) {
        pendingReviewsEl.textContent = pendingReviews;
    }
    
    const moderatedTodayEl = document.getElementById('moderatedToday');
    if (moderatedTodayEl) {
        moderatedTodayEl.textContent = moderatedToday;
    }
    
    const totalModeratedEl = document.getElementById('totalModerated');
    if (totalModeratedEl) {
        totalModeratedEl.textContent = totalModerated;
    }
}

function loadReviews() {
    const reviewsList = document.getElementById('reviewsList');
    if (!reviewsList) return;
    
    // Pour l'instant, afficher des avis de démonstration
    // Dans une vraie application, cela viendrait d'une API
    const reviews = [
        {
            id: 1,
            author: 'user123',
            trip: 'Paris → Lyon',
            rating: 5,
            comment: 'Excellent trajet, conducteur très ponctuel et agréable !',
            status: 'pending',
            date: '2024-12-01'
        },
        {
            id: 2,
            author: 'user456',
            trip: 'Lyon → Marseille',
            rating: 4,
            comment: 'Bon voyage, voiture confortable.',
            status: 'pending',
            date: '2024-12-01'
        },
        {
            id: 3,
            author: 'user789',
            trip: 'Marseille → Nice',
            rating: 3,
            comment: 'Trajet correct mais un peu de retard.',
            status: 'approved',
            date: '2024-11-30'
        }
    ];
    
    const filter = document.getElementById('filterReviews')?.value || 'all';
    const filteredReviews = filter === 'all' 
        ? reviews 
        : reviews.filter(r => r.status === filter);
    
    if (filteredReviews.length === 0) {
        reviewsList.innerHTML = '<p class="text-gray-500">Aucun avis à afficher</p>';
        return;
    }
    
    reviewsList.innerHTML = '';
    filteredReviews.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.className = `bg-white border rounded-lg p-4 ${
            review.status === 'pending' ? 'border-yellow-300 bg-yellow-50' :
            review.status === 'approved' ? 'border-green-300 bg-green-50' :
            'border-red-300 bg-red-50'
        }`;
        
        const statusBadge = {
            'pending': '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">En attente</span>',
            'approved': '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Approuvé</span>',
            'rejected': '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Rejeté</span>'
        }[review.status];
        
        const stars = '⭐'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        
        reviewCard.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h3 class="font-semibold">${review.trip}</h3>
                    <p class="text-sm text-gray-600">Par: ${review.author}</p>
                    <p class="text-sm text-gray-600">Date: ${review.date}</p>
                </div>
                ${statusBadge}
            </div>
            <div class="mb-2">
                <p class="text-lg">${stars}</p>
            </div>
            <p class="text-gray-700 mb-3">${review.comment}</p>
            ${review.status === 'pending' ? `
                <div class="flex space-x-2">
                    <button onclick="openReviewModal(${review.id})" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">
                        Modérer
                    </button>
                </div>
            ` : ''}
        `;
        reviewsList.appendChild(reviewCard);
    });
}

function loadStats() {
    // Charger les graphiques
    loadCharts();
}

function loadCharts() {
    // Graphique des avis modérés par jour
    const reviewsCtx = document.getElementById('reviewsChart');
    if (reviewsCtx) {
        new Chart(reviewsCtx, {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                datasets: [{
                    label: 'Avis modérés',
                    data: [5, 8, 12, 10, 15, 7, 9],
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
    
    // Graphique des décisions
    const decisionsCtx = document.getElementById('decisionsChart');
    if (decisionsCtx) {
        new Chart(decisionsCtx, {
            type: 'doughnut',
            data: {
                labels: ['Approuvés', 'Rejetés', 'En attente'],
                datasets: [{
                    data: [45, 10, 5],
                    backgroundColor: [
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(234, 179, 8, 0.8)'
                    ],
                    borderColor: [
                        'rgb(34, 197, 94)',
                        'rgb(239, 68, 68)',
                        'rgb(234, 179, 8)'
                    ],
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

function refreshReviews() {
    loadReviews();
}

function filterReviews() {
    loadReviews();
}

function loadUsersEmployee() {
    const tbody = document.getElementById('usersTableBodyEmployee');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // IMPORTANT: Recharger les utilisateurs depuis localStorage pour avoir les dernières données
    userManager.users = userManager.loadUsers();
    userManager.employees = userManager.loadEmployees();
    
    // Charger tous les utilisateurs (sauf admins)
    const allUsers = [
        ...userManager.users.map(u => ({...u, source: 'users'})),
        ...userManager.employees.map(e => ({...e, source: 'employees'}))
    ];
    
    // Filtrer par recherche si nécessaire
    const searchTerm = document.getElementById('searchUsersEmployee')?.value.toLowerCase() || '';
    const filteredUsers = searchTerm 
        ? allUsers.filter(u => 
            u.pseudo.toLowerCase().includes(searchTerm) ||
            (u.email && u.email.toLowerCase().includes(searchTerm))
        )
        : allUsers;
    
    if (filteredUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="px-4 py-4 text-center text-gray-500">Aucun utilisateur trouvé</td></tr>';
        return;
    }
    
    filteredUsers.forEach(user => {
        const vehicleCount = user.vehicles ? user.vehicles.length : 0;
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-4 py-3 text-sm text-gray-900">${user.id}</td>
            <td class="px-4 py-3 text-sm text-gray-900">${user.pseudo}</td>
            <td class="px-4 py-3 text-sm text-gray-900">${user.email || 'N/A'}</td>
            <td class="px-4 py-3 text-sm">
                <span class="px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'employee' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                }">${user.role}</span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-900">${user.credits !== undefined ? user.credits : 'N/A'}</td>
            <td class="px-4 py-3 text-sm text-gray-900">${vehicleCount} véhicule(s)</td>
            <td class="px-4 py-3 text-sm">
                <button onclick="viewUserEmployee(${user.id}, '${user.source}')" class="text-blue-600 hover:text-blue-800" title="Voir les détails">
                    👁️ Voir
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadVehiclesEmployee() {
    const tbody = document.getElementById('vehiclesTableBodyEmployee');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // IMPORTANT: Recharger les utilisateurs depuis localStorage pour avoir les dernières données
    userManager.users = userManager.loadUsers();
    userManager.employees = userManager.loadEmployees();
    
    // Collecter tous les véhicules de tous les utilisateurs
    let allVehicles = [];
    const allUsers = [
        ...userManager.users.map(u => ({...u, source: 'users'})),
        ...userManager.employees.map(e => ({...e, source: 'employees'}))
    ];
    
    allUsers.forEach(user => {
        if (user.vehicles && user.vehicles.length > 0) {
            user.vehicles.forEach(vehicle => {
                allVehicles.push({
                    ...vehicle,
                    ownerId: user.id,
                    ownerPseudo: user.pseudo,
                    ownerEmail: user.email,
                    ownerSource: user.source
                });
            });
        }
    });
    
    // Filtrer par recherche si nécessaire
    const searchTerm = document.getElementById('searchVehiclesEmployee')?.value.toLowerCase() || '';
    const filteredVehicles = searchTerm 
        ? allVehicles.filter(v => 
            v.plaque.toLowerCase().includes(searchTerm) ||
            v.marque.toLowerCase().includes(searchTerm) ||
            v.modele.toLowerCase().includes(searchTerm) ||
            v.ownerPseudo.toLowerCase().includes(searchTerm)
        )
        : allVehicles;
    
    if (filteredVehicles.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="px-4 py-4 text-center text-gray-500">Aucun véhicule trouvé</td></tr>';
        return;
    }
    
    filteredVehicles.forEach(vehicle => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-4 py-3 text-sm text-gray-900">
                <div>
                    <div class="font-medium">${vehicle.ownerPseudo}</div>
                    <div class="text-xs text-gray-500">${vehicle.ownerEmail || 'N/A'}</div>
                </div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-900 font-mono">${vehicle.plaque || 'N/A'}</td>
            <td class="px-4 py-3 text-sm text-gray-900">${vehicle.marque || 'N/A'}</td>
            <td class="px-4 py-3 text-sm text-gray-900">${vehicle.modele || 'N/A'}</td>
            <td class="px-4 py-3 text-sm">
                <span class="px-2 py-1 text-xs font-semibold rounded-full ${
                    vehicle.type === 'Électrique' ? 'bg-green-100 text-green-800' :
                    vehicle.type === 'Hybride' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                }">${vehicle.type || 'N/A'}</span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-900">${vehicle.places || 'N/A'}</td>
            <td class="px-4 py-3 text-sm">
                <button onclick="viewVehicleOwnerEmployee(${vehicle.ownerId}, '${vehicle.ownerSource}')" class="text-blue-600 hover:text-blue-800" title="Voir le propriétaire">
                    👤
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function refreshUsersEmployee() {
    loadUsersEmployee();
}

function refreshVehiclesEmployee() {
    loadVehiclesEmployee();
}

function viewUserEmployee(userId, source) {
    // IMPORTANT: Recharger les utilisateurs depuis localStorage pour avoir les dernières données
    userManager.users = userManager.loadUsers();
    userManager.employees = userManager.loadEmployees();
    
    // Trouver l'utilisateur
    let user = null;
    if (source === 'users') {
        user = userManager.users.find(u => u.id === userId);
    } else if (source === 'employees') {
        user = userManager.employees.find(e => e.id === userId);
    }
    
    if (!user) {
        alert('Utilisateur non trouvé');
        return;
    }
    
    // Construire le contenu du modal
    const modal = document.getElementById('userDetailsModalEmployee');
    const content = document.getElementById('userDetailsContentEmployee');
    
    if (!modal || !content) return;
    
    // Informations de base
    let html = `
        <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 class="font-semibold text-lg mb-3">Informations personnelles</h4>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="text-sm font-medium text-gray-600">ID</label>
                    <p class="text-gray-900">${user.id}</p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-600">Pseudo</label>
                    <p class="text-gray-900">${user.pseudo || 'N/A'}</p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-600">Email</label>
                    <p class="text-gray-900">${user.email || 'N/A'}</p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-600">Rôle</label>
                    <p class="text-gray-900">
                        <span class="px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'employee' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                        }">${user.role || 'N/A'}</span>
                    </p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-600">Type</label>
                    <p class="text-gray-900">${user.type || 'N/A'}</p>
                </div>
                <div>
                    <label class="text-sm font-medium text-gray-600">Crédits</label>
                    <p class="text-gray-900">${user.credits !== undefined ? user.credits : 'N/A'}</p>
                </div>
            </div>
        </div>
    `;
    
    // Véhicules
    if (user.vehicles && user.vehicles.length > 0) {
        html += `
            <div class="bg-blue-50 rounded-lg p-4 mb-4">
                <h4 class="font-semibold text-lg mb-3">Véhicules (${user.vehicles.length})</h4>
                <div class="space-y-3">
        `;
        user.vehicles.forEach(vehicle => {
            html += `
                <div class="bg-white rounded p-3 border border-blue-200">
                    <div class="grid grid-cols-2 gap-2 text-sm">
                        <div><span class="font-medium">Plaque:</span> <span class="font-mono">${vehicle.plaque || 'N/A'}</span></div>
                        <div><span class="font-medium">Marque:</span> ${vehicle.marque || 'N/A'}</div>
                        <div><span class="font-medium">Modèle:</span> ${vehicle.modele || 'N/A'}</div>
                        <div><span class="font-medium">Type:</span> ${vehicle.type || 'N/A'}</div>
                        <div><span class="font-medium">Places:</span> ${vehicle.places || 'N/A'}</div>
                        <div><span class="font-medium">Date immat.:</span> ${vehicle.dateImmatriculation || 'N/A'}</div>
                    </div>
                </div>
            `;
        });
        html += `
                </div>
            </div>
        `;
    } else {
        html += `
            <div class="bg-blue-50 rounded-lg p-4 mb-4">
                <h4 class="font-semibold text-lg mb-3">Véhicules</h4>
                <p class="text-gray-600">Aucun véhicule enregistré</p>
            </div>
        `;
    }
    
    // Trajets
    if (user.trips && user.trips.length > 0) {
        html += `
            <div class="bg-green-50 rounded-lg p-4 mb-4">
                <h4 class="font-semibold text-lg mb-3">Trajets (${user.trips.length})</h4>
                <div class="space-y-2">
        `;
        user.trips.forEach(trip => {
            html += `
                <div class="bg-white rounded p-2 border border-green-200 text-sm">
                    <span class="font-medium">${trip.depart || 'N/A'}</span> → 
                    <span class="font-medium">${trip.destination || 'N/A'}</span> 
                    (${trip.date || 'N/A'}) - ${trip.prix || 'N/A'} crédits
                </div>
            `;
        });
        html += `
                </div>
            </div>
        `;
    } else {
        html += `
            <div class="bg-green-50 rounded-lg p-4 mb-4">
                <h4 class="font-semibold text-lg mb-3">Trajets</h4>
                <p class="text-gray-600">Aucun trajet créé</p>
            </div>
        `;
    }
    
    content.innerHTML = html;
    modal.classList.remove('hidden');
}

function hideUserDetailsModalEmployee() {
    const modal = document.getElementById('userDetailsModalEmployee');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function viewVehicleOwnerEmployee(ownerId, ownerSource) {
    viewUserEmployee(ownerId, ownerSource);
}

// Ajouter des listeners pour la recherche
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        const searchUsersInput = document.getElementById('searchUsersEmployee');
        if (searchUsersInput) {
            searchUsersInput.addEventListener('input', function() {
                loadUsersEmployee();
            });
        }
        
        const searchVehiclesInput = document.getElementById('searchVehiclesEmployee');
        if (searchVehiclesInput) {
            searchVehiclesInput.addEventListener('input', function() {
                loadVehiclesEmployee();
            });
        }
    }, 200);
});

function openReviewModal(reviewId) {
    currentReviewId = reviewId;
    const modal = document.getElementById('reviewModal');
    const modalContent = document.getElementById('reviewModalContent');
    
    if (modal && modalContent) {
        // Charger les détails de l'avis (pour l'instant, données de démo)
        modalContent.innerHTML = `
            <div>
                <p class="font-semibold">Trajet: Paris → Lyon</p>
                <p class="text-sm text-gray-600">Auteur: user123</p>
                <p class="text-sm text-gray-600">Date: 2024-12-01</p>
                <p class="mt-2">⭐⭐⭐⭐⭐</p>
                <p class="mt-2">Excellent trajet, conducteur très ponctuel et agréable !</p>
            </div>
        `;
        modal.classList.remove('hidden');
    }
}

function hideReviewModal() {
    const modal = document.getElementById('reviewModal');
    if (modal) {
        modal.classList.add('hidden');
    }
    currentReviewId = null;
}

function approveReview() {
    if (!currentReviewId) return;
    
    if (confirm('Approuver cet avis ?')) {
        // Mettre à jour les statistiques
        const moderatedToday = parseInt(localStorage.getItem('ecoride_moderated_today') || '0') + 1;
        const totalModerated = parseInt(localStorage.getItem('ecoride_total_moderated') || '0') + 1;
        const pendingReviews = Math.max(0, parseInt(localStorage.getItem('ecoride_pending_reviews') || '0') - 1);
        
        localStorage.setItem('ecoride_moderated_today', moderatedToday.toString());
        localStorage.setItem('ecoride_total_moderated', totalModerated.toString());
        localStorage.setItem('ecoride_pending_reviews', pendingReviews.toString());
        
        alert('Avis approuvé avec succès !');
        hideReviewModal();
        loadReviews();
        loadStatistics();
    }
}

function rejectReview() {
    if (!currentReviewId) return;
    
    if (confirm('Rejeter cet avis ?')) {
        // Mettre à jour les statistiques
        const moderatedToday = parseInt(localStorage.getItem('ecoride_moderated_today') || '0') + 1;
        const totalModerated = parseInt(localStorage.getItem('ecoride_total_moderated') || '0') + 1;
        const pendingReviews = Math.max(0, parseInt(localStorage.getItem('ecoride_pending_reviews') || '0') - 1);
        
        localStorage.setItem('ecoride_moderated_today', moderatedToday.toString());
        localStorage.setItem('ecoride_total_moderated', totalModerated.toString());
        localStorage.setItem('ecoride_pending_reviews', pendingReviews.toString());
        
        alert('Avis rejeté.');
        hideReviewModal();
        loadReviews();
        loadStatistics();
    }
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

