// Mobile navigation
document.addEventListener('headerLoaded', () => {
  const navToggle = document.querySelector('.mobile-nav-toggle');
  const primaryNav = document.querySelector('.primary-navigation');
  const body = document.body;
  const mobileLayout = matchMedia('(max-width: 900px)');

  // Keep the closed mobile menu out of keyboard navigation as it animates.
  function updateNavigationAvailability() {
    primaryNav.inert = mobileLayout.matches && navToggle.getAttribute('aria-expanded') !== 'true';
  }
  updateNavigationAvailability();
  mobileLayout.addEventListener('change', updateNavigationAvailability);

  navToggle.addEventListener('click', () => {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !isExpanded);
    primaryNav.classList.toggle('open');

    // Toggle the 'nav-open' class on the body
    body.classList.toggle('nav-open');
    navToggle.setAttribute('aria-label', isExpanded ? 'Open menu' : 'Close menu');
    updateNavigationAvailability();
  });
  primaryNav.addEventListener('click', (event) => {
    if (!event.target.closest('a')) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    primaryNav.classList.remove('open');
    body.classList.remove('nav-open');
    updateNavigationAvailability();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || navToggle.getAttribute('aria-expanded') !== 'true') return;
    navToggle.click();
    navToggle.focus();
  });
});

// Copy the contact email address
function setupCopyEmailButton() {
  const copyButton = document.getElementById('copy-email-address');
  const copyButtonLabel = copyButton?.querySelector('.copy-button-label');
  const copyStatus = document.querySelector('.copy-status');

  if (!copyButton || !copyButtonLabel) return;

  copyButton.addEventListener('click', async function () {
    const email = this.getAttribute('data-email');
    copyButton.disabled = true;

    try {
      await navigator.clipboard.writeText(email);

      // Keep the confirmation visible and the button disabled for four seconds.
      copyButtonLabel.textContent = 'Email address copied';
      if (copyStatus) copyStatus.textContent = 'Email address copied to clipboard.';

      setTimeout(function () {
        copyButtonLabel.textContent = 'Copy email address';
        copyButton.disabled = false;
        if (copyStatus) copyStatus.textContent = '';
      }, 4000);
    } catch (err) {
      copyButton.disabled = false;
      console.error('Failed to copy text: ', err);
      if (copyStatus)
        copyStatus.textContent = 'Could not copy the address. You can use the email link instead.';
    }
  });
}

