/* ==========================================================================
   Portfolio — JavaScript
   Vanilla ES6+. No libraries, no build step.

   1.  Config            — the few things you'll want to edit
   2.  Theme toggle      — light / dark, saved to localStorage
   3.  Mobile navigation
   4.  Header, scroll progress, back-to-top
   5.  Scrollspy         — highlights the active nav link
   6.  Scroll reveal     — IntersectionObserver
   7.  Typing effect
   8.  Animated counters
   9.  Skill bars
   10. Project filter
   11. Contact form
   12. Footer year
   ========================================================================== */

'use strict';

/* ==========================================================================
   1. CONFIG — edit these
   ========================================================================== */
const CONFIG = {
  // Roles that cycle in the hero headline
  roles: [
    'Laravel Full Stack Developer',
    'REST API Developer',
    'ERP Application Developer',
    'Backend Developer'
  ],

  // Shown on the page, and used as the fallback if sending fails
  contactEmail: 'sugumar.c3233@gmail.com',

  /* HOW THE CONTACT FORM SENDS
     A browser cannot send email by itself — there's no SMTP in JavaScript.
     To get messages delivered straight to your inbox you point the form at a
     relay service. You don't host anything; you just paste in a key.

     'web3forms' — RECOMMENDED. No account needed: put your email into
                   https://web3forms.com, they email you an access key,
                   paste it below. Free tier is 250 messages/month.

     'formspree' — Needs a free account at https://formspree.io. Create a
                   form, copy its endpoint URL below. Free tier is 50/month.

     'mailto'    — No service at all. Opens the visitor's own email app with
                   the message pre-filled. Nothing is sent automatically, and
                   it does nothing on devices with no mail app configured. */
  formMode: 'web3forms',

  web3formsAccessKey: '94e83887-f357-4bbb-9514-7c929b1cb277',
  formspreeEndpoint: 'https://formspree.io/f/YOUR_FORM_ID'
};

/* Small helpers */
const $  = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

/* ==========================================================================
   2. THEME TOGGLE
   The initial theme is applied by the inline script in <head> so there's
   no flash of the wrong colours. This just handles clicks.
   ========================================================================== */
(function initTheme() {
  const toggle = $('#themeToggle');
  if (!toggle) return;

  const root = document.documentElement;

  toggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';

    // Smooth the colour change without animating it on every page interaction
    document.body.classList.add('theme-switching');
    root.setAttribute('data-theme', next);

    try {
      localStorage.setItem('theme', next);
    } catch (e) {
      /* private browsing — theme just won't persist */
    }

    window.setTimeout(() => document.body.classList.remove('theme-switching'), 350);
  });

  // Follow the OS setting, but only while the visitor hasn't picked a theme themselves
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const onSystemChange = (e) => {
    let saved = null;
    try { saved = localStorage.getItem('theme'); } catch (err) { /* ignore */ }
    if (!saved) root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
  };

  if (media.addEventListener) media.addEventListener('change', onSystemChange);
  else if (media.addListener) media.addListener(onSystemChange); // older Safari
})();

/* ==========================================================================
   3. MOBILE NAVIGATION
   ========================================================================== */
(function initNav() {
  const toggle = $('#navToggle');
  const menu   = $('#navMenu');
  if (!toggle || !menu) return;

  const closeMenu = () => {
    menu.classList.remove('is-open');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('menu-open');
  };

  const openMenu = () => {
    menu.classList.add('is-open');
    toggle.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    document.body.classList.add('menu-open');
  };

  toggle.addEventListener('click', () => {
    menu.classList.contains('is-open') ? closeMenu() : openMenu();
  });

  // Close after tapping a link
  $$('.nav__link', menu).forEach((link) => link.addEventListener('click', closeMenu));

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      closeMenu();
      toggle.focus();
    }
  });

  // Close when tapping the dimmed backdrop
  document.addEventListener('click', (e) => {
    if (!menu.classList.contains('is-open')) return;
    if (!menu.contains(e.target) && !toggle.contains(e.target)) closeMenu();
  });

  // Reset if the viewport grows past the mobile breakpoint
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && menu.classList.contains('is-open')) closeMenu();
  });
})();

