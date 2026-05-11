function loadHeaderAndFooter() {
    // Load header
    fetch('/header.html')
        .then(response => response.text())
        .then(data => {
            document.body.insertAdjacentHTML('afterbegin', data);
            highlightActiveNavLink(); // Call this function after inserting the header
            // Dispatch a custom event when header is loaded
            document.dispatchEvent(new Event('headerLoaded'));
        });

    // Load footer
    fetch('/footer.html')
        .then(response => response.text())
        .then(data => {
            document.body.insertAdjacentHTML('beforeend', data);
        });
}

// Function to highlight active nav link
function highlightActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.primary-navigation .nav-list a');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        const isWorkRoute = linkPath === '/' && (currentPath === '/' || currentPath === '/index.html' || currentPath.startsWith('/companies/'));
        const isCaseStudiesRoute = linkPath === '/case-studies.html' && (currentPath === '/case-studies.html' || currentPath.startsWith('/case-studies/'));
        
        if (linkPath === currentPath || isWorkRoute || isCaseStudiesRoute) {
            if (link.classList.contains('primary-button-medium')) {
                link.classList.add('primary-active');
            } else {
                link.classList.add('secondary-active');
            }
        }
    });
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', loadHeaderAndFooter);
