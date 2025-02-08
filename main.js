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
  
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      const userLocation = { latitude, longitude };
  
      // Initialisation de la carte avec Leaflet
      const map = L.map('map').setView([latitude, longitude], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
  
      // Marqueur violet pour l'utilisateur
      const violetIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
      });
      const userMarker = L.marker([latitude, longitude], { icon: violetIcon }).addTo(map);
      userMarker.bindPopup("Vous êtes ici");
  
      // Génération de 5 POI aléatoires autour de l'utilisateur (entre 10 et 200 m)
      let pois = [];
      for (let i = 0; i < 5; i++) {
        const distance = Math.random() * (200 - 10) + 10;
        const angle = Math.random() * 2 * Math.PI;
        const dLat = (distance * Math.cos(angle)) / 111000;
        const dLon = (distance * Math.sin(angle)) / (111000 * Math.cos(latitude * Math.PI / 180));
        pois.push({
          id: i,
          latitude: latitude + dLat,
          longitude: longitude + dLon
        });
      }
  
      // Marqueurs rouges pour les POI
      const redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
      });
      pois.forEach((poi) => {
        const marker = L.marker([poi.latitude, poi.longitude], { icon: redIcon }).addTo(map);
        marker.bindPopup("POI " + poi.id);
      });
  
      // Simulation : Déplacement de l'utilisateur vers le POI le plus proche
      let simulationRunning = true;
      const intervalId = setInterval(() => {
        if (!simulationRunning) return;
        let nearestPOI = null;
        let minDistance = Infinity;
        pois.forEach(poi => {
          const dist = getDistance(userLocation, poi);
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
          window.location.href = "ar.html";
          return;
        }
        const speed = 11.11; // m/s, environ 40 km/h
        const fraction = speed / minDistance;
        userLocation.latitude += (nearestPOI.latitude - userLocation.latitude) * fraction;
        userLocation.longitude += (nearestPOI.longitude - userLocation.longitude) * fraction;
        userMarker.setLatLng([userLocation.latitude, userLocation.longitude]);
        map.setView([userLocation.latitude, userLocation.longitude]);
      }, 1000);
  
    }, (error) => {
      alert("Erreur de géolocalisation: " + error.message);
    });
  } else {
    alert("La géolocalisation n'est pas supportée par ce navigateur.");
  }
  