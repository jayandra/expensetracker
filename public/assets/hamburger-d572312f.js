function initializeHamburgerMenu() {
    const hamburgerButton = document.getElementById("hamburgerButton");
    const sidePanel = document.getElementById("sidePanel");

    if (hamburgerButton && sidePanel) {
        hamburgerButton.addEventListener("click", () => {
            sidePanel.classList.toggle("hidden");
        });
    }

    // Close the side panel if the user clicks anywhere outside the panel
    document.addEventListener('click', (e) => {
        if (!sidePanel.contains(e.target) && !hamburgerButton.contains(e.target)) {
            sidePanel.classList.add('hidden');
        }
    });
}

// Listen for the Turbo load event, which is triggered after every page change
document.addEventListener("turbo:load", () => {
    initializeHamburgerMenu();  // Re-initialize hamburger menu logic
});