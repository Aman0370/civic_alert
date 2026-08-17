// Severity determines how wide an alert radius gets pushed once a report is verified.
const SEVERITY_RADIUS_KM = {
  low: 0.5,
  medium: 1,
  high: 2,
  critical: 5,
};

const SEVERITY_EXPIRY_HOURS = {
  low: 6,
  medium: 12,
  high: 24,
  critical: 48,
};

function radiusForSeverity(severity) {
  return SEVERITY_RADIUS_KM[severity] ?? 1;
}

function expiryForSeverity(severity) {
  const hours = SEVERITY_EXPIRY_HOURS[severity] ?? 12;
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

// Haversine formula: great-circle distance between two lat/lng points, in km.
function distanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function isWithinRadius(centerLat, centerLng, pointLat, pointLng, radiusKm) {
  return distanceKm(centerLat, centerLng, pointLat, pointLng) <= radiusKm;
}

module.exports = {
  SEVERITY_RADIUS_KM,
  radiusForSeverity,
  expiryForSeverity,
  distanceKm,
  isWithinRadius,
};
