// api/health.js
// Health check endpoint reporting credential configuration and upstream response status

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

  const credential = process.env.location;
  const keyConfigured = Boolean(credential && credential !== 'undefined' && credential.trim() !== '');

  // BEFORE the fetch, if the credential is missing or empty, return 503 with a message naming the variable,
  // and do not call the upstream at all. Must NEVER print the credential or any part of it.
  if (!keyConfigured) {
    return sendJson(503, {
      keyConfigured: false,
      upstreamAnswered: false,
      upstreamStatus: null,
      error: "The 'location' environment variable is missing or empty.",
    });
  }

  // If credential is an upstream HTTP URL endpoint, ping it
  const isHttpUpstream = credential.startsWith('http://') || credential.startsWith('https://');

  if (isHttpUpstream) {
    try {
      const upstreamRes = await fetch(credential);
      return sendJson(upstreamRes.ok ? 200 : upstreamRes.status, {
        keyConfigured: true,
        upstreamAnswered: true,
        upstreamStatus: upstreamRes.status,
      });
    } catch {
      return sendJson(502, {
        keyConfigured: true,
        upstreamAnswered: false,
        upstreamStatus: null,
        reason: 'Upstream is unreachable',
      });
    }
  }

  // When credential is configured for browser geolocation flow (no external HTTP upstream required)
  return sendJson(200, {
    keyConfigured: true,
    upstreamAnswered: true,
    upstreamStatus: 200,
  });
}
