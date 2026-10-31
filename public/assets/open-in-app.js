/*
 * /invite/<token>, /reset-password and /verify-email: the links in BIBS emails. On a phone with
 * the app, iOS and Android open the app before this page loads. Everywhere else this page points
 * "Open in BIBS" at the same path on the app's own scheme, token included. The token is only
 * ever put in the link, never shown or sent anywhere.
 */
(function () {
  var open = document.getElementById('open-app');
  if (!open) return;
  var path = window.location.pathname.replace(/^\/+|\/+$/g, '');
  if (!/^(invite\/[A-Za-z0-9_-]{8,200}|reset-password|verify-email)$/.test(path)) return;
  open.setAttribute('href', 'bibs://' + path + window.location.search);
})();
