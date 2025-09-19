// =============================
// FILE: assets/js/main.js
// Bhens Enterprises — Global JS helpers
// =============================

(function() {
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    // ---- Plausible helper (safe)
    window.track = function(name, props) {
        try { if (window.plausible) window.plausible(name, props ? { props } : {}) } catch (e) { /* noop */ }
    }

    // ---- Smooth scroll for hash links (with navbar offset)
    function smoothScrollTo(hash) {
        const target = document.getElementById(hash.replace('#', ''));
        if (!target) return;
        const nav = $('.navbar');
        const offset = (nav ? .offsetHeight || 80) + 12;
        const y = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }

    document.addEventListener('click', (e) => {
        const a = e.target.closest('a[href^="#"]');
        if (!a) return;
        const href = a.getAttribute('href');
        if (href && href.length > 1) {
            e.preventDefault();
            history.pushState(null, '', href);
            smoothScrollTo(href);
            track('Anchor Jump', { to: href });
        }
    });

    // Enable hover dropdowns on lg+ screens; keep clicks for mobile
    function enableHoverDropdowns() {
        const isDesktop = window.matchMedia('(min-width: 992px)').matches;
        document.querySelectorAll('.navbar .dropdown').forEach(dd => {
            const trigger = dd.querySelector('[data-bs-toggle="dropdown"]');
            if (!trigger) return;
            const inst = bootstrap.Dropdown.getOrCreateInstance(trigger, { autoClose: 'outside' });

            // Clean old listeners first
            dd.onmouseenter && dd.removeEventListener('mouseenter', dd.onmouseenter);
            dd.onmouseleave && dd.removeEventListener('mouseleave', dd.onmouseleave);

            if (isDesktop) {
                dd.onmouseenter = () => inst.show();
                dd.onmouseleave = () => inst.hide();
                dd.addEventListener('mouseenter', dd.onmouseenter);
                dd.addEventListener('mouseleave', dd.onmouseleave);
            } else {
                // mobile: rely on click/tap; ensure hidden on resize down
                inst.hide();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', enableHoverDropdowns);
    window.addEventListener('resize', enableHoverDropdowns);


    function adjustLayout() {
        const nav = document.querySelector('.navbar.fixed-top');
        if (!nav) return;
        const h = nav.offsetHeight || 64;
        document.documentElement.style.setProperty('--nav-height', h + 'px');
    }
    document.addEventListener('DOMContentLoaded', adjustLayout);
    window.addEventListener('resize', adjustLayout);


    // ---- Active nav highlight based on path
    function setActiveNav() {
        // normalize current path to just the file name (default index.html)
        const pathname = location.pathname;
        let current = pathname.endsWith('/') ? 'index.html' : pathname.split('/').pop();

        document.querySelectorAll('.navbar .nav-link').forEach(a => {
            const raw = a.getAttribute('href') || '';
            // normalize link too (strip leading slash)
            const link = raw.replace(/^\//, '') || 'index.html';
            a.classList.toggle('active', link === current);
        });
    }


    // ---- Collapse mobile nav after click
    document.addEventListener('click', (e) => {
        const navLink = e.target.closest('.navbar .nav-link, .navbar .btn');
        if (!navLink) return;
        const nav = $('#nav');
        if (nav ? .classList.contains('show')) {
            const bsCollapse = bootstrap.Collapse.getInstance(nav) || new bootstrap.Collapse(nav, { toggle: false });
            bsCollapse.hide();
        }
    });

    // ---- Back to top button
    function ensureBackToTop() {
        if ($('#backToTop')) return;
        const btn = document.createElement('button');
        btn.id = 'backToTop';
        btn.className = 'btn btn-accent shadow-soft';
        btn.innerHTML = '<i class="fa fa-arrow-up"></i>';
        btn.title = 'Back to top';
        btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        document.body.appendChild(btn);
    }

    function toggleBackToTop() {
        const btn = $('#backToTop');
        if (!btn) return;
        const show = window.scrollY > 400;
        btn.style.display = show ? 'inline-flex' : 'none';
    }

    // ---- Autofill footer year (if present)
    function setYear() {
        const y = $('#year');
        if (y) y.textContent = new Date().getFullYear();
    }

    // ---- Basic form UX + Plausible events
    function wireForm(formId, statusId, eventName) {
        const form = document.getElementById(formId);
        if (!form) return;
        const status = document.getElementById(statusId);
        form.addEventListener('submit', () => {
            track(eventName || 'Form Submit', { form: formId });
            if (status) {
                status.textContent = 'Sending…';
                status.className = 'small-muted';
            }
        });
    }

    // ---- Init on DOM ready
    document.addEventListener('DOMContentLoaded', () => {
        setActiveNav();
        ensureBackToTop();
        setYear();
        wireForm('quoteForm', 'quoteStatus', 'Quote Submit');
        wireForm('contactForm', 'contactStatus', 'Contact Submit');
        if (location.hash) setTimeout(() => smoothScrollTo(location.hash), 50);
    });

    // ---- Scroll listeners
    window.addEventListener('scroll', toggleBackToTop);
})();