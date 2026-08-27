# Personal Portfolio

A responsive developer portfolio built with **plain HTML, CSS and JavaScript**. No frameworks, no build step, no `npm install`. Open `index.html` and it runs.

```
Portfolio/
├── index.html          all the page content
├── css/
│   └── style.css       styling + light/dark theme tokens
├── js/
│   └── script.js       all interactivity Sugumar 
├── assets/
│   ├── profile.jpg     (add yours — falls back to initials if missing)
│   └── resume.pdf      (add yours — linked from the "Download CV" button)
└── README.md
```

---

## Run it

Double-click `index.html` — that's genuinely all it needs.

To serve it over HTTP instead (closer to how it'll behave once deployed), use whichever of these you have:

```bash
npx serve .
```

```bash
python -m http.server 5500
```

Then open the URL it prints.

---

## What's in it

| Feature | Where |
|---|---|
| Light / dark toggle, remembered in `localStorage` | `script.js` §2 |
| Follows your OS theme until you pick one manually | `script.js` §2 |
| Slide-in mobile menu (Esc / backdrop / link closes it) | `script.js` §3 |
| Sticky blurred header + reading progress bar | `script.js` §4 |
| Active nav link tracks the section you're reading | `script.js` §5 |
| Fade-up reveal animations on scroll | `script.js` §6 |
| Typing effect cycling your job titles | `script.js` §7 |
| Counters that count up when scrolled into view | `script.js` §8 |
| Skill bars that fill on scroll | `script.js` §9 |
| Project category filter | `script.js` §10 |
| Contact form with inline validation | `script.js` §11 |

Also: no flash of the wrong theme on load, keyboard-accessible throughout, a skip link, `prefers-reduced-motion` support, and a print stylesheet.

---

## Make it yours

Every spot that needs your details is marked `<!-- EDIT: ... -->` in `index.html`.

**1. Your name and titles**

Search `index.html` for `Your Name` and replace it (it appears in the title tag, meta tags, nav logo, hero, footer). Then change the initials in the avatar fallback:

```html
<span class="avatar-fallback" aria-hidden="true">YN</span>
```

The rotating job titles live in `js/script.js`:

```js
roles: [
  'Full Stack Developer',
  'Frontend Engineer',
  ...
]
```

**2. Your photo and CV**

Drop `profile.jpg` and `resume.pdf` into `assets/`. If `profile.jpg` isn't there, the avatar shows your initials instead of a broken image — so it never looks unfinished.

**3. Your links**

Replace the `href="https://github.com/"`, LinkedIn and Twitter URLs in the hero, and `you@example.com` everywhere (hero, about, contact section, and `CONFIG.contactEmail` in `script.js`).

**4. Your projects**

Each project is one `<article class="project">` block. Copy one and edit it. Two things matter:

- `data-category` must match a filter button's `data-filter` (`web`, `frontend`, `backend`)
- `project__thumb--a` through `--f` are the gradient headers, defined in `style.css`

To use a real screenshot instead of a gradient:

```html
<div class="project__thumb">
  <img src="assets/project-1.png" alt="Screenshot of Shopfront" />
</div>
```

**5. Skills**

The `data-level` attribute (0–100) drives the bar width. Change the visible percentage text to match:

```html
<div class="bar__top"><span>React.js</span><span>85%</span></div>
<div class="bar__track"><div class="bar__fill" data-level="85"></div></div>
```

**6. Colours**

Change two variables at the top of `style.css` and the whole site re-skins:

```css
:root {
  --accent:   #4f46e5;
  --accent-2: #06b6d4;
}
```

Dark mode uses its own lighter pair under `[data-theme="dark"]` — adjust both.

---

## Making the contact form actually send

**A browser cannot send email on its own.** There is no SMTP in JavaScript, so no amount of client-side code will deliver mail directly. Every "sends straight to my inbox" contact form points at a relay service that does the sending. You don't host anything — you paste in a key.

Set `formMode` in `js/script.js` to one of three:

### `web3forms` — recommended, currently active

No account needed. Go to [web3forms.com](https://web3forms.com), enter your email, and they email you an access key. Paste it in:

```js
formMode: 'web3forms',
web3formsAccessKey: 'your-key-here'
```

Free tier: 250 messages/month.

### `formspree`

Needs a free account at [formspree.io](https://formspree.io). Create a form, copy its endpoint:

```js
formMode: 'formspree',
formspreeEndpoint: 'https://formspree.io/f/xyzabcde'
```

Free tier: 50 messages/month.

### `mailto` — no service, nothing sent automatically

Opens the visitor's own email app with the message pre-filled; they still have to press send. Works with zero setup, but does nothing on a device with no mail app configured — which is most phones without Gmail set up, and most people using webmail in a browser. Fine as a fallback, weak as your only contact route.

**Already wired up for all modes:** loading state on the button, success and error messages, a hidden honeypot field that silently drops spam bots, and a clear console warning if you switch modes but forget to paste the key.

**Note on the key being public:** your access key or endpoint is visible in the page source. That's normal and by design for these services — the key only lets someone submit *to your form*, not read your mail. Both services filter spam on their end. If a form ever gets abused, rotate the key.

---

## Deploying

**GitHub Pages** — push the folder to a repo, then Settings → Pages → deploy from `main` / root.

**Netlify or Vercel** — drag the folder onto their dashboard. There's no build command; the publish directory is the root.

All paths are relative, so it works from a subdirectory (`username.github.io/portfolio/`) without changes.

---

## Before you publish

- [ ] Replaced every `Your Name`
- [ ] Real email, phone and social links
- [ ] `assets/profile.jpg` and `assets/resume.pdf` added
- [ ] Projects swapped for your own, with working demo/source links
- [ ] Experience and education updated
- [ ] Stat numbers in About are honest
- [ ] Checked both themes, and at mobile / tablet / desktop widths

## Browser support

Chrome, Edge, Firefox and Safari (current versions). Uses `IntersectionObserver`, CSS custom properties, `color-mix()` (with a fallback) and `aspect-ratio`. Older browsers degrade gracefully — animations are skipped, content still renders.