/* ==========================================================================
   4. HEADER, SCROLL PROGRESS, BACK TO TOP
   All three read scroll position, so they share one throttled listener.
   ========================================================================== */
(function initScrollUI() {
  const header   = $('#header');
  const progress = $('#scrollProgress');
  const toTop    = $('#toTop');
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;

    if (header) header.classList.toggle('is-scrolled', y > 20);
    if (toTop)  toTop.classList.toggle('is-visible', y > 500);

    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    }

    ticking = false;
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;

    if (typeof window.requestAnimationFrame === 'function') window.requestAnimationFrame(onScroll);
    else onScroll();
  };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  // The progress bar divides by scrollHeight, which changes when the layout reflows
  window.addEventListener('resize', requestUpdate, { passive: true });

  /* A background tab suspends requestAnimationFrame. If the page is scrolled
     while it's hidden, `ticking` latches on and the queued callback never
     runs, which would leave the header, progress bar and back-to-top button
     frozen. Clear the flag and resync whenever the tab comes back. */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    ticking = false;
    onScroll();
  });

  onScroll(); // set the correct state on load (e.g. after a refresh mid-page)

  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();

/* ==========================================================================
   5. SCROLLSPY — highlight the nav link for the section in view
   ========================================================================== */
(function initScrollspy() {
  const links = $$('.nav__link');
  const sections = links
    .map((link) => document.getElementById(link.getAttribute('href').slice(1)))
    .filter(Boolean);

  if (!sections.length) return;

  const setActive = (id) => {
    links.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + id);
    });
  };

  const observer = new IntersectionObserver((entries) => {
    // Pick the entry closest to the top of the viewport among those intersecting
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

    if (visible.length) setActive(visible[0].target.id);
  }, {
    rootMargin: '-45% 0px -50% 0px',
    threshold: 0
  });

  sections.forEach((section) => observer.observe(section));
})();

/* ==========================================================================
   6. SCROLL REVEAL
   ========================================================================== */
(function initReveal() {
  const items = $$('.reveal');
  if (!items.length) return;

  // If the browser is too old for IntersectionObserver, just show everything
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;

      // Stagger siblings slightly so groups cascade instead of popping in together
      entry.target.style.transitionDelay = (i * 80) + 'ms';
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  items.forEach((el) => observer.observe(el));

  /* Safety net.
     Everything with .reveal starts at opacity 0, so if the observer's first
     callback is delayed the page looks blank. That happens for real: a tab
     opened in the background isn't compositing, so intersections aren't
     computed until it's focused. Reveal whatever is already on screen
     directly, which covers the hero and never waits on the observer. */
  const revealInViewport = () => {
    items.forEach((el) => {
      if (el.classList.contains('is-visible')) return;

      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('is-visible');
        observer.unobserve(el);
      }
    });
  };

  window.addEventListener('load', revealInViewport);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) revealInViewport();
  });
})();

/* ==========================================================================
   7. TYPING EFFECT
   ========================================================================== */
(function initTyping() {
  const target = $('#typed');
  if (!target || !CONFIG.roles.length) return;

  // Respect a reduced-motion preference: show the first role and stop
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    target.textContent = CONFIG.roles[0];
    return;
  }

  const TYPE_SPEED = 90;
  const ERASE_SPEED = 45;
  const HOLD_TIME = 1600;

  let roleIndex = 0;
  let charIndex = 0;
  let erasing = false;

  const tick = () => {
    const role = CONFIG.roles[roleIndex];

    if (erasing) {
      charIndex--;
      target.textContent = role.slice(0, charIndex);

      if (charIndex === 0) {
        erasing = false;
        roleIndex = (roleIndex + 1) % CONFIG.roles.length;
        return window.setTimeout(tick, 350);
      }
      return window.setTimeout(tick, ERASE_SPEED);
    }

    charIndex++;
    target.textContent = role.slice(0, charIndex);

    if (charIndex === role.length) {
      erasing = true;
      return window.setTimeout(tick, HOLD_TIME);
    }
    return window.setTimeout(tick, TYPE_SPEED);
  };

  window.setTimeout(tick, 700);
})();

