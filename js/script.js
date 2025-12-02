
// Charger les données de covoiturage
let covoiturageData = [];

document.addEventListener('DOMContentLoaded', async function() {
  // Charger le userManager
  if (typeof userManager === 'undefined') {
    console.error('userManager non chargé !');
    return;
  }
  console.log('Script principal chargé');
  
  // Charger les données depuis le fichier JSON
  try {
    const response = await fetch('data/covoiturages.json');
    const data = await response.json();
    covoiturageData = data.covoiturages;
    console.log('Données de covoiturage chargées:', covoiturageData.length, 'voyages');
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
  }

  // Synchroniser les covoiturages des utilisateurs avec le tripManager
  if (typeof tripManager !== 'undefined') {
    tripManager.syncUserTrips();
    
    // Fusionner les covoiturages du JSON avec ceux des utilisateurs
    const userTrips = tripManager.getAllTrips();
    covoiturageData = [...covoiturageData, ...userTrips];
    console.log('Total des covoiturages (JSON + utilisateurs):', covoiturageData.length);
  }
  
  const searchForm = document.getElementById('searchForm');
  const resultsSection = document.getElementById('searchResults');
  const resetButton = document.getElementById('resetButton');

  if (searchForm && resultsSection) {
    // Gestion de la recherche
    searchForm.addEventListener('submit', function(e){
      e.preventDefault();

      // Récupération des valeurs
      const depart = this.depart.value.trim();
      const destination = this.destination.value.trim();
      const date = this.date.value;

      // Recherche dans les données locales
      const resultats = rechercherCovoiturages(depart, destination, date);
      afficherResultats(resultats, resultsSection);
    });

    // Gestion du bouton Reset
    if (resetButton) {
      resetButton.addEventListener('click', function() {
        resetRecherche();
      });
    }
    
    // Afficher le message d'accueil initial
    afficherMessageAccueil();
  }
});

// Fonction de recherche locale
function rechercherCovoiturages(depart, destination, date) {
  return covoiturageData.filter(covoiturage => {
    let match = true;
    
    // Filtre par ville de départ ou destination
    if (depart) {
      const departMatch = covoiturage.trajet.depart.toLowerCase().includes(depart.toLowerCase()) ||
                         covoiturage.trajet.adresseDepart.toLowerCase().includes(depart.toLowerCase());
      if (!departMatch) match = false;
    }
    
    // Filtre par ville d'arrivée
    if (destination) {
      const destinationMatch = covoiturage.trajet.destination.toLowerCase().includes(destination.toLowerCase()) ||
                              covoiturage.trajet.adresseArrivee.toLowerCase().includes(destination.toLowerCase());
      if (!destinationMatch) match = false;
    }
    
    // Filtre par date
    if (date) {
      if (covoiturage.details.date !== date) match = false;
    }
    
    return match;
  });
}

// Fonction pour afficher le message d'accueil
function afficherMessageAccueil() {
  const resultsSection = document.getElementById('searchResults');
  if (resultsSection) {
    resultsSection.innerHTML = `
      <div class="text-center py-8 text-gray-500">
        <div class="text-4xl mb-3">🔍</div>
        <h3 class="text-lg font-semibold mb-2">Recherchez votre covoiturage</h3>
        <p class="text-sm mb-4">Remplissez le formulaire ci-dessus pour voir les itinéraires disponibles</p>
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
          <h4 class="text-blue-700 font-semibold mb-2">📋 Informations requises :</h4>
          <ul class="text-xs text-blue-600 text-left space-y-1">
            <li>• Ville de départ ou d'arrivée</li>
            <li>• Date de voyage souhaitée</li>
            <li>• Seuls les trajets avec places disponibles sont affichés</li>
          </ul>
        </div>
      </div>
    `;
  }
}

