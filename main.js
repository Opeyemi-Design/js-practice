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
    
    copyButton.addEventListener('click', function() {
      const email = this.getAttribute('data-email');
      
      // Copy email to clipboard
      navigator.clipboard.writeText(email).then(function() {
        // Change button text and style
        copyButton.textContent = 'Email Address Copied';
        copyButton.style.backgroundColor = 'var(--clr-neutral-500)';
        copyButton.style.color = 'var(--clr-neutral-600)';
        
        // Optionally, revert the button after a few seconds
        setTimeout(function() {
          copyButton.textContent = 'Copy Email Address';
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
  
  setTimeout(() => {
    animatedElements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.remove('hidden');
        element.classList.add('fade-in');
        
        if (element.tagName === 'SECTION') {
          element.classList.add('slide-up');
        }
      }, index * 200); // Stagger the animations
    });
  }, 100); // Small delay to ensure everything is ready
});

// Welcome text animation
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
    p.className = 'welcome-text display-large fw-bold text-color-gradient';
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

    // Wait for 2 seconds
    await new Promise(resolve => setTimeout(resolve, 4000));

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
  setTimeout(animateWelcome, 2000);
}
// Add to your existing DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
  // ... your existing code ...
  initWelcomeAnimation();
});
