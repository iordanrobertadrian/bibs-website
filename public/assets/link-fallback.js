/*
 * Fallback for app links (/invite/<token>, /reset-password?token=..., /verify-email?token=...)
 * opened where the BIBS app is not installed or on a desktop. A static host cannot match these
 * paths, so they land on 404.html, which uses this script to offer "Open in the BIBS app"
 * through the bibs:// scheme (the same routes exist in the app).
 */
(function () {
  var path = window.location.pathname;
  if (!/^\/(invite\/|reset-password|verify-email)/.test(path)) return;
  var box = document.getElementById('app-link');
  var open = document.getElementById('app-link-open');
  var generic = document.getElementById('not-found');
  if (!box || !open) return;
  open.setAttribute('href', 'bibs://' + path.replace(/^\//, '') + window.location.search);
  box.hidden = false;
  if (generic) generic.hidden = true;
  document.title = 'BIBS';
})();
