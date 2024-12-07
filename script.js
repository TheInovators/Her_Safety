    // Initialize the map
    const map = L.map('safety-map').setView([28.6139, 77.2090], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    // Sample safety zones
  const safeZones = [
    { coord: [28.6139, 77.2090], radius: 1000, risk: 'safe' },
    { coord: [28.6239, 77.2190], radius: 800, risk: 'moderate' },
    { coord: [28.6039, 77.1990], radius: 600, risk: 'caution' }
];

safeZones.forEach(zone => {
    const color = zone.risk === 'safe' ? '#4CAF50' : 
                 zone.risk === 'moderate' ? '#FFC107' : '#f44336';
    
    L.circle(zone.coord, {
        radius: zone.radius,
        color: color,
        fillColor: color,
        fillOpacity: 0.2
    }).addTo(map);
});