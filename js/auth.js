/**
 * ============================================
 * SCRIPT D'AUTHENTIFICATION - EcoRide
 * ============================================
 * 
 * Ce fichier gère :
 * - La connexion (login)
 * - L'inscription (register)
 * - La vérification de session au chargement
 * - L'affichage des messages d'erreur/succès
 * 
 * Utilisé sur les pages : login.html, register.html
 */

/**
 * Code exécuté au chargement de la page
 * 
 * 1. Vérifie si l'utilisateur est déjà connecté
 * 2. Si oui → redirige vers le dashboard
 * 3. Si non → attache les gestionnaires d'événements aux formulaires
 */
document.addEventListener('DOMContentLoaded', async function() {
    // Vérifier si l'utilisateur est déjà connecté (session active)
    const sessionCheck = await apiClient.checkSession();
    if (sessionCheck.success) {
        // Si connecté, rediriger directement vers le dashboard
        redirectToDashboard();
        return; // Arrêter ici, pas besoin d'afficher le formulaire
    }

    // Si non connecté, préparer les formulaires
    
    // Gestion du formulaire de connexion
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Gestion du formulaire d'inscription
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

/**
 * Gère la soumission du formulaire de connexion
 * 
 * Processus :
 * 1. Empêche le rechargement de page (preventDefault)
 * 2. Récupère les valeurs du formulaire
 * 3. Valide que les champs sont remplis
 * 4. Appelle l'API pour se connecter
 * 5. Affiche un message de succès/erreur
 * 6. Redirige vers le dashboard si succès
 * 
 * @param {Event} e L'événement de soumission du formulaire
 */
async function handleLogin(e) {
    // Empêcher le comportement par défaut (rechargement de page)
    e.preventDefault();
    
    // Récupérer les valeurs du formulaire
    const pseudo = document.getElementById('pseudo').value.trim(); // trim() enlève les espaces
    const password = document.getElementById('password').value;
    
    // Validation côté client (rapide, avant l'appel API)
    if (!pseudo || !password) {
        showError('Veuillez remplir tous les champs');
        return; // Arrêter ici si validation échoue
    }

    try {
        // Appeler l'API pour se connecter
        const result = await apiClient.login(pseudo, password);
        
        if (result.success) {
            // Connexion réussie
            showSuccess('Connexion réussie ! Redirection...');
            
            // Attendre 1.5 secondes pour que l'utilisateur voie le message
            setTimeout(() => {
                redirectToDashboard(); // Rediriger vers le dashboard approprié
            }, 1500);
        } else {
            // Connexion échouée (mauvais identifiants)
            showError(result.message || 'Identifiants incorrects');
        }
    } catch (error) {
        // Erreur réseau ou serveur
        showError('Erreur de connexion au serveur');
        console.error('Erreur login:', error); // Logger pour débogage
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const pseudo = document.getElementById('pseudo').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation des champs
    if (!pseudo || !email || !password || !confirmPassword) {
        showError('Veuillez remplir tous les champs');
        return;
    }

    if (password !== confirmPassword) {
        showError('Les mots de passe ne correspondent pas');
        return;
    }

    if (pseudo.length < 3) {
        showError('Le pseudo doit contenir au moins 3 caractères');
        return;
    }

    try {
        const result = await apiClient.register(pseudo, email, password);
        
        if (result.success) {
            showSuccess(`Compte créé avec succès ! Vous avez ${result.user.credits} crédits. Redirection...`);
            
            // Connexion automatique
            await apiClient.login(pseudo, password);
            
            setTimeout(() => {
                redirectToDashboard();
            }, 2000);
        } else {
            showError(result.message || 'Erreur lors de la création du compte');
        }
        
    } catch (error) {
        showError(error.message || 'Erreur de connexion au serveur');
        console.error('Erreur register:', error);
    }
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }
    
    if (successDiv) {
        successDiv.classList.add('hidden');
    }
}

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    const errorDiv = document.getElementById('errorMessage');
    
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.classList.remove('hidden');
    }
    
    if (errorDiv) {
        errorDiv.classList.add('hidden');
    }
}

function redirectToDashboard() {
    apiClient.redirectToDashboard();
}

// Fonction de déconnexion (utilisable partout)
async function logout() {
    try {
        await apiClient.logout();
        window.location.href = 'home.html';
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        window.location.href = 'home.html';
    }
}