// Load project videos when their previews are activated.
function setupProjectVideos() {
  const videoContainers = document.querySelectorAll('.video-container');

  videoContainers.forEach((container) => {
    container.setAttribute('role', 'button');
    container.setAttribute('tabindex', '0');
    container.setAttribute('aria-label', 'Play video');
    const playVideo = () => {
      const videoId = container.dataset.videoId;
      if (videoId) {
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(videoId.split('?')[0])}?autoplay=1`;
        iframe.title = 'Project video';
        iframe.allow =
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;

        container.innerHTML = '';
        container.appendChild(iframe);
        container.removeAttribute('role');
        container.removeAttribute('tabindex');
        container.removeAttribute('aria-label');
      }
    };
    container.addEventListener('click', playVideo, { once: true });
    container.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        playVideo();
      }
    });
  });
}

// Case study visibility and previous/next navigation
const caseStudies = [
  {
    title: 'Creative Insights',
    slug: 'creative-insights',
    path: '/case-studies/creative-insights.html',
    isVisible: true,
  },
  {
    title: 'Creative Hub',
    slug: 'creative-hub',
    path: '/case-studies/creative-hub.html',
    isVisible: true,
  },
  {
    title: 'Scheduled Designs',
    slug: 'scheduled-designs',
    path: '/case-studies/scheduled-designs.html',
    isVisible: true,
  },
  {
    title: 'AfroTada Redesign',
    slug: 'afrotada-redesign',
    path: '/case-studies/afrotada-redesign.html',
    isVisible: true,
  },
  {
    title: 'AfroTada Dashboard',
    slug: 'afrotada-dashboard',
    path: '/case-studies/afrotada-dashboard.html',
    isVisible: true,
  },
  {
    title: 'Clana',
    slug: 'clana',
    path: '/case-studies/clana.html',
    isVisible: true,
  },
  {
    title: 'YouTube In-App Sharing',
    slug: 'youtube-in-app-sharing',
    path: '/case-studies/youtube-in-app-sharing.html',
    isVisible: true,
  },
  {
    title: 'RentSpot',
    slug: 'rentspot',
    path: '/case-studies/rentspot.html',
    isVisible: true,
  },
  {
    title: 'Harvey Norman App',
    slug: 'harvey-norman-shopping-app',
    path: '/case-studies/harvey-norman-shopping-app.html',
    isVisible: false,
  },
  {
    title: 'TheeZign',
    slug: 'theezign',
    path: '/case-studies/theezign.html',
    isVisible: false,
  },
];

const leftArrowIcon = `
  <svg class="btn__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
`;

const rightArrowIcon = `
  <svg class="btn__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
`;

const scrollDownIcon = `
  <svg class="btn__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 5v14m-7-7 7 7 7-7"/></svg>
`;

const scrollUpIcon = `
  <svg class="btn__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 19V5m-7 7 7-7 7 7"/></svg>
`;

function updateCaseStudyCards() {
  const caseStudyCards = document.querySelectorAll('[data-case-study-slug]');
  const projectsContainer = document.querySelector('.projects');

  caseStudyCards.forEach((card) => {
    const caseStudy = caseStudies.find((item) => item.slug === card.dataset.caseStudySlug);

    if (!caseStudy) return;

    card.classList.toggle('is-hidden', !caseStudy.isVisible);
  });

  if (!projectsContainer || caseStudyCards.length === 0) return;

  caseStudies.forEach((caseStudy) => {
    const card = projectsContainer.querySelector(`[data-case-study-slug="${caseStudy.slug}"]`);

    if (!card) return;

    projectsContainer.appendChild(card);
  });
}

function addCaseStudyNavigation() {
  const currentPath = window.location.pathname;
  const visibleCaseStudies = caseStudies.filter((caseStudy) => caseStudy.isVisible);
  const currentIndex = visibleCaseStudies.findIndex((caseStudy) => caseStudy.path === currentPath);
  const main = document.querySelector('main');

  if (!main || currentIndex === -1) return;

  const previousCaseStudy =
    visibleCaseStudies[(currentIndex - 1 + visibleCaseStudies.length) % visibleCaseStudies.length];
  const nextCaseStudy = visibleCaseStudies[(currentIndex + 1) % visibleCaseStudies.length];
  const navigationSection = document.createElement('section');

  navigationSection.className = 'case-study-page-navigation-section';
  navigationSection.innerHTML = `
    <div class="normal-container">
      <div class="company-page-navigation">
        <a href="${previousCaseStudy.path}" class="btn btn--outline btn--medium">
          ${leftArrowIcon}
          ${previousCaseStudy.title}
        </a>
        <a href="${nextCaseStudy.path}" class="btn btn--outline btn--medium">
          ${nextCaseStudy.title}
          ${rightArrowIcon}
        </a>
      </div>
    </div>
  `;

  main.appendChild(navigationSection);
}

let removePageScrollToggle = () => {};

function addPageScrollToggle() {
  const currentPath = window.location.pathname;
  if (!currentPath.startsWith('/companies/') && !currentPath.startsWith('/case-studies/')) return;

  const scrollButton = document.createElement('button');

  scrollButton.type = 'button';
  scrollButton.className = 'btn btn--outline btn--icon btn--large page-scroll-toggle';
  document.body.appendChild(scrollButton);

  function updateScrollButton() {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const isNearBottom = scrollableHeight > 0 && window.scrollY > scrollableHeight * 0.4;

    scrollButton.dataset.scrollDirection = isNearBottom ? 'up' : 'down';
    scrollButton.setAttribute('aria-label', isNearBottom ? 'Scroll to top' : 'Scroll to bottom');
    scrollButton.innerHTML = isNearBottom ? scrollUpIcon : scrollDownIcon;
  }

  scrollButton.addEventListener('click', () => {
    const isScrollToTop = scrollButton.dataset.scrollDirection === 'up';

    window.scrollTo({
      top: isScrollToTop ? 0 : document.documentElement.scrollHeight,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  });

  window.addEventListener('scroll', updateScrollButton, { passive: true });
  window.addEventListener('resize', updateScrollButton);
  removePageScrollToggle = () => {
    window.removeEventListener('scroll', updateScrollButton);
    window.removeEventListener('resize', updateScrollButton);
    scrollButton.remove();
    removePageScrollToggle = () => {};
  };
  updateScrollButton();
}

function addSectionScroll() {
  const links = document.querySelectorAll('.hero-scroll, [data-smooth-scroll]');
  if (links.length === 0) return;

  let cancelScroll = () => {};
  document.addEventListener('portfolio:before-navigate', () => cancelScroll(), { once: true });
  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.getElementById(link.hash.slice(1));
      if (!target) return;

      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        matchMedia('(prefers-reduced-motion: reduce)').matches
      )
        return;

      event.preventDefault();
      cancelScroll();
      if (location.hash !== link.hash) history.pushState(null, '', link.hash);

      const start = window.scrollY;
      const offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const destination = Math.max(0, target.getBoundingClientRect().top + start - offset);
      const duration = 1400;
      let frame;
      let started;
      const stop = () => {
        cancelAnimationFrame(frame);
        window.removeEventListener('wheel', stop);
        window.removeEventListener('touchstart', stop);
        window.removeEventListener('keydown', stop);
        cancelScroll = () => {};
      };
      cancelScroll = stop;
      window.addEventListener('wheel', stop, { passive: true });
      window.addEventListener('touchstart', stop, { passive: true });
      window.addEventListener('keydown', stop);

      const animate = (time) => {
        if (started === undefined) started = time;
        const progress = Math.min((time - started) / duration, 1);
        const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
        window.scrollTo({ top: start + (destination - start) * eased, behavior: 'instant' });
        if (progress < 1) {
          frame = requestAnimationFrame(animate);
        } else {
          stop();
          const hadTabindex = target.hasAttribute('tabindex');
          if (!hadTabindex) target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
          if (!hadTabindex)
            target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
        }
      };
      frame = requestAnimationFrame(animate);
    });
  });
}

function setupPage() {
  setupCopyEmailButton();
  setupProjectVideos();
  updateCaseStudyCards();
  addCaseStudyNavigation();
  addPageScrollToggle();
  addSectionScroll();
}

document.addEventListener('DOMContentLoaded', setupPage);
document.addEventListener('portfolio:navigated', setupPage);
document.addEventListener('portfolio:before-navigate', () => removePageScrollToggle());

// Replace internal page content while keeping the shared header mounted.
function setupSiteNavigation() {
  // Both homepage URLs refer to the same page, even when one includes index.html.
  const pageKey = (url) =>
    `${url.pathname === '/index.html' ? '/' : url.pathname}${url.search}`;
  let displayedPage = pageKey(new URL(location.href));
  let pendingNavigation;
  let scrollSaveTimer;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  function saveScrollPosition() {
    const state = { ...history.state, portfolioScrollY: window.scrollY };
    history.replaceState(state, '', location.href);
  }

  function restorePosition(url, savedPosition) {
    if (typeof savedPosition === 'number') {
      window.scrollTo({ top: savedPosition, behavior: 'instant' });
      return;
    }
    const target = url.hash && document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (target) {
      const offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      window.scrollTo({
        top: Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset),
        behavior: 'instant',
      });
      return;
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  async function navigate(url, { addHistory = true, savedPosition } = {}) {
    pendingNavigation?.abort();
    const controller = new AbortController();
    pendingNavigation = controller;

    try {
      const response = await fetch(url.pathname + url.search, { signal: controller.signal });
      if (!response.ok) throw new Error(`Could not load page: ${response.status}`);
      const nextDocument = new DOMParser().parseFromString(await response.text(), 'text/html');
      const nextMain = nextDocument.querySelector('main');
      const currentMain = document.querySelector('main');
      if (!nextMain || !currentMain) throw new Error('Page content is unavailable');
      if (controller.signal.aborted) return;

      if (addHistory) {
        clearTimeout(scrollSaveTimer);
        saveScrollPosition();
        history.pushState({ portfolioScrollY: 0 }, '', url.href);
      }

      document.dispatchEvent(new Event('portfolio:before-navigate'));
      document.body.className = nextDocument.body.className;
      document.title = nextDocument.title;
      currentMain.replaceWith(nextMain);
      displayedPage = pageKey(url);
      document.dispatchEvent(new Event('portfolio:navigated'));
      restorePosition(url, savedPosition);

      // Announce the new page to keyboard and screen-reader users.
      nextMain.setAttribute('tabindex', '-1');
      nextMain.focus({ preventScroll: true });
    } catch (error) {
      if (error.name !== 'AbortError') location.assign(url.href);
    } finally {
      if (pendingNavigation === controller) pendingNavigation = null;
    }
  }

  document.addEventListener('click', (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const link = event.target.closest('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname !== '/' && !url.pathname.endsWith('.html')) return;

    // Let ordinary in-page links retain their native scrolling behavior.
    const isHeaderLink = Boolean(link.closest('.primary-header'));
    if (
      !isHeaderLink &&
      url.hash &&
      url.pathname === location.pathname &&
      url.search === location.search
    )
      return;

    const menuToggle = document.querySelector('.mobile-nav-toggle[aria-expanded="true"]');
    if (menuToggle) menuToggle.click();
    if (pageKey(url) === displayedPage) {
      pendingNavigation?.abort();
      event.preventDefault();
      if (url.href !== location.href) {
        clearTimeout(scrollSaveTimer);
        saveScrollPosition();
        history.pushState({ portfolioScrollY: 0 }, '', url.href);
      }
      restorePosition(url);
      return;
    }
    event.preventDefault();
    navigate(url);
  });

  window.addEventListener(
    'scroll',
    () => {
      clearTimeout(scrollSaveTimer);
      scrollSaveTimer = setTimeout(saveScrollPosition, 150);
    },
    { passive: true },
  );

  window.addEventListener('popstate', (event) => {
    clearTimeout(scrollSaveTimer);
    const url = new URL(location.href);
    if (pageKey(url) === displayedPage) {
      pendingNavigation?.abort();
      restorePosition(url, event.state?.portfolioScrollY);
      return;
    }
    navigate(url, { addHistory: false, savedPosition: event.state?.portfolioScrollY });
  });

  // A browser back navigation can return through a normal, full-page link.
  if (typeof history.state?.portfolioScrollY === 'number') {
    requestAnimationFrame(() => restorePosition(new URL(location.href), history.state.portfolioScrollY));
  }
}

document.addEventListener('DOMContentLoaded', setupSiteNavigation);

// Keep the native page scrolling while drawing a transparent-track overlay thumb.
function setupPageScrollbar() {
  const root = document.documentElement;
  const overlaySupport = matchMedia('(pointer: fine) and (forced-colors: none)');
  const scrollbar = document.createElement('div');
  const thumb = document.createElement('div');
  let updateFrame;
  let fadeTimer;
  let dragOffset = 0;
  let draggingPointer = null;

  if (!root.id) root.id = 'page-scroll-region';
  scrollbar.className = 'page-scrollbar';
  scrollbar.hidden = true;
  scrollbar.tabIndex = 0;
  scrollbar.setAttribute('role', 'scrollbar');
  scrollbar.setAttribute('aria-label', 'Page scrollbar');
  scrollbar.setAttribute('aria-controls', root.id);
  scrollbar.setAttribute('aria-orientation', 'vertical');
  scrollbar.setAttribute('aria-valuemin', '0');
  scrollbar.setAttribute('aria-valuemax', '100');
  thumb.className = 'page-scrollbar__thumb';
  scrollbar.appendChild(thumb);
  document.body.appendChild(scrollbar);

  // Reveal the thumb on activity and start the three-second idle countdown.
  function showScrollbar() {
    if (scrollbar.hidden) return;
    scrollbar.classList.add('is-visible');
    clearTimeout(fadeTimer);
    fadeTimer = setTimeout(() => scrollbar.classList.remove('is-visible'), 3000);
  }

  function updateScrollbar() {
    updateFrame = null;
    if (!overlaySupport.matches) {
      root.classList.remove('has-overlay-scrollbar');
      scrollbar.hidden = true;
      clearTimeout(fadeTimer);
      scrollbar.classList.remove('is-visible');
      return;
    }

    root.classList.add('has-overlay-scrollbar');
    const scrollableHeight = Math.max(0, root.scrollHeight - window.innerHeight);
    const wasHidden = scrollbar.hidden;
    scrollbar.hidden = scrollableHeight <= 1;
    if (scrollbar.hidden) {
      clearTimeout(fadeTimer);
      scrollbar.classList.remove('is-visible');
      return;
    }
    if (wasHidden) showScrollbar();

    const trackHeight = scrollbar.clientHeight;
    const thumbHeight = Math.max(40, (trackHeight * window.innerHeight) / root.scrollHeight);
    const progress = Math.max(0, Math.min(1, window.scrollY / scrollableHeight));
    thumb.style.height = `${Math.min(trackHeight, thumbHeight)}px`;
    thumb.style.transform = `translateY(${progress * Math.max(0, trackHeight - thumbHeight)}px)`;
    scrollbar.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
  }

  function scheduleUpdate() {
    if (updateFrame === undefined || updateFrame === null) {
      updateFrame = requestAnimationFrame(updateScrollbar);
    }
  }

  function scrollFromPointer(clientY) {
    const track = scrollbar.getBoundingClientRect();
    const travel = track.height - thumb.getBoundingClientRect().height;
    if (travel <= 0) return;
    const position = Math.max(0, Math.min(travel, clientY - track.top - dragOffset));
    const scrollableHeight = Math.max(0, root.scrollHeight - window.innerHeight);
    window.scrollTo({ top: (position / travel) * scrollableHeight, behavior: 'instant' });
  }

  scrollbar.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const thumbRect = thumb.getBoundingClientRect();
    dragOffset = event.target === thumb ? event.clientY - thumbRect.top : thumbRect.height / 2;
    draggingPointer = event.pointerId;
    scrollbar.classList.add('is-dragging');
    showScrollbar();
    scrollbar.setPointerCapture(event.pointerId);
    scrollbar.focus({ preventScroll: true });
    scrollFromPointer(event.clientY);
  });

  scrollbar.addEventListener('pointermove', (event) => {
    if (event.pointerId === draggingPointer) scrollFromPointer(event.clientY);
  });

  scrollbar.addEventListener('lostpointercapture', () => {
    draggingPointer = null;
    scrollbar.classList.remove('is-dragging');
    showScrollbar();
  });

  scrollbar.addEventListener('pointerenter', showScrollbar);
  scrollbar.addEventListener('focus', showScrollbar);

  scrollbar.addEventListener('keydown', (event) => {
    const pageStep = window.innerHeight * 0.9;
    const scrollableHeight = Math.max(0, root.scrollHeight - window.innerHeight);
    const positions = {
      ArrowUp: window.scrollY - 40,
      ArrowDown: window.scrollY + 40,
      PageUp: window.scrollY - pageStep,
      PageDown: window.scrollY + pageStep,
      Home: 0,
      End: scrollableHeight,
    };
    if (!(event.key in positions)) return;
    event.preventDefault();
    window.scrollTo({ top: positions[event.key], behavior: 'instant' });
  });

  window.addEventListener(
    'scroll',
    () => {
      showScrollbar();
      scheduleUpdate();
    },
    { passive: true },
  );
  window.addEventListener('resize', scheduleUpdate);
  document.addEventListener('portfolio:navigated', scheduleUpdate);
  overlaySupport.addEventListener('change', scheduleUpdate);
  if ('ResizeObserver' in window) new ResizeObserver(scheduleUpdate).observe(document.body);
  updateScrollbar();
}

document.addEventListener('DOMContentLoaded', setupPageScrollbar);
