# Gokul Dairy Farm — Website

A redesigned, professional, brand-led website for **Gokul Dairy Farm** (Karnal, Haryana) — a
supplier of premium dairy cattle (HF, Murrah Buffalo, Sahiwal, Tharparkar, Gir, Jersey, Kankrej,
plus bulls / heifers / calves) since 2001.

Static site — just HTML, CSS and vanilla JS. No build step, no dependencies.

## Features
- Premium agricultural brand design (deep green + gold), fully responsive (mobile-first).
- **7-language switcher** with proper hand-written translations: English, हिन्दी, मराठी, தமிழ், ಕನ್ನಡ, తెలుగు, ગુજરાતી. Choice is remembered in the browser.
- Sections: hero, trust stats, about, breeds (8 cards), why-us, how-it-works, reviews, contact + map, footer.
- WhatsApp + Call buttons everywhere, floating WhatsApp button, contact form, Google Maps embed.
- SEO: title/meta/Open Graph + LocalBusiness JSON-LD structured data.

## File structure
```
gokul-dairy-farm/
├── index.html        # all page content (English text + data-i18n keys)
├── css/styles.css    # all styling
├── js/i18n.js        # the 7-language dictionary + language switcher
├── js/main.js        # nav, scroll animations, contact form
└── images/           # cattle breed photos
```

## ⚠️ Before going live — 3 quick to-dos

1. **Contact form key** — open `index.html`, find `YOUR_WEB3FORMS_ACCESS_KEY` and replace it with a
   free access key from https://web3forms.com (sign up with the client's email).
   *Until then the form safely falls back to opening WhatsApp with the enquiry pre-filled — no leads are lost.*

2. **Reviews** — the 4 testimonials in the Reviews section are realistic samples. Replace them with
   real Google reviews. Search `data-i18n="review.1.text"` etc. in `js/i18n.js` (update each language,
   or just keep English). Also point the "Read our Google reviews" button to the real Google listing URL.

3. **Photos** — images in `/images` are free-licensed stand-ins matched to each breed. Swap any file
   with the client's own photo using the **same filename** and it appears automatically. The hero uses
   `sahiwal-cow.jpg`; the About section uses `hf-cow.jpg`.

## Editing translations
All text lives in `js/i18n.js` as a dictionary keyed by language (`en`, `hi`, `mr`, `ta`, `kn`, `te`, `gu`).
Each visible string has a key (e.g. `"hero.title"`). Edit the value under the relevant language.
The English (`en`) block is the source of truth and the fallback if a key is missing in another language.

## Phone / address / social (currently set)
- Phone: +91 79000 00179, +91 77770 70991  ·  WhatsApp: +91 79000 00179
- Address: Kulvehri Road, Village Kunjpura, Near Shri Krishan Gopal Gaushala, Karnal – 132001, Haryana
- Instagram: @gokuldairyfarmkarnal · Facebook & YouTube (@gokuldairy5855) linked in footer
- Proprietor: Mr. Ravi
Update these in `index.html` (and the address/hours strings in `js/i18n.js`) if anything changes.

## Preview locally
From inside this folder run a static server, e.g.:
```
python3 -m http.server 8000
```
then open http://localhost:8000

## Deploy — already live on GitHub Pages
- **Repo:** https://github.com/sandeshkashyap63-cpu/gokul-dairy-farm
- **Live URL:** https://sandeshkashyap63-cpu.github.io/gokul-dairy-farm/

To publish updates: commit and `git push` — GitHub Pages rebuilds automatically in a minute or two.
Live at https://gokuldairyfarm.in — DNS + `CNAME` are already configured, GitHub Pages serves it over HTTPS.
