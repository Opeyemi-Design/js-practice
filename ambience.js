(() => {
  // Keep the animated background in bounded, independently rendered sections.
  // This avoids repainting a pair of masks across an entire long document.
  const cloudscape = document.createElement('div');
  cloudscape.className = 'cloudscape';
  cloudscape.setAttribute('aria-hidden', 'true');
  document.body.prepend(cloudscape);

  // Keep each rendered section on the same document-wide animation timeline.
  const syncCloudAnimations = (section) => {
    section.getAnimations({ subtree: true }).forEach((animation) => {
      animation.startTime = 0;
    });
  };

  const updateCloudSections = () => {
    const sectionHeight = parseFloat(getComputedStyle(document.documentElement).fontSize) * 80;
    const count = Math.ceil(document.body.getBoundingClientRect().height / sectionHeight);
    while (cloudscape.children.length < count) {
      const section = document.createElement('div');
      const sectionOffset = `${cloudscape.children.length * 80}rem`;
      section.className = 'cloud-section';
      section.style.top = sectionOffset;
      section.style.setProperty('--cloud-offset', sectionOffset);
      section.innerHTML =
        '<div class="cloud-layer cloud-layer--first"></div>' +
        '<div class="cloud-layer cloud-layer--second"></div>';

      // Browsers may defer offscreen sections until they are close to view.
      section.addEventListener('contentvisibilityautostatechange', (event) => {
        if (!event.skipped) syncCloudAnimations(section);
      });
      cloudscape.append(section);
      syncCloudAnimations(section);
    }
    while (cloudscape.children.length > count) cloudscape.lastElementChild.remove();
  };
  updateCloudSections();
  if ('ResizeObserver' in window) new ResizeObserver(updateCloudSections).observe(document.body);
  window.addEventListener('resize', updateCloudSections);

  // The artwork stays mounted during navigation and is hidden on detail pages.
  const scene = document.createElement('div');
  scene.className = 'ambient-scene';
  scene.setAttribute('aria-label', 'Interactive background');
  scene.innerHTML =
    '<button type="button" class="ambient-shape shape-one" aria-label="Interact with floating shape 1"></button>' +
    '<button type="button" class="ambient-shape shape-two" aria-label="Interact with floating shape 2"></button>' +
    '<button type="button" class="ambient-shape shape-three" aria-label="Interact with floating shape 3"></button>' +
    '<button type="button" class="ambient-shape shape-four" aria-label="Interact with floating shape 4"></button>' +
    '<button type="button" class="ambient-shape shape-five" aria-label="Interact with floating shape 5"></button>' +
    '<span class="seasonal-ornament ornament-one" aria-hidden="true"></span>' +
    '<span class="seasonal-ornament ornament-two" aria-hidden="true"></span>';
  scene.insertAdjacentHTML(
    'beforeend',
    '<button type="button" class="ambient-shape drift-tail tail-one" aria-label="Interact with floating shape 6"></button>' +
      '<button type="button" class="ambient-shape drift-tail tail-two" aria-label="Interact with floating shape 7"></button>' +
      '<button type="button" class="ambient-shape drift-tail tail-three" aria-label="Interact with floating shape 8"></button>',
  );
  document.body.prepend(scene);
  // Choose the small decorative icon that accompanies each seasonal theme.
  const motifs = {
    spring:
      '<circle cx="12" cy="12" r="2"/><path d="M12 4c-3-3-5 1-3 3-4-1-5 3-2 4-3 2 0 5 3 4-1 4 3 5 4 2 2 3 5 0 4-3 4-1 3-5 0-5 2-3-1-5-3-3Z"/>',
    summer:
      '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
    fall: '<path d="m12 2 2 5 3-2-1 4 4-1-2 4 3 2-6 2-1 5h-4l-1-5-6-2 3-2-2-4 4 1-1-4 3 2 2-5Z"/>',
    winter: '<path d="M12 2v20M4 7l16 10M4 17 20 7M9 4l3 3 3-3M9 20l3-3 3 3"/>',
    halloween:
      '<path d="M12 7c-3-4-8-1-8 5 0 5 3 8 8 8s8-3 8-8c0-6-5-9-8-5ZM12 7c0-3 1-4 3-4M9 8c-2 3-2 8 0 11m6-11c2 3 2 8 0 11"/>',
    christmas: '<path d="m12 3-6 8h3l-4 6h14l-4-6h3l-6-8ZM12 17v4m-3 0h6"/>',
  };
  const motif = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  motif.setAttribute('viewBox', '0 0 24 24');
  motif.setAttribute('aria-hidden', 'true');
  motif.classList.add('seasonal-motif');
  scene.querySelector('.shape-two').append(motif);
  const updateMotif = () => {
    motif.innerHTML = motifs[document.documentElement.dataset.theme] || '';
  };
  new MutationObserver(updateMotif).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  updateMotif();

  const shapes = [...scene.querySelectorAll('button.ambient-shape')];
  const interact = (shape) => {
    shape.classList.remove('is-touched');
    void shape.offsetWidth;
    shape.classList.add('is-touched');
    setTimeout(() => shape.classList.remove('is-touched'), 900);
  };
  shapes.forEach((shape) => shape.addEventListener('click', () => interact(shape)));

  // Content remains above the scene, so let shapes respond through empty areas
  // without putting their rectangular hit areas over links and controls.
  const controlSelector =
    'a, button, input, select, textarea, .season-preview, [role="button"], [role="scrollbar"], [contenteditable="true"]';
  const shapeAt = (x, y) =>
    shapes
      .slice()
      .reverse()
      .find((shape) => {
        if (getComputedStyle(shape).display === 'none') return false;
        const rect = shape.getBoundingClientRect();
        return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      });
  document.addEventListener('pointermove', (event) => {
    if (document.documentElement.dataset.page === 'detail') return;
    const shape =
      event.pointerType !== 'touch' && !event.target.closest(controlSelector)
        ? shapeAt(event.clientX, event.clientY)
        : null;
    shapes.forEach((item) => item.classList.toggle('is-hovered', item === shape));
  });
  document.addEventListener('pointerout', (event) => {
    if (!event.relatedTarget) shapes.forEach((shape) => shape.classList.remove('is-hovered'));
  });
  document.addEventListener('click', (event) => {
    if (document.documentElement.dataset.page === 'detail') return;
    if (event.target.closest(controlSelector) || window.getSelection()?.toString()) return;
    const shape = shapeAt(event.clientX, event.clientY);
    if (shape) interact(shape);
  });
})();
