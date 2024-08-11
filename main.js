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