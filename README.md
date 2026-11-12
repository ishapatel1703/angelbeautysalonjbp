# Angel Beauty Salon

A four-page, dependency-free static website built with semantic HTML, CSS and JavaScript. Its pages are Home (`/`), Services (`/services/`), Gallery (`/gallery/`) and Contact us (`/contact/`). Book appointment links lead to Contact us, and the legacy `/book-appointment/` URL redirects there.

## Run and build

Use Node.js 20 or later. Start the preview with `npm run dev`; it listens on port 3000 by default, and accepts a custom port through `PORT`. Run `npm run build` to copy the full static site into `dist/`.

## Automatic service sliders

The home page shows a separate, seamless image slider for each of the nine services. Neighboring rows move in opposite directions. Use the pause/resume control to stop or restart every row; the sliders respect the device’s reduced-motion preference.

## Salon photos

The supplied salon photos are in `public/images/`. The Gallery page displays the supplied photo collection with service-led alternating image and content sections; each service on Services automatically cycles through three or four service-specific photos. Home gives every service its own animated strip. Keep meaningful `alt` text when replacing photos.

## Contact and bookings

The Contact form is a front-end demo: it validates fields but does not send or store visitor details. WhatsApp chat is linked to +91 79999 24521. The salon street address and opening hours were not supplied, so visitors can ask for them over WhatsApp instead of seeing invented details.

## Project files

- `public/index.html` — Home page and nine individual alternating-direction service sliders.
- `public/services/index.html` — nine-service catalogue.
- `public/gallery/index.html` — salon photo gallery.
- `public/contact/index.html` — contact information placeholders and demo enquiry form.
- `public/book-appointment/index.html` — legacy redirect to Contact us.
- `public/styles.css` and `public/main.js` — shared responsive design and interactions.
- `public/images/` — optimized WebP salon photography supplied for this site.
- `public/_redirects` — legacy appointment route redirects for static hosting.
- `public/manus-routes.json` — declared public page routes.
- `server.mjs` and `scripts/build.mjs` — clean static route preview and build helpers.
