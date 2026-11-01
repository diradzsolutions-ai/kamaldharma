/* ========================================================
   KAMAL DHARMA - CLIENT THEME MANAGER
   ======================================================== */
(function () {
  function getPreferredTheme() {
    try {
      var saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch (e) {}
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }

  function applyTheme(theme) {
    var root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
    }
  }

  var lastToggleTime = 0;
  window.__toggleTheme = function (event) {
    if (event) {
      if (event.preventDefault) event.preventDefault();
      if (event.stopPropagation) event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    }
    var now = Date.now();
    if (now - lastToggleTime < 300) {
      return false; // Prevent double invocation
    }
    lastToggleTime = now;

    var isCurrentlyLight = document.documentElement.classList.contains('light');
    var targetTheme = isCurrentlyLight ? 'dark' : 'light';
    applyTheme(targetTheme);
    try {
      localStorage.setItem('theme', targetTheme);
    } catch (err) {}
    return false;
  };

  // Synchronously apply initial theme before first render
  applyTheme(getPreferredTheme());

  // Listen for storage changes across tabs
  window.addEventListener('storage', function (e) {
    if (e.key === 'theme' && (e.newValue === 'light' || e.newValue === 'dark')) {
      applyTheme(e.newValue);
    }
  });

  // Global capture click listener so any click on .theme-toggle is handled reliably
  document.addEventListener(
    'click',
    function (e) {
      var btn = e.target.closest && e.target.closest('.theme-toggle');
      if (btn) {
        window.__toggleTheme(e);
      }
    },
    true // Capture phase
  );
})();
