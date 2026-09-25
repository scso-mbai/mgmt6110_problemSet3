// api/location.js
// Serverless function returning location data for the browser Geolocation API flow

// Known Singapore reference areas
const SINGAPORE_AREAS = [
  { name: 'Woodlands', lat: 1.4382, lon: 103.7890 },
  { name: 'Woodlands South', lat: 1.4273, lon: 103.7933 },
  { name: 'City Hall', lat: 1.2931, lon: 103.8521 },
  { name: 'Orchard', lat: 1.3040, lon: 103.8318 },
  { name: 'Novena', lat: 1.3204, lon: 103.8438 },
  { name: 'Bishan', lat: 1.3508, lon: 103.8481 },
  { name: 'Stevens', lat: 1.3200, lon: 103.8260 },
  { name: 'Serangoon', lat: 1.3498, lon: 103.8738 },
  { name: 'Bright Hill', lat: 1.3632, lon: 103.8333 },
  { name: 'Toa Payoh', lat: 1.3327, lon: 103.8476 },
  { name: 'Bugis', lat: 1.3005, lon: 103.8561 },
  { name: 'Promenade', lat: 1.2934, lon: 103.8604 },
  { name: 'Gardens by the Bay', lat: 1.2816, lon: 103.8636 },
  { name: 'MacPherson', lat: 1.3262, lon: 103.8897 },
  { name: 'Marymount', lat: 1.3487, lon: 103.8394 },
];

function findNearestArea(lat, lon) {
  let nearest = SINGAPORE_AREAS[0];
  let minDistanceSq = Infinity;

  for (const area of SINGAPORE_AREAS) {
    const dLat = area.lat - lat;
    const dLon = area.lon - lon;
    const distSq = dLat * dLat + dLon * dLon;
    if (distSq < minDistanceSq) {
      minDistanceSq = distSq;
      nearest = area;
    }
  }
  return nearest.name;
}

export default async function handler(req, res) {
  // Cache the response for 5 to 60 seconds with Cache-Control: s-maxage=[N], stale-while-revalidate=[2N]
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  // Helper for consistent JSON response across Vercel and Node environments
  const sendJson = (statusCode, data) => {
    if (typeof res.status === 'function' && typeof res.json === 'function') {
      return res.status(statusCode).json(data);
    }
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  // BEFORE the fetch, if the credential is missing or empty, check if query coordinates were supplied.
  // If coordinates are supplied, resolve nearest area; otherwise return 503 naming the variable.
  const urlObj = new URL(req.url || '/', 'http://localhost');
  const latParam = urlObj.searchParams.get('lat') || (req.body && req.body.lat);
  const lonParam = urlObj.searchParams.get('lon') || (req.body && req.body.lon);

  const credential = process.env.location;
  if (!credential || credential === 'undefined' || credential.trim() === '') {
    if (latParam !== null && lonParam !== null) {
      const lat = parseFloat(latParam);
      const lon = parseFloat(lonParam);
      if (!isNaN(lat) && !isNaN(lon)) {
        const nearestArea = findNearestArea(lat, lon);
        return sendJson(200, {
          area: nearestArea,
        });
      }
    }

    return sendJson(503, {
      error: "The 'location' environment variable is missing or empty.",
      upstreamStatus: null,
    });
  }

  // If credential is an upstream HTTP URL endpoint, call it
  const isHttpUpstream = credential.startsWith('http://') || credential.startsWith('https://');

  if (isHttpUpstream) {
    let upstreamResponse;
    try {
      upstreamResponse = await fetch(credential);
    } catch (err) {
      return sendJson(502, {
        error: 'Upstream is unreachable',
        upstreamStatus: null,
        reason: err?.message || 'Failed to reach upstream location service',
      });
    }

    // AFTER the fetch, check response.ok before reading the body
    if (!upstreamResponse.ok) {
      let reason = `Upstream returned status ${upstreamResponse.status}`;
      try {
        const text = await upstreamResponse.text();
        if (text && text.trim()) {
          try {
            const parsed = JSON.parse(text);
            reason = parsed.reason || parsed.message || parsed.error || text.slice(0, 100);
          } catch {
            reason = text.slice(0, 100);
          }
        }
      } catch {
        // Empty body
      }

      return sendJson(upstreamResponse.status, {
        upstreamStatus: upstreamResponse.status,
        reason,
      });
    }

    let rawText = '';
    try {
      rawText = await upstreamResponse.text();
    } catch {
      return sendJson(502, {
        error: 'Invalid response from upstream',
        upstreamStatus: upstreamResponse.status,
        reason: 'Failed to read upstream response',
      });
    }

    let area = '';
    const match = rawText.match(/Your Base:\s*([^\r\n]+)/i);
    if (match && match[1]) {
      area = match[1].trim();
    } else {
      try {
        const parsed = JSON.parse(rawText);
        area = parsed.area || parsed.name || parsed.location || '';
      } catch {
        area = rawText.trim().slice(0, 50);
      }
    }

    if (!area) {
      return sendJson(200, {
        area: null,
      });
    }

    // Returns only the fields my screen needs, and nothing else
    return sendJson(200, {
      area,
    });
  }

  // When credential is configured and browser provided coordinates via navigator.geolocation
  if (latParam !== null && lonParam !== null) {
    const lat = parseFloat(latParam);
    const lon = parseFloat(lonParam);
    if (!isNaN(lat) && !isNaN(lon)) {
      const nearestArea = findNearestArea(lat, lon);
      return sendJson(200, {
        area: nearestArea,
      });
    }
  }

  // Fallback to configured credential area if it matches a known area or name
  const trimmed = credential.trim();
  const matched = SINGAPORE_AREAS.find(
    (a) => a.name.toLowerCase() === trimmed.toLowerCase()
  );

  const finalArea = matched ? matched.name : trimmed;

  // Returns only the fields my screen needs, and nothing else
  return sendJson(200, {
    area: finalArea || null,
  });
}
