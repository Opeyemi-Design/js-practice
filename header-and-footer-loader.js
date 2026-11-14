// Load the shared navigation and footer on each page.
function loadHeaderAndFooter() {
  fetch('/header.html')
    .then((response) => response.text())
    .then((data) => {
      document.body.insertAdjacentHTML('afterbegin', data);
      updateActiveNavigation();
      document.dispatchEvent(new Event('headerLoaded'));
      setupSegmentedControls(document);
    });
  fetch('/footer.html')
    .then((response) => response.text())
    .then((data) => document.body.insertAdjacentHTML('beforeend', data));
}

// Keep the current-page indicator in sync when only the page content changes.
function updateActiveNavigation() {
  const path = location.pathname;
  document.querySelectorAll('.primary-navigation a').forEach((link) => {
    const href = link.getAttribute('href');
    const active =
      href === '/#work'
        ? path === '/' || path === '/index.html' || path.startsWith('/companies/')
        : href === '/case-studies.html'
          ? path === href || path.startsWith('/case-studies/')
          : path === href;
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

document.addEventListener('portfolio:navigated', updateActiveNavigation);

// Show one reusable tooltip for any labelled control, including dynamic controls.
function setupTooltips() {
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.id = 'site-tooltip';
  tooltip.setAttribute('role', 'tooltip');
  tooltip.hidden = true;
  document.body.appendChild(tooltip);

  let trigger = null;
  let hideTimer;

  function removeDescription(element) {
    const ids = (element.getAttribute('aria-describedby') || '')
      .split(/\s+/)
      .filter((id) => id && id !== tooltip.id);
    if (ids.length) element.setAttribute('aria-describedby', ids.join(' '));
    else element.removeAttribute('aria-describedby');
  }

  function positionTooltip() {
    if (!trigger || tooltip.hidden) return;
    const control = trigger.getBoundingClientRect();
    const label = tooltip.getBoundingClientRect();
    const inset = 8;
    const centredLeft = control.left + (control.width - label.width) / 2;
    const left = Math.max(inset, Math.min(centredLeft, window.innerWidth - label.width - inset));
    const header = trigger.closest('.primary-header');
    const lowerEdge = header
      ? Math.max(control.bottom, header.getBoundingClientRect().bottom)
      : control.bottom;
    const below = lowerEdge + inset;
    const top =
      below + label.height <= window.innerHeight - inset
        ? below
        : Math.max(inset, control.top - label.height - inset);
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  function hideTooltip() {
    clearTimeout(hideTimer);
    if (trigger) removeDescription(trigger);
    trigger = null;
    tooltip.hidden = true;
  }

  function showTooltip(element) {
    if (!element.dataset.tooltip) return;
    clearTimeout(hideTimer);
    if (trigger && trigger !== element) removeDescription(trigger);
    trigger = element;
    tooltip.textContent = element.dataset.tooltip;
    tooltip.hidden = false;
    const ids = (element.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
    if (!ids.includes(tooltip.id)) ids.push(tooltip.id);
    element.setAttribute('aria-describedby', ids.join(' '));
    positionTooltip();
  }

  function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      if (trigger?.matches(':focus-visible') || trigger?.matches(':hover') || tooltip.matches(':hover'))
        return;
      hideTooltip();
    }, 200);
  }

  document.addEventListener('pointerover', (event) => {
    const element = event.target.closest('[data-tooltip]');
    if (!element || element.contains(event.relatedTarget)) return;
    if (event.pointerType !== 'touch') showTooltip(element);
  });

  document.addEventListener('pointerout', (event) => {
    const element = event.target.closest('[data-tooltip]');
    if (!element || element !== trigger || element.contains(event.relatedTarget)) return;
    scheduleHide();
  });

  document.addEventListener('focusin', (event) => {
    const element = event.target.closest('[data-tooltip]');
    if (element?.matches(':focus-visible')) showTooltip(element);
  });

  document.addEventListener('focusout', (event) => {
    if (event.target === trigger) scheduleHide();
  });

  tooltip.addEventListener('pointerenter', () => clearTimeout(hideTimer));
  tooltip.addEventListener('pointerleave', scheduleHide);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hideTooltip();
  });
  document.addEventListener('portfolio:before-navigate', hideTooltip);
  window.addEventListener('scroll', positionTooltip, { passive: true });
  window.addEventListener('resize', positionTooltip);

  // Seasonal labels change when the date or theme changes.
  new MutationObserver((changes) => {
    if (!trigger || !changes.some((change) => change.target === trigger)) return;
    tooltip.textContent = trigger.dataset.tooltip;
    positionTooltip();
  }).observe(document.body, {
    subtree: true,
    attributes: true,
    attributeFilter: ['data-tooltip'],
  });
}

// Position the selected segment immediately, then animate user selections.
function setupSegmentedControls(root) {
  root.querySelectorAll('.segmented-control').forEach((control) => {
    if (control.querySelector('.segment-indicator')) return;
    const indicator = document.createElement('span');
    indicator.className = 'segment-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    control.prepend(indicator);

    let slideTimer;
    const stopSliding = () => {
      clearTimeout(slideTimer);
      indicator.classList.remove('is-sliding');
    };
    control.addEventListener(
      'click',
      (event) => {
        const button = event.target.closest('button');
        if (
          !button ||
          !control.contains(button) ||
          button.disabled ||
          button.getAttribute('aria-pressed') === 'true'
        )
          return;
        stopSliding();
        indicator.classList.add('is-sliding');
        slideTimer = setTimeout(stopSliding, 400);
      },
      true,
    );

    const update = () => {
      const selected = control.querySelector('button[aria-pressed="true"]');
      const controlRect = control.getBoundingClientRect();
      if (!selected || !controlRect.width || !controlRect.height) return;
      const rect = selected.getBoundingClientRect();
      indicator.style.width = `${rect.width}px`;
      indicator.style.height = `${rect.height}px`;
      indicator.style.transform = `translate(${rect.left - controlRect.left - control.clientLeft}px, ${rect.top - controlRect.top - control.clientTop}px)`;
      control.classList.add('has-segment-indicator');
    };
    const observer = new MutationObserver(update);
    control
      .querySelectorAll('button')
      .forEach((button) =>
        observer.observe(button, { attributes: true, attributeFilter: ['aria-pressed'] }),
      );
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(control);
    window.addEventListener('resize', () => {
      stopSliding();
      update();
    });
    document.fonts?.ready.then(update);
    update();
  });
}

document.addEventListener('DOMContentLoaded', loadHeaderAndFooter);
document.addEventListener('DOMContentLoaded', setupTooltips);
