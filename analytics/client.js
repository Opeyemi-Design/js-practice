const liveOrigin = 'https://opeyemiadetifa.com';
const liveEndpoint = 'https://portfolio-analytics.opeyemiadetifa17.workers.dev/events';

function getReferringSite() {
  if (!document.referrer) return '';

  const referrer = new URL(document.referrer);
  if (!['http:', 'https:'].includes(referrer.protocol)) return '';
  if (referrer.hostname === location.hostname) return '';
  return referrer.hostname;
}

async function getDeviceModel() {
  try {
    const hints = await navigator.userAgentData?.getHighEntropyValues(['model']);
    return hints?.model ?? '';
  } catch {
    return '';
  }
}

export function setupAnalytics(previewEndpoint) {
  // GitHub Pages serves this module directly, so the live site uses its own origin check.
  const eventUrl = location.origin === liveOrigin ? liveEndpoint : previewEndpoint?.trim();
  if (!eventUrl) return;

  const referringSite = getReferringSite();
  const getPage = () => location.pathname === '/index.html' ? '/' : location.pathname;
  let currentPage = getPage();
  let deviceModel = '';

  function send(event, page) {
    // A simple CORS request keeps navigation independent of delivery.
    void fetch(eventUrl, {
      method: 'POST',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      keepalive: true,
      body: JSON.stringify({ event, page, referringSite, deviceModel }),
    }).catch(() => {});
  }

  function sendView(page) {
    const event = page.startsWith('/case-studies/') ? 'case_study_open' : 'page_view';
    send(event, page);
  }

  // Give the browser a short window to supply a model on the initial view.
  const initialPage = currentPage;
  const modelReady = getDeviceModel().then((model) => {
    deviceModel = model;
  });
  const modelDeadline = new Promise((resolve) => setTimeout(resolve, 150));
  void Promise.race([modelReady, modelDeadline]).then(() => sendView(initialPage));

  document.addEventListener('portfolio:navigated', () => {
    const page = getPage();
    if (page === currentPage) return;
    currentPage = page;
    sendView(page);
  });

  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    currentPage = getPage();
    sendView(currentPage);
  });

  // Delegation also covers links in the shared header after it loads.
  function trackContactClick(event) {
    const link = event.target?.closest?.('a[href]');
    if (!link || link.hasAttribute('download')) return;

    const url = new URL(link.href);
    if (url.origin === location.origin && url.pathname === '/contact-me.html') {
      send('contact_click', getPage());
    }
  }

  document.addEventListener('click', trackContactClick, { capture: true });
  document.addEventListener('auxclick', (event) => {
    if (event.button === 1) trackContactClick(event);
  }, { capture: true });
}