// Fonction pour réinitialiser la recherche
function resetRecherche() {
  // Vider tous les champs du formulaire
  const departInput = document.querySelector('input[name="depart"]');
  const destinationInput = document.querySelector('input[name="destination"]');
  const dateInput = document.querySelector('input[name="date"]');
  
  if (departInput) departInput.value = '';
  if (destinationInput) destinationInput.value = '';
  if (dateInput) dateInput.value = '';
  
  // Effacer les résultats
  const resultsSection = document.getElementById('searchResults');
  if (resultsSection) {
    resultsSection.innerHTML = `
      <div class="text-center py-8 text-gray-500">
        <div class="text-4xl mb-3">🔍</div>
        <h3 class="text-lg font-semibold mb-2">Prêt pour une nouvelle recherche</h3>
        <p class="text-sm">Remplissez les champs ci-dessus pour trouver un covoiturage</p>
      </div>
    `;
  }
  
  // Remettre le focus sur le premier champ
  if (departInput) {
    departInput.focus();
  }
  
  // Animation du bouton reset
  const resetButton = document.getElementById('resetButton');
  if (resetButton) {
    resetButton.style.transform = 'scale(0.95)';
    setTimeout(() => {
      resetButton.style.transform = 'scale(1)';
    }, 150);
  }
}

function afficherErreur(message) {
  const resultsSection = document.getElementById('searchResults');
  if (resultsSection) {
    resultsSection.innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div class="text-red-600 text-4xl mb-3">⚠️</div>
        <h3 class="text-red-700 font-bold text-lg mb-2">Erreur</h3>
        <p class="text-red-600 mb-4">${message}</p>
        <div class="mt-4 p-3 bg-blue-50 rounded-lg">
          <p class="text-blue-700 text-sm">
            <strong>💡 Conseil :</strong> Vérifiez votre connexion et réessayez !
          </p>
        </div>
      </div>
    `;
  }
}

function afficherResultats(covoiturages, container) {
  container.innerHTML = '';
  
  if (covoiturages.length === 0) {
    container.innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div class="text-red-600 text-4xl mb-3">🔍</div>
        <h3 class="text-red-700 font-bold text-lg mb-2">Aucun covoiturage trouvé</h3>
        <p class="text-red-600 mb-4">Modifiez votre date de voyage pour voir les prochains itinéraires disponibles</p>
        <div class="mt-4 p-3 bg-blue-50 rounded-lg">
          <p class="text-blue-700 text-sm">
            <strong>💡 Conseil :</strong> Essayez une autre date pour trouver des covoiturages disponibles !
          </p>
        </div>
      </div>
    `;
      return;
    }

  // Vérifier si c'est une date alternative proposée
  const criteres = {
    depart: document.querySelector('input[name="depart"]')?.value?.trim() || '',
    destination: document.querySelector('input[name="destination"]')?.value?.trim() || '',
    date: document.querySelector('input[name="date"]')?.value || ''
  };
  
  const dateOriginale = covoiturages[0].dateOriginale;
  if (dateOriginale && dateOriginale !== criteres.date) {
    container.innerHTML += `
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div class="flex items-center">
          <span class="text-yellow-600 text-2xl mr-3">📅</span>
          <div>
            <h4 class="text-yellow-700 font-semibold">Date alternative proposée</h4>
            <p class="text-yellow-600 text-sm">Aucun covoiturage trouvé pour le ${formaterDate(dateOriginale)}. Voici les itinéraires disponibles pour le ${formaterDate(criteres.date)} :</p>
          </div>
        </div>
      </div>
    `;
  }

  covoiturages.forEach(covoiturage => {
    // Mention écologique selon les spécifications
    const eco = covoiturage.details.vehicule.type === 'Électrique' ? '🌱 Voyage écologique' : '🚗 Voyage classique';

    container.innerHTML += `
      <div class="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow border-l-4 border-green-500">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          
          <!-- Informations conducteur -->
          <div class="flex items-center space-x-4 mb-4 lg:mb-0">
            <img src="${covoiturage.conducteur.photo}" alt="Photo du conducteur" class="w-16 h-16 rounded-full object-cover">
            <div>
              <h3 class="font-bold text-green-700 text-lg">${covoiturage.conducteur.nom}</h3>
              <p class="text-yellow-500 text-sm">${genererEtoiles(covoiturage.conducteur.note)} ${covoiturage.conducteur.note}</p>
            </div>
          </div>
          
          <!-- Informations du trajet -->
          <div class="flex-1 lg:mx-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div class="space-y-2">
                <p><strong>📍 Départ:</strong> ${covoiturage.trajet.depart}</p>
                <p><strong>🎯 Arrivée:</strong> ${covoiturage.trajet.destination}</p>
                <p><strong>📅 Date:</strong> ${formaterDate(covoiturage.details.date)}</p>
              </div>
              <div class="space-y-2">
                <p><strong>🕐 Départ:</strong> ${covoiturage.details.heureDepart}</p>
                <p><strong>🕐 Arrivée:</strong> ${covoiturage.details.heureArrivee}</p>
                <p><strong>👥 Places restantes:</strong> <span class="font-bold text-green-600">${covoiturage.details.placesDisponibles}</span></p>
              </div>
            </div>
            
            <!-- Prix et écologie -->
            <div class="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div class="flex items-center space-x-4">
                <p class="text-2xl font-bold text-green-600">${formaterPrix(covoiturage.details.prix)}</p>
                <span class="text-sm font-semibold ${covoiturage.details.vehicule.type === 'Électrique' ? 'text-green-600' : 'text-gray-600'}">${eco}</span>
              </div>
            </div>
          </div>
          
          <!-- Boutons Détail et Participer -->
          <div class="mt-4 lg:mt-0 flex flex-col space-y-2">
            <button onclick="voirDetails(${covoiturage.id})" 
                    class="w-full lg:w-auto bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors">
              Détail
            </button>
            <button onclick="participerCovoiturage(${covoiturage.id})" 
                    class="w-full lg:w-auto bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
              Participer
            </button>
          </div>
          
          </div>
        </div>
      `;
  });
}

