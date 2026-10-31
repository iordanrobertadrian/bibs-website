/*
 * /join and /en/join: shows the join code from ?c= and points "Open in BIBS" at it
 * (bibs://join?c=...). The code is checked against the app's alphabet before it is shown, and
 * only ever inserted as text.
 */
(function () {
  var raw = '';
  try {
    raw = new URLSearchParams(window.location.search).get('c') || '';
  } catch (e) {
    return;
  }
  var compact = raw.toUpperCase().replace(/[\s-]/g, '');
  if (!/^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{8}$/.test(compact)) return;
  var code = compact.slice(0, 4) + '-' + compact.slice(4);

  var box = document.getElementById('join-code-box');
  var value = document.getElementById('join-code');
  var missing = document.getElementById('join-no-code');
  var open = document.getElementById('join-open');
  var lang = document.getElementById('join-lang');
  if (!box || !value) return;

  value.textContent = code;
  box.hidden = false;
  if (missing) missing.hidden = true;
  if (open) open.setAttribute('href', 'bibs://join?c=' + encodeURIComponent(code));
  if (lang) lang.setAttribute('href', lang.getAttribute('href') + '?c=' + encodeURIComponent(code));
})();
