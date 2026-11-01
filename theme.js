/* ========================================================
   KAMAL DHARMA - CLIENT THEME MANAGER (PERSISTENT & HYDRATION-SAFE)
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

  var isUpdating = false;
  function applyTheme(theme) {
    if (isUpdating) return;
    isUpdating = true;
    try {
      var root = document.documentElement;
      var body = document.body;
      if (theme === 'light') {
        if (!root.classList.contains('light')) {
          root.classList.add('light');
        }
        if (body && !body.classList.contains('light')) {
          body.classList.add('light');
        }
        if (root.getAttribute('data-theme') !== 'light') {
          root.setAttribute('data-theme', 'light');
        }
      } else {
        root.classList.remove('light');
        if (body) {
          body.classList.remove('light');
        }
        if (root.getAttribute('data-theme') !== 'dark') {
          root.setAttribute('data-theme', 'dark');
        }
      }
    } finally {
      isUpdating = false;
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

  // Safeguard against Next.js / React client hydration wiping HTML classes
  if (typeof MutationObserver !== 'undefined') {
    var observer = new MutationObserver(function () {
      if (isUpdating) return;
      var desired = getPreferredTheme();
      var root = document.documentElement;
      if (desired === 'light' && (!root.classList.contains('light') || root.getAttribute('data-theme') !== 'light')) {
        applyTheme('light');
      } else if (desired === 'dark' && (root.classList.contains('light') || root.getAttribute('data-theme') === 'light')) {
        applyTheme('dark');
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    applyTheme(getPreferredTheme());
  });

  window.addEventListener('pageshow', function () {
    applyTheme(getPreferredTheme());
  });

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
