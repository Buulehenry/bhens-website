// =============================
// FILE: assets/js/main.js (ES5 safe)
// Bhens Enterprises — Global JS helpers
// =============================
(function() {
    var $ = function(sel, ctx) { return (ctx || document).querySelector(sel); };
    var $$ = function(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

    // ---- Plausible helper (safe)
    window.track = function(name, props) {
        try { if (window.plausible) window.plausible(name, props ? { props: props } : {}); } catch (e) {}
    };

    // ---- Smooth scroll for hash links (with navbar offset)
    function smoothScrollTo(hash) {
        var id = hash.replace('#', '');
        var target = document.getElementById(id);
        if (!target) return;
        var nav = $('.navbar');
        var offset = ((nav && nav.offsetHeight) || 80) + 12;
        var y = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }

    // Intercept in-page anchor clicks
    document.addEventListener('click', function(e) {
        var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
        if (!a) return;
        var href = a.getAttribute('href');
        if (href && href.length > 1) {
            e.preventDefault();
            history.pushState(null, '', href);
            smoothScrollTo(href);
            track('Anchor Jump', { to: href });
        }
    });

    // ---- Hover dropdowns on lg+ screens
    function enableHoverDropdowns() {
        var mq = window.matchMedia && window.matchMedia('(min-width: 992px)');
        var isDesktop = mq ? mq.matches : window.innerWidth >= 992;

        $$('.navbar .dropdown').forEach(function(dd) {
            var trigger = dd.querySelector('[data-bs-toggle="dropdown"]');
            if (!trigger || typeof bootstrap === 'undefined' || !bootstrap.Dropdown) return;

            var inst = bootstrap.Dropdown.getOrCreateInstance(trigger, { autoClose: 'outside' });

            if (dd.onmouseenter) dd.removeEventListener('mouseenter', dd.onmouseenter);
            if (dd.onmouseleave) dd.removeEventListener('mouseleave', dd.onmouseleave);

            if (isDesktop) {
                dd.onmouseenter = function() { inst.show(); };
                dd.onmouseleave = function() { inst.hide(); };
                dd.addEventListener('mouseenter', dd.onmouseenter);
                dd.addEventListener('mouseleave', dd.onmouseleave);
            } else {
                try { inst.hide(); } catch (e) {}
            }
        });
    }
    document.addEventListener('DOMContentLoaded', enableHoverDropdowns);
    window.addEventListener('resize', enableHoverDropdowns);

    // ---- Adjust layout vars
    function adjustLayout() {
        var nav = document.querySelector('.navbar.fixed-top');
        if (!nav) return;
        var h = nav.offsetHeight || 64;
        document.documentElement.style.setProperty('--nav-height', h + 'px');
    }
    document.addEventListener('DOMContentLoaded', adjustLayout);
    window.addEventListener('resize', adjustLayout);

    // ---- Active nav highlight (project pages & custom domains)
    function setActiveNav() {
        var pathname = location.pathname;
        var current = /\/$/.test(pathname) ? 'index.html' : pathname.split('/').pop();
        $$('.navbar .nav-link').forEach(function(a) {
            var raw = a.getAttribute('href') || '';
            var link = raw.replace(/^\//, '') || 'index.html';
            if (link === current) a.classList.add('active');
            else a.classList.remove('active');
        });
    }

    // ---- Collapse mobile nav after click
    document.addEventListener('click', function(e) {
        var navLink = e.target && e.target.closest ? e.target.closest('.navbar .nav-link, .navbar .btn') : null;
        if (!navLink) return;
        var nav = $('#nav');
        if (nav && nav.classList && nav.classList.contains('show')) {
            if (typeof bootstrap !== 'undefined' && bootstrap.Collapse) {
                var bsCollapse = bootstrap.Collapse.getInstance(nav) || new bootstrap.Collapse(nav, { toggle: false });
                if (bsCollapse) bsCollapse.hide();
            }
        }
    });

    // ---- Back to top button
    function ensureBackToTop() {
        if ($('#backToTop')) return;
        var btn = document.createElement('button');
        btn.id = 'backToTop';
        btn.className = 'btn btn-accent shadow-soft';
        btn.innerHTML = '<i class="fa fa-arrow-up"></i>';
        btn.title = 'Back to top';
        btn.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });
        document.body.appendChild(btn);
    }

    function toggleBackToTop() {
        var btn = $('#backToTop');
        if (!btn) return;
        btn.style.display = (window.scrollY > 400) ? 'inline-flex' : 'none';
    }

    // ---- Autofill footer year
    function setYear() {
        var y = $('#year');
        if (y) y.textContent = new Date().getFullYear();
    }

    // ---- Basic form UX + Plausible events
    function wireForm(formId, statusId, eventName) {
        var form = document.getElementById(formId);
        if (!form) return;
        var status = document.getElementById(statusId);
        form.addEventListener('submit', function() {
            track(eventName || 'Form Submit', { form: formId });
            if (status) {
                status.textContent = 'Sending…';
                status.className = 'small-muted';
            }
        });
    }

    // ---- Init on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        setActiveNav();
        ensureBackToTop();
        setYear();
        wireForm('quoteForm', 'quoteStatus', 'Quote Submit');
        wireForm('contactForm', 'contactStatus', 'Contact Submit');
        if (location.hash) setTimeout(function() { smoothScrollTo(location.hash); }, 50);
    });

    // ---- Scroll listeners
    window.addEventListener('scroll', toggleBackToTop);
})();