/* ==========================================================================
   8. ANIMATED COUNTERS
   ========================================================================== */
(function initCounters() {
  const counters = $$('.counter');
  if (!counters.length || !('IntersectionObserver' in window)) {
    counters.forEach((el) => {
      el.textContent = el.dataset.target + (el.dataset.suffix || '');
    });
    return;
  }

  const run = (el) => {
    const target = parseInt(el.dataset.target, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      el.textContent = Math.round(target * eased) + suffix;

      if (progress < 1) window.requestAnimationFrame(step);
    };

    window.requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      run(entry.target);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  counters.forEach((el) => observer.observe(el));
})();

/* ==========================================================================
   9. SKILL BARS
   ========================================================================== */
(function initSkillBars() {
  const bars = $$('.bar__fill');
  if (!bars.length) return;

  if (!('IntersectionObserver' in window)) {
    bars.forEach((bar) => { bar.style.width = bar.dataset.level + '%'; });
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;

      const bar = entry.target;
      window.setTimeout(() => { bar.style.width = bar.dataset.level + '%'; }, i * 120);
      obs.unobserve(bar);
    });
  }, { threshold: 0.4 });

  bars.forEach((bar) => observer.observe(bar));
})();

/* ==========================================================================
   10. PROJECT FILTER
   ========================================================================== */
(function initFilter() {
  const buttons = $$('.filter');
  const cards   = $$('.project');
  const empty   = $('#projectsEmpty');
  if (!buttons.length || !cards.length) return;

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;

      buttons.forEach((b) => {
        const isActive = b === button;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-pressed', String(isActive));
      });

      let shown = 0;

      cards.forEach((card) => {
        const match = filter === 'all' || card.dataset.category === filter;

        card.classList.toggle('is-filtered', !match);

        if (match) {
          shown++;
          // Cards revealed by a filter change may never have scrolled into
          // view, so make sure they're visible and replay the entrance.
          card.classList.add('is-visible');
          card.style.transitionDelay = (shown * 50) + 'ms';
          card.style.animation = 'none';
          void card.offsetWidth; // force reflow so the animation restarts
          card.style.animation = '';
        }
      });

      if (empty) empty.hidden = shown > 0;
    });
  });
})();

/* ==========================================================================
   11. CONTACT FORM
   ========================================================================== */
