// Base de données des covoiturages
class CovoiturageDB {
  constructor() {
    this.covoiturages = [];
    this.loadData();
  }

  // Charger les données depuis le fichier JSON
  async loadData() {
    try {
      const response = await fetch('data/covoiturages.json');
      const data = await response.json();
      this.covoiturages = data.covoiturages;
      console.log('Base de données chargée:', this.covoiturages.length, 'covoiturages');
    } catch (error) {
      console.error('Erreur lors du chargement de la base de données:', error);
      // Données de fallback
      this.covoiturages = this.getFallbackData();
    }
  }

  // Données de secours si le fichier JSON ne peut pas être chargé
  getFallbackData() {
    return [
      {
        id: 1,
        conducteur: {
          nom: "Jean Dupont",
          photo: "images/dupont.jpeg",
          note: 4.8,
          telephone: "06 12 34 56 78",
          email: "jean.dupont@email.com"
        },
        trajet: {
          depart: "Paris",
          destination: "Lyon",
          adresseDepart: "Gare de Lyon, Paris",
          adresseArrivee: "Gare de Lyon-Perrache, Lyon",
          distance: "463 km",
          duree: "4h30"
        },
        details: {
          date: "2025-10-20",
          heureDepart: "09:00",
          heureArrivee: "13:30",
          placesDisponibles: 3,
          prix: 15,
          vehicule: {
            marque: "Renault",
            modele: "Zoe",
            type: "Électrique",
            couleur: "Blanc",
            places: 5
          },
          options: {
            climatisation: true,
            musique: true,
            wifi: false,
            bagages: true,
            animaux: false,
            fumeur: false
          }
        }
      }
    ];
  }

  // Rechercher des covoiturages selon les critères (ville + date uniquement)
  rechercherCovoiturages(criteres) {
    let resultats = this.covoiturages.filter(covoiturage => {
      // Vérifier qu'il y a des places disponibles (OBLIGATOIRE)
      if (covoiturage.details.placesDisponibles <= 0) {
        return false;
      }

      // Recherche basée sur ville + date uniquement
      let matchVille = false;
      let matchDate = false;

      // Vérifier la correspondance de ville (départ OU destination)
      if (criteres.depart && criteres.depart.trim() !== '') {
        const villeRecherche = criteres.depart.toLowerCase().trim();
        const departCovoiturage = covoiturage.trajet.depart.toLowerCase();
        const destinationCovoiturage = covoiturage.trajet.destination.toLowerCase();
        
        matchVille = departCovoiturage.includes(villeRecherche) || 
                    villeRecherche.includes(departCovoiturage) ||
                    destinationCovoiturage.includes(villeRecherche) ||
                    villeRecherche.includes(destinationCovoiturage);
      }

      // Vérifier la correspondance de date
      if (criteres.date && criteres.date.trim() !== '') {
        matchDate = covoiturage.details.date === criteres.date;
      }

      // Retourner true si ville ET date correspondent
      return matchVille && matchDate;
    });

    // Si aucun résultat pour la date demandée, proposer la date la plus proche
    if (resultats.length === 0 && criteres.date) {
      const datePlusProche = this.trouverDatePlusProche(criteres);
      if (datePlusProche) {
        return this.rechercherCovoiturages({
          depart: criteres.depart,
          destination: criteres.destination,
          date: datePlusProche,
          dateOriginale: criteres.date
        });
      }
    }

    // Trier par prix croissant
    resultats.sort((a, b) => a.details.prix - b.details.prix);

    return resultats;
  }

