# bibs-site

Public website for the BIBS app: landing page plus the legal and support pages required by the
App Store and Google Play. Plain HTML, one stylesheet and three small scripts. No build step, no
cookies, no trackers, no external requests (fonts are self-hosted, no CDN).

Publisher and data controller: **Iordan Robert-Adrian PFA** (CIF 51961705, Nr. Reg. Com.
F202501276007, Bucuresti, Sector 2, Str. Baia de Arama, Nr. 1, Bl. Corp B2, Etaj 5, Ap. 28).

Romanian is the default language (written without diacritics, like the app); English lives
under `/en/`. Both language versions have the same sections and the same facts; the Romanian
version is the reference version.

```
index.html                     landing                          en/index.html
privacy/index.html             Politica de confidentialitate    en/privacy/
terms/index.html               Termeni si conditii              en/terms/
delete-account/index.html      Stergerea contului               en/delete-account/
support/index.html             Suport + intrebari frecvente     en/support/
child-safety/index.html        Standarde siguranta copiilor     en/child-safety/
join/index.html                Cod de intrare (noindex)         en/join/
404.html                       not found + fallback for app links opened without the app
assets/style.css               shared styles (light and dark via prefers-color-scheme)
assets/config.js               contact email addresses (single configuration point)
assets/link-fallback.js        "Open in the BIBS app" on /invite/*, /reset-password, /verify-email
assets/join.js                 shows the ?c= join code on /join and links "Open in BIBS" to bibs://join?c=...
assets/favicon.png             icon
assets/fonts/                  Geist (text) and Bricolage Grotesque (headings), latin subset, SIL OFL 1.1
assets/screens/                app screenshots (WebP, 660x1469), RO and *_en for the English page
assets/og.jpg, og-en.jpg       1200x630 share images for the landing pages
.well-known/apple-app-site-association   iOS universal links
.well-known/assetlinks.json              Android App Links
_headers                       Content-Type for .well-known + security headers (Cloudflare Pages / Netlify)
.nojekyll                      lets GitHub Pages publish the .well-known folder
robots.txt
```

Every page is a folder with an `index.html`, so the clean URLs `/privacy`, `/terms`,
`/delete-account`, `/support` (and `/en/...`) work on GitHub Pages, Cloudflare Pages and Netlify.
Requests without the trailing slash are redirected to the slash version on all three.

The site lives in `public/`; this README stays outside it, so it is never published.

Local preview: `npx serve public`. Opening files with `file://` works for reading, but not for
`404.html` (it uses root-relative links and must be served from the domain root).

---

## Before publishing

1. **Domain.** Everything assumes `https://bibs.app`. If the domain differs, update the app
   (`EXPO_PUBLIC_*` URLs, `app.json` associated domains and intent filters), the API
   (`PUBLIC_WEB_URL`) and the URLs in this README. The pages themselves use relative links.
2. **Contact addresses.** `support@bibs.app` and `privacy@bibs.app` must exist and receive mail
   before submission; store reviewers do write to them. See "Contact addresses".
3. **Store badges.** `index.html` and `en/index.html` show "coming soon" badges. Once the listings
   are live, replace them with the official Apple / Google badge artwork linked to the listings.
4. **`.well-known` placeholders.** Fill in the Apple Team ID and the Android signing-key
   fingerprint (see "Universal links / App Links").
5. **Service providers.** API hosting, file storage (S3-compatible) and the email (SMTP) provider
   are described generically in section 6 of both privacy pages, with the EU as location. Name the
   chosen providers there and keep the locations accurate; if any of them is outside the EEA,
   update section 7 (transfers).
