/*
 * BIBS site - contact addresses (single configuration point).
 * Elements with data-email="support" or data-email="privacy" are filled from here.
 * The HTML pages contain the same addresses as a no-JavaScript fallback; keep both in sync
 * (see README.md, "Contact addresses").
 */
window.BIBS_CONFIG = {
  supportEmail: 'support@bibs.app',
  privacyEmail: 'privacy@bibs.app',
};

(function () {
  var cfg = window.BIBS_CONFIG;
  var map = { support: cfg.supportEmail, privacy: cfg.privacyEmail };
  var nodes = document.querySelectorAll('[data-email]');
  for (var i = 0; i < nodes.length; i++) {
    var el = nodes[i];
    var addr = map[el.getAttribute('data-email')];
    if (!addr) continue;
    var subject = el.getAttribute('data-subject');
    el.textContent = addr;
    if (el.tagName === 'A') {
      el.setAttribute('href', 'mailto:' + addr + (subject ? '?subject=' + encodeURIComponent(subject) : ''));
    }
  }
  var year = document.querySelectorAll('[data-year]');
  for (var j = 0; j < year.length; j++) year[j].textContent = String(new Date().getFullYear());
})();