(function initContactForm() {
  const form = $('#contactForm');
  if (!form) return;

  const status = $('#formStatus');
  const submitButton = $('button[type="submit"]', form);

  const showError = (input, message) => {
    const field = input.closest('.field');
    const slot  = $('[data-error-for="' + input.id + '"]', form);

    if (field) field.classList.toggle('has-error', Boolean(message));
    if (slot) slot.textContent = message || '';

    return !message;
  };

  const validators = {
    name: (v) => (v.trim().length < 2 ? 'Please enter your name.' : ''),
    email: (v) => {
      if (!v.trim()) return 'Please enter your email address.';
      // Deliberately loose — real validation is the confirmation email
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'That doesn’t look like a valid email.';
    },
    subject: (v) => (v.trim().length < 3 ? 'Please add a short subject.' : ''),
    message: (v) => (v.trim().length < 10 ? 'Please write at least 10 characters.' : '')
  };

  const validateField = (input) => {
    const check = validators[input.name];
    return check ? showError(input, check(input.value)) : true;
  };

  // Clear the error as soon as the visitor starts fixing it
  $$('input, textarea', form).forEach((input) => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      const field = input.closest('.field');
      if (field && field.classList.contains('has-error')) validateField(input);
    });
  });

  const setStatus = (message, type) => {
    if (!status) return;
    status.textContent = message;
    status.className = 'form-status ' + (type === 'error' ? 'is-error' : 'is-success');
  };

  /* Swap only the label, never the whole button — the button also holds an
     inline <svg>, and writing to textContent would delete it for good. */
  const label = $('.btn__label', submitButton);
  const setBusy = (busy, text) => {
    submitButton.disabled = busy;
    if (label) label.textContent = text;
  };

  /* Each relay takes the same four fields, just shaped differently. */
  const RELAYS = {
    web3forms: {
      url: () => 'https://api.web3forms.com/submit',
      configured: () => /^[0-9a-f-]{20,}$/i.test(CONFIG.web3formsAccessKey),
      body: (d) => ({ access_key: CONFIG.web3formsAccessKey, from_name: d.name, ...d })
    },
    formspree: {
      url: () => CONFIG.formspreeEndpoint,
      configured: () => !CONFIG.formspreeEndpoint.includes('YOUR_FORM_ID'),
      body: (d) => d
    }
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot: a real visitor can't see this field, so anything in it is a bot.
    // Pretend it worked rather than telling the bot it was caught.
    const honeypot = form.elements.botcheck;
    if (honeypot && honeypot.checked) {
      setStatus('Thanks — your message has been sent.', 'success');
      form.reset();
      return;
    }

    const inputs = $$('input:not(.hp-field), textarea', form);
    const allValid = inputs.map(validateField).every(Boolean);

    if (!allValid) {
      setStatus('Please fix the highlighted fields and try again.', 'error');
      const firstBad = $('.field.has-error input, .field.has-error textarea', form);
      if (firstBad) firstBad.focus();
      return;
    }

    const data = {
      name:    $('#name', form).value.trim(),
      email:   $('#email', form).value.trim(),
      subject: $('#subject', form).value.trim(),
      message: $('#message', form).value.trim()
    };

    const relay = RELAYS[CONFIG.formMode];

    /* mailto: no service involved, so nothing is actually sent — the visitor's
       own mail app opens with the message ready for them to send. */
    if (!relay) {
      const body = 'Name: ' + data.name + '\nEmail: ' + data.email + '\n\n' + data.message;
      window.location.href = 'mailto:' + CONFIG.contactEmail +
        '?subject=' + encodeURIComponent(data.subject) +
        '&body=' + encodeURIComponent(body);
      setStatus('Opening your email app with the message ready to send…', 'success');
      return;
    }

    // Fail loudly during setup instead of swallowing every message silently
    if (!relay.configured()) {
      setStatus('This form isn’t connected yet. Email me at ' + CONFIG.contactEmail + '.', 'error');
      console.error(
        '[contact form] formMode is "' + CONFIG.formMode + '" but its key/endpoint is ' +
        'still the placeholder. Set it in CONFIG at the top of js/script.js.'
      );
      return;
    }

    setBusy(true, 'Sending…');

    try {
      const response = await fetch(relay.url(), {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(relay.body(data))
      });

      // Both services report failures in the body, not just the status code
      let payload = {};
      try { payload = await response.json(); } catch (err) { /* empty body is fine */ }

      if (!response.ok || payload.success === false) {
        throw new Error(payload.message || 'Request failed with status ' + response.status);
      }

      setStatus('Thanks — your message has been sent. I’ll reply soon.', 'success');
      form.reset();
      $$('.field.has-error', form).forEach((f) => f.classList.remove('has-error'));
    } catch (err) {
      setStatus('Couldn’t send that. Please email me directly at ' + CONFIG.contactEmail + '.', 'error');
      console.error('[contact form]', err);
    } finally {
      setBusy(false, 'Send Message');
    }
  });
})();

/* ==========================================================================
   12. FOOTER YEAR
   ========================================================================== */
(function initYear() {
  const el = $('#year');
  if (el) el.textContent = new Date().getFullYear();
})();
