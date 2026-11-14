const tokenUrl = 'https://oauth2.googleapis.com/token';
const sheetsScope = 'https://www.googleapis.com/auth/spreadsheets';
const signingAlgorithm = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' };
const eventTypes = new Set(['page_view', 'case_study_open', 'contact_click']);
const pagePattern = /^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)?\.html)?$/;
const hostnamePattern = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z][a-z0-9-]{0,62}$/i;
const maxBodyBytes = 2048;
const encoder = new TextEncoder();
const timestampFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Toronto',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
  timeZoneName: 'short',
});
let cachedToken;

function formatTimestamp(date) {
  const parts = Object.fromEntries(
    timestampFormat.formatToParts(date).map(({ type, value }) => [type, value]),
  );
  const { month, day, year, hour, minute, second, dayPeriod, timeZoneName } = parts;
  return `${month} ${day}, ${year} at ${hour}:${minute}:${second} ${dayPeriod} ${timeZoneName}`;
}

function encodeBase64Url(bytes) {
  return btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');
}

async function getGoogleToken(serviceAccountJson) {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken?.credentials === serviceAccountJson && cachedToken.expiresAt > now + 60) {
    return cachedToken.value;
  }

  const { client_email: email, private_key: privateKey } = JSON.parse(serviceAccountJson);
  const keyData = privateKey.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '');
  const keyBytes = Uint8Array.from(atob(keyData), (character) => character.charCodeAt(0));
  const key = await crypto.subtle.importKey('pkcs8', keyBytes, signingAlgorithm, false, ['sign']);

  // Google exchanges this signed assertion for a short-lived access token.
  const header = encodeBase64Url(encoder.encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const claims = encodeBase64Url(encoder.encode(JSON.stringify({
    iss: email,
    scope: sheetsScope,
    aud: tokenUrl,
    iat: now,
    exp: now + 3600,
  })));
  const unsignedAssertion = `${header}.${claims}`;
  const signature = await crypto.subtle.sign(signingAlgorithm, key, encoder.encode(unsignedAssertion));
  const assertion = `${unsignedAssertion}.${encodeBase64Url(new Uint8Array(signature))}`;
  const response = await fetch(tokenUrl, {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!response.ok) throw new Error(`Google token exchange returned HTTP ${response.status}.`);
  const { access_token: value, expires_in: lifetime } = await response.json();
  if (!value) throw new Error('Google did not return an access token.');

  cachedToken = { credentials: serviceAccountJson, value, expiresAt: now + Number(lifetime) };
  return value;
}

async function readEvent(request) {
  if (!request.body) return null;

  // Bound the body even when the sender omits Content-Length.
  const reader = request.body.getReader();
  const bytes = new Uint8Array(maxBodyBytes);
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (length + value.length > maxBodyBytes) {
      await reader.cancel();
      return null;
    }
    bytes.set(value, length);
    length += value.length;
  }

  const data = JSON.parse(new TextDecoder().decode(bytes.subarray(0, length)));
  if (!data || !eventTypes.has(data.event)) return null;
  if (typeof data.page !== 'string' || data.page.length > 150 || !pagePattern.test(data.page)) return null;

  const page = data.page === '/index.html' ? '/' : data.page;
  const isCaseStudy = page.startsWith('/case-studies/');
  if (data.event !== 'contact_click' && isCaseStudy !== (data.event === 'case_study_open')) return null;

  const referringSite = typeof data.referringSite === 'string' && data.referringSite.length <= 253
    && hostnamePattern.test(data.referringSite) ? data.referringSite.toLowerCase() : 'Direct or unknown';
  const deviceModel = typeof data.deviceModel === 'string' && /^[\p{L}\p{N} ._()+/-]{1,80}$/u.test(data.deviceModel)
    ? data.deviceModel.trim() : '';

  return { event: data.event, page, referringSite, deviceModel };
}

function getDeviceDetails(headers) {
  const userAgent = headers.get('User-Agent') ?? '';
  const browsers = [
    ['Edge', /Edg(?:e|A|iOS)?\//i],
    ['Samsung Internet', /SamsungBrowser\//i],
    ['Opera', /(?:OPR|OPiOS|Opera)\//i],
    ['Firefox', /(?:Firefox|FxiOS)\//i],
    ['Chrome', /(?:Chrome|CriOS)\//i],
    ['Safari', /Version\/.*Safari\//i],
  ];
  const systems = [
    ['iOS', /iPhone|iPad|iPod/i],
    ['Android', /Android/i],
    ['Windows', /Windows/i],
    ['ChromeOS', /CrOS/i],
    ['macOS', /Macintosh|Mac OS X/i],
    ['Linux', /Linux/i],
  ];
  const browser = browsers.find(([, pattern]) => pattern.test(userAgent))?.[0] ?? 'Unknown';
  const system = systems.find(([, pattern]) => pattern.test(userAgent))?.[0] ?? 'Unknown';

  let device = 'Unknown';
  if (/iPad|Tablet/i.test(userAgent) || (system === 'Android' && !/Mobile/i.test(userAgent))) {
    device = 'Tablet';
  } else if (/Mobile|iPhone|iPod/i.test(userAgent) || headers.get('Sec-CH-UA-Mobile') === '?1') {
    device = 'Mobile';
  } else if (system !== 'Unknown') {
    device = 'Desktop';
  }

  return [device, browser, system];
}

async function appendRow(env, row) {
  const token = await getGoogleToken(env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const range = encodeURIComponent('Events!A:J');
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/${range}:append`;
  const response = await fetch(`${url}?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [row] }),
  });

  if (response.status === 401 && cachedToken?.value === token) cachedToken = undefined;
  if (!response.ok) throw new Error(`Google Sheets append returned HTTP ${response.status}.`);
  await response.body?.cancel();
}

export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname !== '/events') return new Response(null, { status: 404 });
    if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });

    const origin = request.headers.get('Origin');
    const allowedOrigins = (env.ALLOWED_ORIGINS ?? '').split(',').map((value) => value.trim());
    if (!origin || !allowedOrigins.includes(origin)) return new Response(null, { status: 403 });

    const headers = { 'Access-Control-Allow-Origin': origin, Vary: 'Origin', 'Cache-Control': 'no-store' };
    const respond = (status, message = null) => new Response(message, { status, headers });
    const contentType = request.headers.get('Content-Type')?.split(';', 1)[0].trim().toLowerCase();
    if (contentType !== 'text/plain') return respond(415);

    const event = await readEvent(request).catch(() => null);
    if (!event) return respond(400, 'Invalid analytics event.');
    if (!env.GOOGLE_SERVICE_ACCOUNT_JSON || !/^[a-zA-Z0-9_-]+$/.test(env.GOOGLE_SHEET_ID ?? '')) {
      return respond(503, 'Google Sheets settings are missing.');
    }

    const { country, region } = request.cf ?? {};
    const countryCode = country !== 'XX' && /^[A-Z]{2}$/.test(country ?? '') ? country : '';
    const row = [
      formatTimestamp(new Date()),
      event.event,
      event.page,
      event.referringSite,
      countryCode,
      region ?? '',
      ...getDeviceDetails(request.headers),
      event.deviceModel,
    ];

    try {
      await appendRow(env, row);
      return respond(204);
    } catch (error) {
      // Surface the failing stage without returning credentials or Google's response body.
      const message = /^Google (?:token exchange|Sheets append) returned HTTP \d{3}\.$/.test(error.message)
        ? error.message : 'Unable to record the analytics event.';
      return respond(502, message);
    }
  },
};
