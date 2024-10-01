document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('dark-toggle');

    // Set initial state based on localStorage or media query
    if (localStorage.theme === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        document.documentElement.classList.add("dark");
        toggle.checked = true; 
    } else {
        document.documentElement.classList.remove("dark");
        toggle.checked = false;
    }

    // Add event listener for toggle
    toggle.addEventListener('change', () => {
        if (toggle.checked) {
            document.documentElement.classList.add("dark");
            localStorage.theme = "dark";
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.theme = "light"; 
        }
    });
});