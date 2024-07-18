function loadHeaderAndFooter() {
    // Load header
    fetch('/header.html')
        .then(response => response.text())
        .then(data => {
            document.body.insertAdjacentHTML('afterbegin', data);
        });

    // Load footer
    fetch('/footer.html')
        .then(response => response.text())
        .then(data => {
            document.body.insertAdjacentHTML('beforeend', data);
        });
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', loadHeaderAndFooter);