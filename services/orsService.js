const axios = require("axios");

const ORS_API_KEY = process.env.ORS_API_KEY;

function assertApiKey() {
  if (!ORS_API_KEY) {
    throw new Error("ORS_API_KEY manquante côté serveur.");
  }
}

function formatDurationFr(seconds) {
  const total = Math.max(0, Math.round(Number(seconds || 0)));
  const h = Math.floor(total / 3600);
  const m = Math.round((total % 3600) / 60);

  if (h > 0) return `${h}h${String(m).padStart(2, "0")}`;
  return `${m} min`;
}

async function geocodeAddress(address) {
  assertApiKey();

  const text = String(address || "").trim();
  if (!text) {
    throw new Error("Adresse vide pour le géocodage.");
  }

  const { data } = await axios.get(
    "https://api.openrouteservice.org/geocode/search",
    {
      params: {
        api_key: ORS_API_KEY,
        text,
        size: 1,
        "boundary.country": "FR",
      },
      timeout: 15000,
    }
  );

  const feature = data?.features?.[0];
  const coords = feature?.geometry?.coordinates;

  if (!Array.isArray(coords) || coords.length < 2) {
    throw new Error(`Adresse introuvable : ${text}`);
  }

  return {
    lon: Number(coords[0]),
    lat: Number(coords[1]),
    label: feature?.properties?.label || text,
  };
}

async function computeDrivingDistance({ originAddress, destinationAddress }) {
  assertApiKey();

  const origin = await geocodeAddress(originAddress);
  const destination = await geocodeAddress(destinationAddress);

  const { data } = await axios.post(
    "https://api.openrouteservice.org/v2/directions/driving-car",
    {
      coordinates: [
        [origin.lon, origin.lat],
        [destination.lon, destination.lat],
      ],
      instructions: false,
    },
    {
      headers: {
        Authorization: ORS_API_KEY,
        "Content-Type": "application/json",
      },
      timeout: 20000,
    }
  );

  const summary = data?.routes?.[0]?.summary;

  if (!summary || typeof summary.distance !== "number") {
    throw new Error("Impossible de calculer l’itinéraire.");
  }

  const distanceMeters = Number(summary.distance || 0);
  const durationSeconds = Number(summary.duration || 0);

  return {
    origin,
    destination,
    distance_meters: distanceMeters,
    distance_km: Number((distanceMeters / 1000).toFixed(1)),
    duration_seconds: Math.round(durationSeconds),
    duration_text: formatDurationFr(durationSeconds),
  };
}

module.exports = {
  computeDrivingDistance,
};