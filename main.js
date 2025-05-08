const toggleInput = document.getElementById('theme-toggle');
const body = document.body;

body.classList.add('light-mode');

toggleInput.addEventListener('change', () => {
    if (toggleInput.checked) {
        body.classList.replace('light-mode', 'dark-mode');
    } else {
        body.classList.replace('dark-mode', 'light-mode');
    }
});
