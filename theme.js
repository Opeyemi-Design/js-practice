(() => {
  // Set page attributes early so the correct layout and theme are ready on load.
  function updatePageAttributes() {
    document.documentElement.dataset.page = /\/(companies|case-studies)\//.test(location.pathname)
      ? 'detail'
      : 'standard';
    document.documentElement.dataset.view = /^\/(?:index\.html)?$/.test(location.pathname)
      ? 'home'
      : location.pathname === '/case-studies.html'
        ? 'studies'
        : location.pathname.startsWith('/companies/')
          ? 'company'
          : 'other';
  }
  updatePageAttributes();
  document.addEventListener('portfolio:navigated', updatePageAttributes);
  const key = 'opeyemi-theme';
  const media = matchMedia('(prefers-color-scheme: dark)');
  const valid = ['light', 'dark', 'system', 'seasonal'];
  let choice = 'system';
  let previewSeason = '';
  let previewControl;
  try {
    const saved = localStorage.getItem(key);
    if (valid.includes(saved)) choice = saved;
  } catch (_) {}
  const icons = {
    spring:
      '<circle cx="12" cy="12" r="2"/><path d="M12 4c-3-3-5 1-3 3-4-1-5 3-2 4-3 2 0 5 3 4-1 4 3 5 4 2 2 3 5 0 4-3 4-1 3-5 0-5 2-3-1-5-3-3Z"/>',
    summer:
      '<path d="M5.5 10.5a3.5 3.5 0 1 1 6-3.1M8 2v1M3.76 3.76l.7.7M2 8h1m9.24-4.24-.7.7"/><path d="M8 20a4 4 0 0 1 .6-7.95A5.5 5.5 0 0 1 19 13a3.5 3.5 0 0 1-1 7H8Z"/>',
    fall: '<path d="M20 4C9 4 4 8 4 15a5 5 0 0 0 5 5c7 0 11-5 11-16ZM4 20c3-4 6-7 12-10"/>',
    winter: '<path d="M12 2v20M4 7l16 10M4 17 20 7M9 4l3 3 3-3M9 20l3-3 3 3"/>',
    halloween:
      '<path d="M12 7c-3-4-8-1-8 5 0 5 3 8 8 8s8-3 8-8c0-6-5-9-8-5ZM12 7c0-3 1-4 3-4M9 8c-2 3-2 8 0 11m6-11c2 3 2 8 0 11"/>',
    christmas: '<path d="m12 3-6 8h3l-4 6h14l-4-6h3l-6-8ZM12 17v4m-3 0h6"/>',
  };
  // Festive dates take priority over the four Canadian seasons.
  function season(date) {
    const day = (date.getMonth() + 1) * 100 + date.getDate();
    if (day >= 1025 && day <= 1101) return 'halloween';
    if (day >= 1215 && day <= 1229) return 'christmas';
    if (day >= 320 && day <= 620) return 'spring';
    if (day >= 621 && day <= 921) return 'summer';
    if (day >= 922 && day <= 1220) return 'fall';
    return 'winter';
  }
  // Apply the chosen mode and update the appearance control.
  function apply() {
    const current = choice === 'seasonal' && previewSeason ? previewSeason : season(new Date());
    const theme =
      choice === 'seasonal'
        ? current
        : choice === 'system'
          ? media.matches
            ? 'dark'
            : 'light'
          : choice;
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
    if (previewControl) previewControl.hidden = choice !== 'seasonal';
    document.querySelectorAll('[data-theme-choice]').forEach((button) => {
      const selected = button.dataset.themeChoice === choice;
      button.setAttribute('aria-pressed', String(selected));
      if (button.dataset.themeChoice === 'seasonal') {
        button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[current]}</svg>`;
        const seasonName = current.charAt(0).toUpperCase() + current.slice(1);
        button.dataset.tooltip = `Seasonal (${seasonName})`;
        button.setAttribute('aria-label', `Seasonal theme: ${current}`);
      }
    });
  }

  // Temporary visual testing control. Remove when the portfolio is ready to deploy.
  function setupSeasonPreview() {
    previewControl = document.createElement('div');
    previewControl.className = 'season-preview';
    previewControl.innerHTML = `
      <label for="season-preview-select">Season preview</label>
      <div class="season-preview__select">
        <select id="season-preview-select">
          <option value="">Automatic (date)</option>
          <option value="spring">Spring</option>
          <option value="summer">Summer</option>
          <option value="fall">Fall</option>
          <option value="winter">Winter</option>
          <option value="halloween">Halloween</option>
          <option value="christmas">Christmas</option>
        </select>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    `;
    previewControl.querySelector('select').addEventListener('change', (event) => {
      previewSeason = event.target.value;
      apply();
    });
    document.body.appendChild(previewControl);
    apply();
  }

  apply();
  document.addEventListener('DOMContentLoaded', setupSeasonPreview);
  media.addEventListener('change', apply);
  document.addEventListener('headerLoaded', () => {
    document.querySelectorAll('[data-theme-choice]').forEach((button) =>
      button.addEventListener('click', () => {
        choice = button.dataset.themeChoice;
        try {
          localStorage.setItem(key, choice);
        } catch (_) {}
        apply();
      }),
    );
    apply();
  });
  setInterval(apply, 60000);
})();
