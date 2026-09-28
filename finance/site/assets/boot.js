// Loaded before first paint (not deferred) so the saved theme applies with no flash.
// It is a file, not an inline script, because the CSP only allows script-src 'self'.
(function () {
  var theme = null;
  try { theme = localStorage.getItem('ff-theme'); } catch (e) { /* private mode */ }
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();
