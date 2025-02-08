// main.js

// Fonction pour calculer la distance entre deux points (formule de Haversine)
function getDistance(loc1, loc2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371000; // Rayon de la Terre en mètres
    const dLat = toRad(loc2.latitude - loc1.latitude);
    const dLon = toRad(loc2.longitude - loc1.longitude);
    const lat1 = toRad(loc1.latitude);
    const lat2 = toRad(loc2.latitude);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  // Initialisation de la carte après obtention de la géolocalisation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      const initialLocation = { latitude, longitude };
  
      // Créer la carte centrée sur la position de l'utilisateur
      const map = L.map('map').setView([latitude, longitude], 15);
  
      // Charger les tuiles de la carte (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
  
      // Ajouter un marqueur violet pour l'utilisateur
      const userMarker = L.marker([latitude, longitude], {
        icon: L.icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
        }),
        riseOnHover: true
      }).addTo(map);
      userMarker.bindPopup("Vous êtes ici");
  
      // Générer 5 POI aléatoires autour de l'utilisateur (10 à 200 m)
      let pois = [];
      for (let i = 0; i < 5; i++) {
        const distance = Math.random() * (200 - 10) + 10; // en mètres
        const angle = Math.random() * 2 * Math.PI;
        const dLat = (distance * Math.cos(angle)) / 111000;
        const dLon = (distance * Math.sin(angle)) / (111000 * Math.cos(latitude * Math.PI / 180));
        pois.push({
          id: i,
          latitude: latitude + dLat,
          longitude: longitude + dLon
        });
      }
  
      // Ajouter des marqueurs rouges pour les POI
      const poiMarkers = pois.map(poi => {
        const marker = L.marker([poi.latitude, poi.longitude], { icon: L.icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-red.png', // Vous pouvez utiliser une URL d'icône rouge personnalisée
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
        }) }).addTo(map);
        marker.bindPopup("POI " + poi.id);
        return marker;
      });
  
      // Simulation de déplacement vers le POI le plus proche
      let simulationRunning = true;
      const intervalId = setInterval(() => {
        if (!simulationRunning) return;
        let nearestPOI = null;
        let minDistance = Infinity;
        pois.forEach(poi => {
          const dist = getDistance(initialLocation, poi);
          if (dist < minDistance) {
            minDistance = dist;
            nearestPOI = poi;
          }
        });
        if (!nearestPOI) return;
        // Si la distance est inférieure à 5 m, arrêter la simulation et rediriger vers la page AR
        if (minDistance < 5) {
          clearInterval(intervalId);
          simulationRunning = false;
          // Rediriger vers la page AR
          window.location.href = "ar.html";
          return;
        }
        // Simuler le déplacement : on déplace la position de l'utilisateur vers le POI
        const speed = 11.11; // m/s (environ 40 km/h)
        const fraction = speed / minDistance;
        initialLocation.latitude += (nearestPOI.latitude - initialLocation.latitude) * fraction;
        initialLocation.longitude += (nearestPOI.longitude - initialLocation.longitude) * fraction;
        // Mettre à jour le marqueur de l'utilisateur
        userMarker.setLatLng([initialLocation.latitude, initialLocation.longitude]);
        // Recentrer la carte sur la nouvelle position
        map.setView([initialLocation.latitude, initialLocation.longitude]);
      }, 1000);
  
    }, error => {
      alert("Erreur de géolocalisation : " + error.message);
    });
  } else {
    alert("La géolocalisation n'est pas supportée par ce navigateur.");
  }
  