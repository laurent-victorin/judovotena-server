// services/googleMapsRoutesService.js
const axios = require("axios");

function parseGoogleDurationToSeconds(value) {
  // Ex: "5421s"
  if (!value) return 0;
  const match = String(value).match(/^(\d+(?:\.\d+)?)s$/);
  return match ? Math.round(Number(match[1])) : 0;
}

function formatDurationFr(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.round((totalSeconds % 3600) / 60);

  if (h > 0) return `${h}h${String(m).padStart(2, "0")}`;
  return `${m} min`;
}

async function computeDrivingDistance({ originAddress, destinationAddress }) {
  if (!originAddress || !destinationAddress) {
    throw new Error("Adresse de départ et d’arrivée requises.");
  }

  console.log("GOOGLE_MAPS_API_KEY exists:", !!process.env.GOOGLE_MAPS_API_KEY);
  console.log(
    "GOOGLE_MAPS_API_KEY preview:",
    process.env.GOOGLE_MAPS_API_KEY
      ? `${process.env.GOOGLE_MAPS_API_KEY.slice(0, 6)}...${process.env.GOOGLE_MAPS_API_KEY.slice(-4)}`
      : "MISSING",
  );

  const { data } = await axios.post(
    "https://routes.googleapis.com/directions/v2:computeRoutes",
    {
      origin: { address: originAddress },
      destination: { address: destinationAddress },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_UNAWARE",
      computeAlternativeRoutes: false,
      languageCode: "fr-FR",
      units: "METRIC",
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
      },
      timeout: 15000,
    },
  );

  const route = data?.routes?.[0];
  if (!route?.distanceMeters) {
    throw new Error("Impossible de calculer la distance.");
  }

  const distanceMeters = Number(route.distanceMeters || 0);
  const distanceKm = Number((distanceMeters / 1000).toFixed(1));
  const durationSeconds = parseGoogleDurationToSeconds(route.duration);

  return {
    distance_meters: distanceMeters,
    distance_km: distanceKm, // aller simple
    duration_seconds: durationSeconds,
    duration_text: formatDurationFr(durationSeconds),
  };
}

module.exports = { computeDrivingDistance };
