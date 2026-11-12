function toggleVis(id, state, flexType) {

    let flex = 'flex';
    if ( (flexType = '') || (flexType === undefined)) {
        flex = flexType;
    }

    if (state == 'show') {
        document.getElementById(id).classList.remove('hidden');
        document.getElementById(id).classList.add(flex);
    } else {
        document.getElementById(id).classList.remove(flex);
        document.getElementById(id).classList.add('hidden');
    }
}

function openHoofdstukkenMenu() {
    var menu = document.getElementById('topMenuPop');
    var btn = document.getElementById('btnHoofdstukken');
    if (!menu || !btn) return;

    toggleVis('topMenuPop', 'show');
    btn.setAttribute('aria-expanded', 'true');

    var closeBtn = document.getElementById('btnCloseHoofdstukken');
    if (closeBtn) closeBtn.focus();

    document.addEventListener('keydown', hoofdstukkenMenuKeydown);
}

function closeHoofdstukkenMenu() {
    var menu = document.getElementById('topMenuPop');
    var btn = document.getElementById('btnHoofdstukken');
    if (!menu || !btn) return;

    toggleVis('topMenuPop', 'hide');
    btn.setAttribute('aria-expanded', 'false');
    btn.focus();

    document.removeEventListener('keydown', hoofdstukkenMenuKeydown);
}

function hoofdstukkenMenuKeydown(e) {
    var menu = document.getElementById('topMenuPop');
    if (!menu || menu.classList.contains('hidden')) return;

    if (e.key === 'Escape') {
        e.preventDefault();
        closeHoofdstukkenMenu();
        return;
    }

    if (e.key !== 'Tab') return;

    var focusable = menu.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
    }
}

function openAsideNav() {
    toggleVis('asideNavPanel', 'show');
    var wrapper = document.getElementById('showInhoud');
    if (wrapper) {
        wrapper.classList.remove('sticky');
        wrapper.classList.add('fixed', 'right-0');
    }
    var btn = document.getElementById('btnInhoudToggle');
    if (btn) {
        btn.textContent = '\u00D7';
        btn.setAttribute('onclick', 'closeAsideNav();');
        btn.setAttribute('aria-label', 'Sluit inhoudsopgave');
    }
}

function closeAsideNav() {
    toggleVis('asideNavPanel', 'hide');
    var wrapper = document.getElementById('showInhoud');
    if (wrapper) {
        wrapper.classList.remove('fixed', 'right-0');
        wrapper.classList.add('sticky');
    }
    var btn = document.getElementById('btnInhoudToggle');
    if (btn) {
        btn.textContent = 'Inhoud';
        btn.setAttribute('onclick', 'openAsideNav();');
        btn.setAttribute('aria-label', 'Toon inhoudsopgave');
    }
}

(function initAsideNavCloseOnLinkClick() {
    function handler() {
        if (window.innerWidth >= 1280) return;
        var aside = document.getElementById('asideNavPanel');
        if (!aside || aside.classList.contains('hidden')) return;
        closeAsideNav();
    }
    function setup() {
        var aside = document.getElementById('asideNavPanel');
        if (!aside) return;
        aside.addEventListener('click', function (e) {
            if (e.target.closest('a')) handler();
        });
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup);
    } else {
        setup();
    }
})();



