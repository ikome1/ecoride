// Module d'interactions temps réel pour EcoRide
// Améliore la partie dynamique du front-end avec des animations et mises à jour en temps réel

class RealtimeManager {
    constructor() {
        this.updateInterval = null;
        this.animationQueue = [];
        this.isActive = false;
    }
    
    // Démarrer les mises à jour en temps réel
    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        
        // Mettre à jour les crédits toutes les 30 secondes
        this.updateInterval = setInterval(() => {
            this.updateUserCredits();
            this.checkNewNotifications();
        }, 30000);
        
        // Animer les éléments au chargement
        this.animateOnLoad();
    }
    
    // Arrêter les mises à jour
    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.isActive = false;
    }
    
    // Mettre à jour les crédits de l'utilisateur
    async updateUserCredits() {
        try {
            if (typeof apiClient !== 'undefined' && apiClient.isLoggedIn()) {
                const sessionCheck = await apiClient.checkSession();
                if (sessionCheck.success && sessionCheck.user) {
                    const creditsElement = document.getElementById('userCredits');
                    if (creditsElement) {
                        const oldCredits = parseInt(creditsElement.textContent) || 0;
                        const newCredits = sessionCheck.user.credits || 0;
                        
                        if (oldCredits !== newCredits) {
                            this.animateNumberChange(creditsElement, oldCredits, newCredits);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour des crédits:', error);
        }
    }
    
    // Animer le changement de nombre
    animateNumberChange(element, oldValue, newValue) {
        const difference = newValue - oldValue;
        const duration = 1000;
        const steps = 30;
        const stepValue = difference / steps;
        let currentStep = 0;
        
        const animation = setInterval(() => {
            currentStep++;
            const currentValue = Math.round(oldValue + (stepValue * currentStep));
            
            if (currentStep >= steps) {
                element.textContent = newValue;
                clearInterval(animation);
                
                // Ajouter une animation de pulse
                element.classList.add('animate-pulse');
                setTimeout(() => {
                    element.classList.remove('animate-pulse');
                }, 500);
            } else {
                element.textContent = currentValue;
            }
        }, duration / steps);
    }
    
    // Vérifier les nouvelles notifications
    async checkNewNotifications() {
        // Cette fonction peut être étendue pour vérifier les notifications
        // depuis l'API ou le localStorage
        const notifications = JSON.parse(localStorage.getItem('ecoride_notifications') || '[]');
        const unreadCount = notifications.filter(n => !n.read).length;
        
        const notificationBadge = document.getElementById('notificationBadge');
        if (notificationBadge) {
            if (unreadCount > 0) {
                notificationBadge.textContent = unreadCount;
                notificationBadge.classList.remove('hidden');
                this.animateNotification(notificationBadge);
            } else {
                notificationBadge.classList.add('hidden');
            }
        }
    }
    
    // Animer les notifications
    animateNotification(element) {
        element.classList.add('animate-bounce');
        setTimeout(() => {
            element.classList.remove('animate-bounce');
        }, 1000);
    }
    
    // Animer les éléments au chargement de la page
    animateOnLoad() {
        // Animation fade-in pour les cartes
        const cards = document.querySelectorAll('.card, .bg-white.rounded-lg, .bg-gray-50.border');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
        
        // Animation pour les boutons
        const buttons = document.querySelectorAll('button, .btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.05)';
                this.style.transition = 'transform 0.2s ease';
            });
            
            button.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });
        });
    }
    
    // Afficher une notification toast
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
        
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            info: 'bg-blue-500 text-white',
            warning: 'bg-yellow-500 text-white'
        };
        
        toast.classList.add(...colors[type].split(' '));
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Animer l'entrée
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);
        
        // Supprimer après 3 secondes
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
    
    // Animer un élément lors d'une action
    animateAction(element, animationType = 'pulse') {
        const animations = {
            pulse: 'animate-pulse',
            bounce: 'animate-bounce',
            spin: 'animate-spin',
            ping: 'animate-ping'
        };
        
        if (animations[animationType]) {
            element.classList.add(animations[animationType]);
            setTimeout(() => {
                element.classList.remove(animations[animationType]);
            }, 1000);
        }
    }
    
    // Mettre à jour le compteur de résultats en temps réel
    updateResultsCount(count) {
        const countElement = document.getElementById('resultsCount');
        if (countElement) {
            const oldCount = parseInt(countElement.textContent) || 0;
            if (oldCount !== count) {
                this.animateNumberChange(countElement, oldCount, count);
            }
        }
    }
    
    // Ajouter un effet de chargement
    showLoading(element) {
        const loader = document.createElement('div');
        loader.className = 'loading-spinner';
        loader.innerHTML = `
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        `;
        element.appendChild(loader);
        return loader;
    }
    
    // Supprimer l'effet de chargement
    hideLoading(loader) {
        if (loader && loader.parentNode) {
            loader.parentNode.removeChild(loader);
        }
    }
}

// Instance globale
const realtimeManager = new RealtimeManager();

// Démarrer automatiquement si on est sur une page nécessitant des mises à jour
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('userCredits') || document.getElementById('notificationBadge')) {
            realtimeManager.start();
        }
    });
} else {
    if (document.getElementById('userCredits') || document.getElementById('notificationBadge')) {
        realtimeManager.start();
    }
}

// Exporter pour utilisation globale
window.realtimeManager = realtimeManager;

