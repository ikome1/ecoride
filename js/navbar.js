// Gestion dynamique de la navbar
function updateNavbar() {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) {
    console.log('Navbar: nav-links non trouvé');
    return;
  }
  
  console.log('Navbar: Mise à jour de la navbar');
  console.log('Navbar: localStorage ecoride_current_user:', localStorage.getItem('ecoride_current_user'));
  
  // Vérifier si l'utilisateur est connecté
  const isLoggedIn = userManager.isLoggedIn();
  console.log('Navbar: isLoggedIn() =', isLoggedIn);
  
  if (isLoggedIn) {
    // Récupérer l'utilisateur connecté
    let currentUser = userManager.getCurrentUser();
    
    // Si pas d'utilisateur en mémoire, essayer depuis localStorage
    if (!currentUser) {
      const stored = localStorage.getItem('ecoride_current_user');
      if (stored) {
        try {
          currentUser = JSON.parse(stored);
          console.log('Navbar: Utilisateur chargé depuis localStorage:', currentUser.pseudo);
        } catch (error) {
          console.error('Navbar: Erreur parsing localStorage:', error);
        }
      }
    }
    
    console.log('Navbar: Utilisateur connecté:', currentUser);
    
    if (!currentUser) {
      console.log('Navbar: Pas d\'utilisateur trouvé malgré isLoggedIn=true, affichage navbar non connecté');
      // Navbar pour visiteur non connecté
      navLinks.innerHTML = `
        <li><a href="home.html">Accueil</a></li>
        <li><a href="covoiurage-disponibles.html">Accès aux covoiturages</a></li>
        <li><a href="contact.html">Contact</a></li>
        <li><a href="login.html">Connexion</a></li>
        <li><a href="register.html">Créer un compte</a></li>
      `;
      return;
    }
    
    // Déterminer le lien vers l'espace selon le rôle
    let espaceLink = 'dashboard.html';
    const role = String(currentUser.role || '').toLowerCase().trim();
    console.log('Navbar: Rôle détecté:', role, '(type:', typeof currentUser.role, ')');
    console.log('Navbar: Données utilisateur complètes:', currentUser);
    
    if (role === 'employee' || role === 'employe' || role === 'employé') {
      espaceLink = 'employee-dashboard.html';
      console.log('Navbar: ✅ Lien espace = employee-dashboard.html');
    } else if (role === 'admin' || role === 'administrator') {
      espaceLink = 'admin-dashboard.html';
      console.log('Navbar: ✅ Lien espace = admin-dashboard.html');
    } else {
      espaceLink = 'dashboard.html';
      console.log('Navbar: ✅ Lien espace = dashboard.html (utilisateur normal)');
    }
    
    console.log('Navbar: Affichage navbar connecté, lien espace:', espaceLink);
    
    // Navbar pour utilisateur connecté
    navLinks.innerHTML = `
      <li><a href="home.html">Accueil</a></li>
      <li><a href="covoiurage-disponibles.html">Accès aux covoiturages</a></li>
      <li><a href="contact.html">Contact</a></li>
      <li><a href="${espaceLink}">Mon Espace</a></li>
      <li><a href="#" onclick="logout()">Déconnexion</a></li>
    `;
  } else {
    console.log('Navbar: Affichage navbar non connecté');
    // Navbar pour visiteur non connecté
    navLinks.innerHTML = `
      <li><a href="home.html">Accueil</a></li>
      <li><a href="covoiurage-disponibles.html">Accès aux covoiturages</a></li>
      <li><a href="contact.html">Contact</a></li>
      <li><a href="login.html">Connexion</a></li>
      <li><a href="register.html">Créer un compte</a></li>
    `;
  }
}

// Fonction de déconnexion
function logout() {
  if (confirm('Voulez-vous vous déconnecter ?')) {
    userManager.logout();
    window.location.href = 'home.html';
  }
}

// Exporter la fonction logout
window.logout = logout;

// Initialiser la navbar au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
  // Attendre un peu pour que userManager soit initialisé
  setTimeout(function() {
    updateNavbar();
  }, 100);
});

// Mettre à jour la navbar périodiquement pour s'assurer qu'elle est à jour
setInterval(function() {
  if (typeof userManager !== 'undefined') {
    updateNavbar();
  }
}, 1000);
