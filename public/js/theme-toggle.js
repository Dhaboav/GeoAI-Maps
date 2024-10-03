document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('dark-toggle');

    // Helper function to apply theme
    function applyTheme(isDark) {
        document.documentElement.classList.toggle("dark", isDark);
        toggle.checked = isDark;
        localStorage.theme = isDark ? "dark" : "light";
    }

    // Determine initial theme state
    function getInitialTheme() {
        return localStorage.theme === "dark" || 
            (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }

    // Set initial state
    applyTheme(getInitialTheme());

    // Event listener for toggle
    toggle.addEventListener('change', () => {
        applyTheme(toggle.checked);
    });
});