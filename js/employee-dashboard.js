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