// Fonction pour voir les détails d'un covoiturage
function voirDetails(id) {
  const covoiturage = covoiturageData.find(c => c.id === id);
  if (!covoiturage) return;

  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-green-700">Détails du covoiturage</h2>
        <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
      </div>
      
      <div class="space-y-4">
        <div class="flex items-center space-x-4">
          <img src="${covoiturage.conducteur.photo}" alt="Photo du conducteur" class="w-20 h-20 rounded-full">
          <div>
            <h3 class="font-bold text-lg">${covoiturage.conducteur.nom}</h3>
            <p class="text-yellow-500">${genererEtoiles(covoiturage.conducteur.note)} ${covoiturage.conducteur.note}</p>
            <p class="text-sm text-gray-600">📞 ${covoiturage.conducteur.telephone}</p>
            <p class="text-sm text-gray-600">📧 ${covoiturage.conducteur.email}</p>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <h4 class="font-semibold text-green-700">Trajet</h4>
            <p>📍 ${covoiturage.trajet.adresseDepart}</p>
            <p>🎯 ${covoiturage.trajet.adresseArrivee}</p>
            <p>📏 ${covoiturage.trajet.distance} • ⏱️ ${covoiturage.trajet.duree}</p>
          </div>
          <div>
            <h4 class="font-semibold text-green-700">Véhicule</h4>
            <p>🚗 ${covoiturage.details.vehicule.marque} ${covoiturage.details.vehicule.modele}</p>
            <p>🎨 ${covoiturage.details.vehicule.couleur} • ${covoiturage.details.vehicule.type}</p>
            <p>👥 ${covoiturage.details.vehicule.places} places</p>
          </div>
        </div>
        
        <div>
          <h4 class="font-semibold text-green-700">Options</h4>
          <div class="flex flex-wrap gap-2">
            ${covoiturage.details.options.climatisation ? '<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">❄️ Climatisation</span>' : ''}
            ${covoiturage.details.options.wifi ? '<span class="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">📶 WiFi</span>' : ''}
            ${covoiturage.details.options.animaux ? '<span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">🐕 Animaux</span>' : ''}
            ${covoiturage.details.options.bagages ? '<span class="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">🧳 Bagages</span>' : ''}
            ${covoiturage.details.options.musique ? '<span class="bg-pink-100 text-pink-800 px-2 py-1 rounded text-sm">🎵 Musique</span>' : ''}
            ${covoiturage.details.options.fumeur ? '<span class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">🚬 Fumeur</span>' : ''}
          </div>
        </div>
        
        ${covoiturage.commentaires && covoiturage.commentaires.length > 0 ? `
          <div>
            <h4 class="font-semibold text-green-700">Avis des passagers</h4>
            <div class="space-y-2">
              ${covoiturage.commentaires.map(comment => `
                <div class="bg-gray-50 p-3 rounded">
                  <div class="flex justify-between items-start">
                    <div>
                      <p class="font-semibold">${comment.passager}</p>
                      <p class="text-yellow-500">${genererEtoiles(comment.note)} ${comment.note}/5</p>
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
    </div>
  `;
  
  document.body.appendChild(modal);
}

// Fonction pour participer à un covoiturage
function participerCovoiturage(id) {
  // Vérifier si l'utilisateur est connecté
  if (!userManager.isLoggedIn()) {
    const confirmer = confirm('Vous devez être connecté pour participer à un covoiturage.\n\nVoulez-vous vous connecter ?');
    if (confirmer) {
      window.location.href = 'login.html';
    }
    return;
  }

  const covoiturage = covoiturageData.find(c => c.id === id);
  if (!covoiturage) {
    alert('Covoiturage introuvable');
    return;
  }

  const user = userManager.getCurrentUser();
  
  // Vérifier les crédits
  if (user.credits < covoiturage.details.prix) {
    alert(`Crédits insuffisants. Vous avez ${user.credits} crédits, il en faut ${covoiturage.details.prix}.`);
    return;
  }
  
  // Double confirmation
  const confirmation1 = confirm(
    `Confirmez-vous votre participation à ce covoiturage ?\n\n` +
    `Trajet: ${covoiturage.trajet.depart} → ${covoiturage.trajet.destination}\n` +
    `Prix: ${covoiturage.details.prix} crédits\n\n` +
    `Cette action est définitive.`
  );

  if (!confirmation1) return;

  const confirmation2 = confirm(
    `Dernière confirmation :\n\n` +
    `Êtes-vous sûr de vouloir participer à ce voyage ?\n\n` +
    `Les crédits seront déduits automatiquement.`
  );

  if (!confirmation2) return;

  try {
    // Déduire les crédits
    userManager.deductCredits(user.id, covoiturage.details.prix);
    
    // Ajouter le voyage à l'historique
    const tripRecord = {
      id: id,
      type: 'passager',
      depart: covoiturage.trajet.depart,
      destination: covoiturage.trajet.destination,
      date: covoiturage.details.date,
      heureDepart: covoiturage.details.heureDepart,
      prix: covoiturage.details.prix,
      conducteur: covoiturage.conducteur.nom,
      statut: 'confirmé',
      dateCreation: new Date().toISOString().split('T')[0]
    };
    
    user.trips = user.trips || [];
    user.trips.push(tripRecord);
    userManager.updateUserProfile(user.id, { trips: user.trips });
    
    alert(
      `✅ Participation confirmée !\n\n` +
      `Conducteur: ${covoiturage.conducteur.nom}\n` +
      `Email: ${covoiturage.conducteur.email}\n` +
      `Téléphone: ${covoiturage.conducteur.telephone}\n\n` +
      `Crédits restants: ${user.credits - covoiturage.details.prix}`
    );
    
    // Recharger les résultats pour mettre à jour l'affichage
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
      searchForm.dispatchEvent(new Event('submit'));
    }

  } catch (error) {
    alert(`❌ Erreur: ${error.message}`);
    console.error('Erreur participation:', error);
  }
}

// Fonctions utilitaires
function formaterDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formaterPrix(prix) {
  return `${prix} crédits`;
}

function genererEtoiles(note) {
  const etoilesPleines = Math.floor(note);
  const etoileDemi = note % 1 >= 0.5 ? 1 : 0;
  const etoilesVides = 5 - etoilesPleines - etoileDemi;
  
  return '⭐'.repeat(etoilesPleines) + 
         (etoileDemi ? '✨' : '') + 
         '☆'.repeat(etoilesVides);
}

// Fonction de déconnexion
function logout() {
  if (confirm('Voulez-vous vous déconnecter ?')) {
    userManager.logout();
    window.location.href = 'home.html';
  }
}

// Exporter la fonction logout pour qu'elle soit accessible partout
window.logout = logout;

