// Gestionnaire de covoiturages
class TripManager {
  constructor() {
    this.covoiturages = this.loadTrips();
  }

  // Charger les covoiturages depuis le localStorage
  loadTrips() {
    const trips = localStorage.getItem('ecoride_trips');
    if (trips) {
      return JSON.parse(trips);
    }
    return [];
  }

  // Sauvegarder les covoiturages
  saveTrips() {
    localStorage.setItem('ecoride_trips', JSON.stringify(this.covoiturages));
  }

  // Ajouter un covoiturage
  addTrip(trip) {
    this.covoiturages.push(trip);
    this.saveTrips();
  }

  // Obtenir tous les covoiturages
  getAllTrips() {
    return this.covoiturages;
  }

  // Obtenir les covoiturages d'un utilisateur
  getUserTrips(userId) {
    return this.covoiturages.filter(trip => trip.conducteurId === userId);
  }

  // Créer un covoiturage depuis un voyage du dashboard
  createTripFromUserTrip(userTrip, user) {
    const trip = {
      id: Date.now(),
      conducteur: {
        nom: user.pseudo,
        photo: user.photo || 'images/dupont.jpeg',
        note: 5.0,
        telephone: user.telephone || '',
        email: user.email
      },
      conducteurId: user.id,
      trajet: {
        depart: userTrip.depart,
        destination: userTrip.destination,
        adresseDepart: userTrip.depart,
        adresseArrivee: userTrip.destination,
        distance: '0 km',
        duree: '0h'
      },
      details: {
        date: userTrip.date,
        heureDepart: userTrip.heureDepart,
        heureArrivee: userTrip.heureArrivee || '',
        placesDisponibles: userTrip.vehicle?.places - 1 || 1,
        prix: userTrip.prix,
        vehicule: {
          marque: userTrip.vehicle?.marque || 'Inconnu',
          modele: userTrip.vehicle?.modele || 'Inconnu',
          type: userTrip.vehicle?.type || 'Essence',
          couleur: userTrip.vehicle?.couleur || 'Inconnu',
          places: userTrip.vehicle?.places || 5
        },
        options: {
          climatisation: true,
          musique: true,
          wifi: false,
          bagages: true,
          animaux: false,
          fumeur: false
        }
      },
      commentaires: []
    };

    this.addTrip(trip);
    return trip;
  }

  // Synchroniser les covoiturages des utilisateurs
  syncUserTrips() {
    const users = userManager.users;
    
    users.forEach(user => {
      if (user.trips) {
        user.trips.forEach(trip => {
          // Vérifier si c'est un voyage en tant que chauffeur
          if (trip.type === 'chauffeur') {
            // Vérifier si ce covoiturage existe déjà
            const existingTrip = this.covoiturages.find(t => 
              t.conducteurId === user.id && 
              t.trajet.depart === trip.depart &&
              t.trajet.destination === trip.destination &&
              t.details.date === trip.date
            );

            if (!existingTrip) {
              // Créer le covoiturage
              this.createTripFromUserTrip(trip, user);
            }
          }
        });
      }
    });
  }
}

// Instance globale du gestionnaire de covoiturages
const tripManager = new TripManager();

// Exporter si on utilise des modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TripManager, tripManager };
}
