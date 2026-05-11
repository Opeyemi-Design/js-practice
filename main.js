// CONTROLS HAMBURGER MENU
document.addEventListener('headerLoaded', () => {
    const navToggle = document.querySelector('.mobile-nav-toggle');
    const primaryNav = document.querySelector('.primary-navigation');
    const body = document.body;
  
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      primaryNav.classList.toggle('open');
      
      // Toggle the 'nav-open' class on the body
      body.classList.toggle('nav-open');
    });
});

// COPIES EMAIL ADRRESS TO CLIPBAORD ON THE CONTACT ME PAGE
document.addEventListener('DOMContentLoaded', function() {
    const copyButton = document.getElementById('copy-email-address');
    const copyButtonLabel = copyButton?.querySelector('.copy-button-label');

    if (!copyButton || !copyButtonLabel) return;
    
    copyButton.addEventListener('click', function() {
      const email = this.getAttribute('data-email');
      
      // Copy email to clipboard
      navigator.clipboard.writeText(email).then(function() {
        // Change button text and style
        copyButtonLabel.textContent = 'Email Address Copied';
        copyButton.style.backgroundColor = 'var(--clr-neutral-500)';
        copyButton.style.color = 'var(--clr-neutral-600)';
        
        // Optionally, revert the button after a few seconds
        setTimeout(function() {
          copyButtonLabel.textContent = 'Copy Email Address';
          copyButton.style.backgroundColor = '';
          copyButton.style.color = '';
        }, 4000); // Revert after 3 seconds
      }).catch(function(err) {
        console.error('Failed to copy text: ', err);
      });
    });
});

// PLAYS EMBEDDED VIDEOS
document.addEventListener('DOMContentLoaded', () => {
  const videoContainers = document.querySelectorAll('.video-container');

  videoContainers.forEach(container => {
    container.addEventListener('click', () => {
      const videoId = container.dataset.videoId;
      if (videoId) {
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;

        container.innerHTML = '';
        container.appendChild(iframe);
      }
    });
  });
});

//ADD EASE IN ANIMATION AFTER PAGE LOADS
document.addEventListener('DOMContentLoaded', () => {
  const animatedElements = document.querySelectorAll('.hidden');
  
  // Increase initial delay to allow welcome animation setup
  setTimeout(() => {
    animatedElements.forEach((element, index) => {
      // Skip welcome-container as it has its own animation
      if (element.classList.contains('welcome-container')) {
        return;
      }
      
      setTimeout(() => {
        element.classList.remove('hidden');
        element.classList.add('fade-in');
        
        if (element.tagName === 'SECTION' || element.classList.contains('atf')) {
          element.classList.add('slide-up');
        }
      }, index * 50); // Stagger the animations
    });
  }, 300); // Increased delay to ensure no conflict with welcome animation
});

// WELCOME TEXT ANIMATION
function initWelcomeAnimation() {
  const welcomeTexts = [
    { text: 'WELCOME', lang: 'en' },
    { text: 'BIENVENUE', lang: 'fr' },
    { text: 'BIENVENIDO', lang: 'es' },
    { text: 'BEM-VINDO', lang: 'pt' },
    { text: 'WILLKOMMEN', lang: 'de' },
    { text: '欢迎', lang: 'zh' },
    { text: 'स्वागत है', lang: 'hi' },
    { text: 'ようこそ', lang: 'ja' }
  ];

  const welcomeContainer = document.querySelector('.welcome-container');
  let currentIndex = 0;

  function createWelcomeElement(text, lang) {
    const p = document.createElement('p');
    p.className = 'welcome-text display-large fw-medium text-color-gradient';
    p.textContent = text;
    p.lang = lang;
    return p;
  }

  async function animateWelcome() {
    const currentElement = welcomeContainer.querySelector('.welcome-text');
    const nextIndex = (currentIndex + 1) % welcomeTexts.length;
    const nextElement = createWelcomeElement(welcomeTexts[nextIndex].text, welcomeTexts[nextIndex].lang);

    // Position the new element at the bottom and hide it
    nextElement.style.transform = 'translateY(100%)';
    nextElement.style.opacity = '0';
    welcomeContainer.appendChild(nextElement);

    // Force a reflow
    nextElement.offsetHeight;

    // Wait for 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Start animations simultaneously
    currentElement.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out';
    nextElement.style.transition = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.8, 1), opacity 0.8s ease-out';

    // Push current element up and bring new element in
    currentElement.style.transform = 'translateY(-100%)';
    currentElement.style.opacity = '0';
    nextElement.style.transform = 'translateY(0)';
    nextElement.style.opacity = '1';

    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Clean up
    currentElement.remove();
    currentIndex = nextIndex;

    // Schedule next animation
    setTimeout(animateWelcome, 0);
  }

  // Start the animation loop
  setTimeout(animateWelcome, 0);
}
// Add to your existing DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
  // ... your existing code ...
  initWelcomeAnimation();
});