  // Trouver la date la plus proche avec des covoiturages disponibles
  trouverDatePlusProche(criteres) {
    if (!criteres.depart || criteres.depart.trim() === '') return null;

    const villeRecherche = criteres.depart.toLowerCase().trim();
    const dateOriginale = new Date(criteres.date);
    
    // Trouver tous les covoiturages pour cette ville (toutes dates)
    const covoituragesVille = this.covoiturages.filter(covoiturage => {
      if (covoiturage.details.placesDisponibles <= 0) return false;
      
      const departCovoiturage = covoiturage.trajet.depart.toLowerCase();
      const destinationCovoiturage = covoiturage.trajet.destination.toLowerCase();
      
      return departCovoiturage.includes(villeRecherche) || 
             villeRecherche.includes(departCovoiturage) ||
             destinationCovoiturage.includes(villeRecherche) ||
             villeRecherche.includes(destinationCovoiturage);
    });

    if (covoituragesVille.length === 0) return null;

    // Trier par proximité de date
    covoituragesVille.sort((a, b) => {
      const dateA = new Date(a.details.date);
      const dateB = new Date(b.details.date);
      const diffA = Math.abs(dateA - dateOriginale);
      const diffB = Math.abs(dateB - dateOriginale);
      return diffA - diffB;
    });

    return covoituragesVille[0].details.date;
  }


  // Obtenir un covoiturage par son ID
  getCovoiturageById(id) {
    return this.covoiturages.find(covoiturage => covoiturage.id === id);
  }

  // Réserver une place dans un covoiturage
  reserverPlace(idCovoiturage, passager) {
    const covoiturage = this.getCovoiturageById(idCovoiturage);
    
    if (!covoiturage) {
      throw new Error('Covoiturage introuvable');
    }

    if (covoiturage.details.placesDisponibles <= 0) {
      throw new Error('Aucune place disponible');
    }

    // Décrémenter le nombre de places disponibles
    covoiturage.details.placesDisponibles--;

    // Ajouter le passager à la liste des réservations
    if (!covoiturage.reservations) {
      covoiturage.reservations = [];
    }
    
    covoiturage.reservations.push({
      passager: passager,
      dateReservation: new Date().toISOString().split('T')[0],
      statut: 'confirmée'
    });

    return {
      success: true,
      message: 'Réservation confirmée !',
      covoiturage: covoiturage
    };
  }

  // Obtenir les statistiques
  getStatistiques() {
    const total = this.covoiturages.length;
    const avecPlaces = this.covoiturages.filter(c => c.details.placesDisponibles > 0).length;
    const electriques = this.covoiturages.filter(c => c.details.vehicule.type === 'Électrique').length;
    const prixMoyen = this.covoiturages.reduce((sum, c) => sum + c.details.prix, 0) / total;

    return {
      totalCovoiturages: total,
      covoituragesDisponibles: avecPlaces,
      vehiculesElectriques: electriques,
      prixMoyen: Math.round(prixMoyen * 100) / 100
    };
  }

  // Obtenir les villes disponibles
  getVillesDisponibles() {
    const villes = new Set();
    this.covoiturages.forEach(covoiturage => {
      villes.add(covoiturage.trajet.depart);
      villes.add(covoiturage.trajet.destination);
    });
    return Array.from(villes).sort();
  }

  // Sauvegarder les données (pour les modifications en temps réel)
  saveData() {
    // Cette méthode sera utilisée pour sauvegarder les modifications
    // Dans une vraie application, ceci ferait un appel API
    console.log('Données sauvegardées');
  }
}

// Instance globale de la base de données
const covoiturageDB = new CovoiturageDB();

// Fonctions utilitaires pour l'affichage
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
  return `${prix}€`;
}

function genererEtoiles(note) {
  const etoilesPleines = Math.floor(note);
  const etoilesVides = 5 - etoilesPleines;
  const demiEtoile = note % 1 >= 0.5 ? 1 : 0;
  
  let html = '';
  for (let i = 0; i < etoilesPleines; i++) {
    html += '⭐';
  }
  if (demiEtoile) {
    html += '✨';
  }
  for (let i = 0; i < etoilesVides - demiEtoile; i++) {
    html += '☆';
  }
  return html;
}

// Export pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CovoiturageDB, covoiturageDB };
}