6. **Paid plans.** While BIBS is in free beta, the landing pages, the Support FAQ ("Cat costa
   BIBS?") and Terms section 6 say so. When paid subscriptions start, update that wording and the
   "Ultima actualizare / Last updated" dates. Trial length (30 days, for new teams and for beta
   teams from the switch date) must match the API's `TRIAL_DAYS`.
7. **Legal review.** See "Points for legal review" at the end.

### Contact addresses

`assets/config.js` is the single configuration point:

```js
window.BIBS_CONFIG = {
  supportEmail: 'support@bibs.app',
  privacyEmail: 'privacy@bibs.app',
};
```

Elements with `data-email="support"` / `data-email="privacy"` are filled from it at load time.
The HTML also contains the addresses as a fallback for visitors without JavaScript, so after
changing `config.js`, replace them in the pages too:

```bash
grep -rl 'support@bibs\.app\|privacy@bibs\.app' --include=*.html --include=*.js public \
  | xargs sed -i 's/support@bibs\.app/NEW_SUPPORT_ADDRESS/g; s/privacy@bibs\.app/NEW_PRIVACY_ADDRESS/g'
```

Use the same support address in the app (`EXPO_PUBLIC_SUPPORT_EMAIL`), App Store Connect and
Play Console.

---

## Deploy

### Cloudflare Pages (recommended: honours `_headers`, so `.well-known` is served as JSON)

1. Push this folder to a Git repository.
2. Cloudflare dashboard -> Workers & Pages -> Create -> Pages -> Connect to Git -> select the repo.
3. Build settings: framework preset **None**, build command **empty**, build output directory
   `public`.
4. Deploy, then Custom domains -> add `bibs.app` (and `www.bibs.app` if used).
5. Check: `curl -I https://bibs.app/.well-known/apple-app-site-association` returns HTTP 200,
   `content-type: application/json` and no redirect.

Without Git: `npx wrangler pages deploy public --project-name bibs-site` from this folder.

### Netlify

Drag and drop the `public` folder at app.netlify.com/drop, or connect the repo with no build
command and publish directory `public`. `_headers` uses the same syntax.

### GitHub Pages

1. Push the contents of `public/` to the root of a repository, branch `main` (GitHub Pages
   publishes only `/` or `/docs`).
2. Settings -> Pages -> Deploy from a branch -> `main`, `/ (root)`.
3. Custom domain `bibs.app`; at the DNS provider add the GitHub Pages `A`/`AAAA` records for the
   apex and `CNAME www -> <user>.github.io`; enable **Enforce HTTPS**.
4. Limitations: GitHub Pages ignores `_headers` (no security headers, and
   `apple-app-site-association` is served as `application/octet-stream`). If universal-link
   validation fails, use Cloudflare Pages / Netlify. `.well-known` and `404.html` only work with a
   custom domain at the root, not under `https://<user>.github.io/bibs-site/`.

---

## Universal links / App Links

The app handles `https://bibs.app` and `https://www.bibs.app` for `/invite/*`, `/join`, `/reset-password`
and `/verify-email`. The API builds these links from `PUBLIC_WEB_URL`, which must be the site's
domain.

- `.well-known/apple-app-site-association`: replace `TEAMID` with the 10-character Apple Team ID
  (developer.apple.com -> Membership), e.g. `ABCDE12345.app.bibs.mobile`.
- `.well-known/assetlinks.json`: replace the placeholder with the SHA-256 fingerprint of the app
  signing key (Play Console -> Test and release -> App integrity -> App signing key certificate).
  Add the upload key fingerprint as well if builds signed with it are installed outside Play.
- Both files must be served with HTTP 200, `application/json` and no redirect, on every hostname
  the app declares (Apple does not follow redirects). Serve the same deployment on `www` rather
  than redirecting it, or remove `www` from the app configuration. Verify with Google's
  [Statement List tester](https://developers.google.com/digital-asset-links/tools/generator).
- `/join?c=CODE` (the link admins share with a team's join code) has its own page, `join/`
  (and `en/join/`), which shows the code and an "Open in BIBS" button (`bibs://join?c=...`).
- Without the app (or on desktop) the other links land on `404.html`, which shows an
  "Open in the BIBS app" button (`bibs://...`) and a link to the landing page. Test once on a
  real device.

---

## Store URLs

### App Store Connect

| Field | Value |
| --- | --- |
| Privacy Policy URL | `https://bibs.app/privacy` |
| Support URL | `https://bibs.app/support` |
| Marketing URL (optional) | `https://bibs.app/` |
| License Agreement | Apple Standard EULA (default). The Terms reference it. Because BIBS sells auto-renewable subscriptions, end the App Store description with `Terms of Use (EULA): https://bibs.app/terms` and `Privacy Policy: https://bibs.app/privacy` (Guideline 3.1.2). |
| User Privacy Choices URL (optional) | `https://bibs.app/delete-account` |
| App Review notes | Account deletion: More -> Your profile -> Account. Abuse reporting: More -> Report abuse or a problem. Provide a demo account. |

### Google Play Console

| Field | Value |
| --- | --- |
| Privacy policy | `https://bibs.app/privacy` |
| Data safety -> Delete account URL | `https://bibs.app/delete-account` |
| Store listing -> Website | `https://bibs.app/` |
| Store listing -> Email | the support address |
| Child safety standards (only for Social or Dating category) | `https://bibs.app/child-safety` |

The developer name shown in both stores should match the publisher named on the site
(Iordan Robert-Adrian PFA).

### App and API configuration

```
EXPO_PUBLIC_TERMS_URL=https://bibs.app/terms
EXPO_PUBLIC_PRIVACY_URL=https://bibs.app/privacy
EXPO_PUBLIC_ACCOUNT_DELETION_URL=https://bibs.app/delete-account
EXPO_PUBLIC_SUPPORT_EMAIL=support@bibs.app
PUBLIC_WEB_URL=https://bibs.app            # API
```

### Child safety standards page

Google Play's Child Safety Standards policy applies to apps in the Social or Dating category. BIBS
fits Sports, so the page is not strictly required; it is published anyway (it supports the
user-generated-content review on both stores and is ready if the category changes). Re-check the
Play Policy Center before submission, as the scope of this policy has been widening.

---

## Store data declarations

The app has no analytics, advertising, attribution or crash-reporting SDK and does not read the
advertising identifier. Revisit these declarations if such an SDK is added.

### Apple App Privacy

Data collected: yes. Tracking: none (no ATT prompt). Every type below is linked to the user, not
used for tracking, purpose App Functionality.

| Apple data type | In BIBS |
| --- | --- |
| Contact Info -> Name | Account name, nickname |
| Contact Info -> Email Address | Account email, invitee emails |
| User Content -> Photos or Videos | Profile picture, team logo (metadata stripped) |
| User Content -> Customer Support | Support and abuse-report emails |
| User Content -> Other User Content | Ideas, rating requests, announcements, team names, guest player names |
| Identifiers -> User ID | BIBS account ID, Google/Apple account identifiers |
| Identifiers -> Device ID | Push token |
| Purchases -> Purchase History | Team subscription state (via RevenueCat) |
| Other Data | Skill ratings, attendance and signups, match history |

Not collected: location, health, financial info, contacts, browsing/search history, sensitive
info, diagnostics, usage data, advertising data.

### Google Play Data safety

- Collects user data: yes. Encrypted in transit: yes. Deletion: in app and at
  `https://bibs.app/delete-account`.
- Shared with third parties: no (service providers acting on BIBS's behalf and user-initiated
  sharing within a team are not "sharing" under Play's definitions).
- Not a Families app; target audience 16+.

| Category -> type | Required / optional | Purposes |
| --- | --- | --- |
| Personal info -> Name | Required | App functionality, Account management |
| Personal info -> Email address | Required | App functionality, Account management, Developer communications (service emails) |
| Personal info -> User IDs | Required | App functionality, Account management, Fraud prevention / security |
| Photos and videos -> Photos | Optional | App functionality |
| Financial info -> Purchase history | Optional | App functionality |
| App activity -> Other user-generated content | Optional | App functionality |
| App activity -> Other actions | Optional | App functionality |
| Device or other IDs | Optional | App functionality |

Not collected: location, contacts, calendar, health and fitness, messages, audio, files, web
browsing, app info and performance, advertising ID. Data is stored (not processed ephemerally).

---

## Points for legal review

1. **Retention commitments that depend on configuration**: server logs at most 30 days (host log
   settings), backups overwritten within 30 days (database backup retention), support mail kept at
   most 2 years (mailbox routine). Configure them to match or adjust the text.
2. **Data kept after account deletion or indefinitely**: expired invitations are not purged
   automatically; archived teams and their history are kept without a set limit; names shown in
   past match lists and in team requests/votes remain after account deletion (disclosed on the
   deletion page, removal on request). Confirm the legitimate-interest balancing.
3. **Skill ratings** are opinions about a person entered by others; legal basis stated as contract
   and legitimate interest. Consider a short legitimate-interest assessment, and confirm that
   hiding ratings from players by default is compatible with the right of access.
4. **Guest players and invitees** have no account. The policy places the information duty on
   admins; consider whether the invitation email needs its own notice (Art. 14 GDPR), e.g. a link
   to the privacy policy in its footer.
5. **Minimum age 16** is stated in the privacy, terms and child-safety pages. Consider an explicit
   age confirmation at sign-up and consistent store age ratings.
6. **Liability cap** (amounts paid in 12 months; RON 100 during the free beta) and exclusions:
   enforceability against consumers (Law 193/2000 on unfair terms, Civil Code art. 1355).
7. **Right of withdrawal** (OUG 34/2014) for digital services bought through the stores, and the
   statement that requests go to Apple / Google.
8. **ADR wording**: ANPC and SAL are referenced; the EU ODR platform is described as discontinued
   since 20 July 2025 (Regulation (EU) 2024/3228). Confirm whether the SAL pictogram must be
   displayed on the site (ANPC Order 449/2022).
9. **International transfers**: confirm data processing agreements and the transfer mechanism
   (Data Privacy Framework or SCCs) with Expo (650 Industries), RevenueCat, MongoDB and the chosen
   hosting, storage and email providers.
10. **24-hour moderation commitment** (Terms section 9, child-safety page) requires the support
    mailbox to be read daily. Apple Guideline 1.2 expects content reporting and a way to block
    abusive users; BIBS offers in-app reporting, user-to-user blocking and admin removal.
11. **Subscriptions**: Terms describe monthly and yearly team subscriptions with prices shown in the
    store, a 30-day app trial per new team, a 30-day transition trial for beta teams and a
    founders offer for beta teams (conditions shown before purchase). Align with the products
    configured in App Store Connect / Play Console. The in-app paywall must show title, length,
    price and links to the Terms and Privacy Policy (Guideline 3.1.2).
12. **Beta clause**: 30 days' notice before paid plans and a 30-day trial counted from the switch
    date for existing teams. Keep in sync with the API configuration.
13. **Accounting retention** "5 or 10 years" (Law 82/1991): revenue comes from Apple / Google
    payouts, not directly from users; can be refined with the accountant.
14. **Publisher form**: the publisher is a PFA (not VAT registered, so the CIF has no RO prefix).
    Confirm the identification details required on the site and in the stores (Law 365/2002 on
    e-commerce, art. 5) and that the IP clause (Terms section 13) reflects ownership correctly.
15. **Reference language**: the English pages state that the Romanian version prevails.
16. **"Former player"** is the literal replacement name used in both languages after deletion.
17. **Public image URLs**: profile pictures and logos are reachable by anyone with the exact URL
    (disclosed). Signed URLs would remove the need for that statement.
18. **Terms acceptance**: sign-up should state that continuing means accepting the Terms and the
    Privacy Policy, with links to both.
