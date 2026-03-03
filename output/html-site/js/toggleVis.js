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