// CASE STUDY VISIBILITY AND PREVIOUS/NEXT NAVIGATION
const caseStudies = [
  {
    title: 'Creative Hub',
    slug: 'creative-hub',
    path: '/case-studies/creative-hub.html',
    isVisible: true
  },
  {
    title: 'Scheduled Designs',
    slug: 'scheduled-designs',
    path: '/case-studies/scheduled-designs.html',
    isVisible: true
  },
  {
    title: 'AfroTada Redesign',
    slug: 'afrotada-redesign',
    path: '/case-studies/afrotada-redesign.html',
    isVisible: true
  },
  {
    title: 'AfroTada Dashboard',
    slug: 'afrotada-dashboard',
    path: '/case-studies/afrotada-dashboard.html',
    isVisible: true
  },
  {
    title: 'Clana',
    slug: 'clana',
    path: '/case-studies/clana.html',
    isVisible: true
  },
  {
    title: 'YouTube In-App Sharing',
    slug: 'youtube-in-app-sharing',
    path: '/case-studies/youtube-in-app-sharing.html',
    isVisible: true
  },
  {
    title: 'RentSpot',
    slug: 'rentspot',
    path: '/case-studies/rentspot.html',
    isVisible: true
  },
  {
    title: 'Harvey Norman App',
    slug: 'harvey-norman-shopping-app',
    path: '/case-studies/harvey-norman-shopping-app.html',
    isVisible: false
  },
  {
    title: 'TheeZign',
    slug: 'theezign',
    path: '/case-studies/theezign.html',
    isVisible: false
  }
];

const leftArrowIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/></svg>
`;

const rightArrowIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/></svg>
`;

const scrollDownIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g fill="none" fill-rule="evenodd"><path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M12.707 15.707a1 1 0 0 1-1.414 0L5.636 10.05A1 1 0 1 1 7.05 8.636l4.95 4.95l4.95-4.95a1 1 0 0 1 1.414 1.414z"/></g></svg>
`;

const scrollUpIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g fill="none" fill-rule="evenodd"><path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M11.293 8.293a1 1 0 0 1 1.414 0l5.657 5.657a1 1 0 0 1-1.414 1.414L12 10.414l-4.95 4.95a1 1 0 0 1-1.414-1.414z"/></g></svg>
`;

function updateCaseStudyCards() {
  const caseStudyCards = document.querySelectorAll('[data-case-study-slug]');
  const projectsContainer = document.querySelector('.projects');

  caseStudyCards.forEach(card => {
    const caseStudy = caseStudies.find(item => item.slug === card.dataset.caseStudySlug);

    if (!caseStudy) return;

    card.classList.toggle('is-hidden', !caseStudy.isVisible);
  });

  if (!projectsContainer || caseStudyCards.length === 0) return;

  caseStudies.forEach(caseStudy => {
    const card = projectsContainer.querySelector(`[data-case-study-slug="${caseStudy.slug}"]`);

    if (!card) return;

    projectsContainer.appendChild(card);
  });
}

function addCaseStudyNavigation() {
  const currentPath = window.location.pathname;
  const visibleCaseStudies = caseStudies.filter(caseStudy => caseStudy.isVisible);
  const currentIndex = visibleCaseStudies.findIndex(caseStudy => caseStudy.path === currentPath);
  const main = document.querySelector('main');

  if (!main || currentIndex === -1) return;

  const previousCaseStudy = visibleCaseStudies[(currentIndex - 1 + visibleCaseStudies.length) % visibleCaseStudies.length];
  const nextCaseStudy = visibleCaseStudies[(currentIndex + 1) % visibleCaseStudies.length];
  const navigationSection = document.createElement('section');

  navigationSection.className = 'case-study-page-navigation-section';
  navigationSection.innerHTML = `
    <div class="normal-container">
      <div class="company-page-navigation">
        <a href="${previousCaseStudy.path}" class="secondary-button-medium inline-icon-button hover-lift scroll-reveal">
          ${leftArrowIcon}
          ${previousCaseStudy.title}
        </a>
        <a href="${nextCaseStudy.path}" class="secondary-button-medium inline-icon-button hover-lift scroll-reveal">
          ${nextCaseStudy.title}
          ${rightArrowIcon}
        </a>
      </div>
    </div>
  `;

  main.appendChild(navigationSection);
}

function addPageScrollToggle() {
  const currentPath = window.location.pathname;
  const isCompanyPage = currentPath.startsWith('/companies/');
  const isCaseStudyDetailPage = caseStudies.some(caseStudy => caseStudy.path === currentPath);

  if (!isCompanyPage && !isCaseStudyDetailPage) return;

  const scrollButton = document.createElement('button');

  scrollButton.type = 'button';
  scrollButton.className = 'page-scroll-toggle';
  document.body.appendChild(scrollButton);

  function updateScrollButton() {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const isNearBottom = scrollableHeight > 0 && window.scrollY > scrollableHeight * 0.8;

    scrollButton.dataset.scrollDirection = isNearBottom ? 'up' : 'down';
    scrollButton.setAttribute('aria-label', isNearBottom ? 'Scroll to top' : 'Scroll to bottom');
    scrollButton.innerHTML = isNearBottom ? scrollUpIcon : scrollDownIcon;
  }

  scrollButton.addEventListener('click', () => {
    const isScrollToTop = scrollButton.dataset.scrollDirection === 'up';

    window.scrollTo({
      top: isScrollToTop ? 0 : document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  });

  window.addEventListener('scroll', updateScrollButton, { passive: true });
  window.addEventListener('resize', updateScrollButton);
  updateScrollButton();
}

document.addEventListener('DOMContentLoaded', () => {
  updateCaseStudyCards();
  addCaseStudyNavigation();
  addPageScrollToggle();
});

// SCROLL REVEAL ANIMATION
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const scrollRevealCallback = (entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
    } else {
      entry.target.classList.remove('revealed');
    }
  });
};

const scrollObserver = new IntersectionObserver(scrollRevealCallback, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
  const revealElements = document.querySelectorAll('.scroll-reveal');
  revealElements.forEach(element => scrollObserver.observe(element));
});
