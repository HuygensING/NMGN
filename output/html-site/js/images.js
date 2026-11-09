var MOBILE_IMAGE_BREAKPOINT = 768;

function isAsideImageScrollLocked() {
  var toggle = document.getElementById('asideImageLockToggle');
  return toggle ? toggle.getAttribute('aria-checked') === 'true' : false;
}

function setAsideImageScrollLocked(locked) {
  var toggle = document.getElementById('asideImageLockToggle');
  var control = document.getElementById('asideImageLockControl');
  var checked = locked ? 'true' : 'false';
  var label = locked ? 'Klik om mee te scrollen' : 'Klik om beeld vast te zetten';
  if (toggle) {
    toggle.setAttribute('aria-checked', checked);
    toggle.setAttribute('aria-label', label);
  }
  if (control) control.setAttribute('aria-checked', checked);
}

window.isAsideImageScrollLocked = isAsideImageScrollLocked;
window.setAsideImageScrollLocked = setAsideImageScrollLocked;

function updateAsideImageOrientation() {
  var asideImg = document.getElementById('asideImg');
  if (!asideImg || !asideImg.naturalWidth) return;
  asideImg.classList.toggle('aside-img-portrait', asideImg.naturalHeight > asideImg.naturalWidth);
}

function bindAsideImageOrientation(asideImg) {
  if (!asideImg) return;
  asideImg.classList.remove('aside-img-portrait');
  if (asideImg.complete && asideImg.naturalWidth) {
    updateAsideImageOrientation();
  } else {
    asideImg.addEventListener('load', updateAsideImageOrientation, { once: true });
  }
}

function openImageMobileOverlay(src, title, caption) {
  var overlay = document.getElementById('imageMobileOverlay');
  if (!overlay) return;
  var img = document.getElementById('imageMobileOverlayImg');
  var titleEl = document.getElementById('imageMobileOverlayTitle');
  var captionEl = document.getElementById('imageMobileOverlayCaption');
  if (!img || !titleEl || !captionEl) return;
  img.setAttribute('src', src);
  img.setAttribute('alt', title || '');
  titleEl.textContent = title || '';
  captionEl.innerHTML = caption || '';
  overlay.classList.remove('hidden');
  overlay.classList.add('flex');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  var closeBtn = document.getElementById('imageMobileOverlayClose');
  if (closeBtn) closeBtn.focus();
}

function closeImageMobileOverlay() {
  var overlay = document.getElementById('imageMobileOverlay');
  if (!overlay) return;
  overlay.classList.add('hidden');
  overlay.classList.remove('flex');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function updateAsideFromInlineButton(button, fromScroll) {
  if (!button) return;
  var imgSource = button.getAttribute('data-src');
  var imgTitle = button.getAttribute('data-title');
  var imgCaption = button.getAttribute('data-caption');
  if (!imgSource) return;

  if (window.innerWidth < MOBILE_IMAGE_BREAKPOINT) {
    if (!fromScroll) openImageMobileOverlay(imgSource, imgTitle, imgCaption);
    return;
  }

  var asideImg = document.getElementById('asideImg');
  if (asideImg && asideImg.getAttribute('src') === imgSource) return;

  var asideTitle = document.getElementById('asideImgTitle');
  var asideCaption = document.getElementById('asideCaption');
  if (asideImg) {
    asideImg.setAttribute('src', imgSource);
    bindAsideImageOrientation(asideImg);
  }
  if (asideTitle) asideTitle.innerHTML = imgTitle;
  if (asideCaption) asideCaption.innerHTML = imgCaption;
}

function showImageAside() {
  setAsideImageScrollLocked(true);
  updateAsideFromInlineButton(this, false);
}

window.updateAsideFromInlineButton = updateAsideFromInlineButton;

(function initInlineImages() {
  function setup() {
    var allInlineImages = document.querySelectorAll('.inlineImage');
    for (var i = 0; i < allInlineImages.length; i++) {
      allInlineImages[i].addEventListener('click', showImageAside);
    }
    bindAsideImageOrientation(document.getElementById('asideImg'));
    var lockToggle = document.getElementById('asideImageLockToggle');
    if (lockToggle) {
      lockToggle.addEventListener('click', function () {
        setAsideImageScrollLocked(!isAsideImageScrollLocked());
      });
    }
    var lockToggleText = document.getElementById('asideImageLockToggleText');
    if (lockToggleText) {
      lockToggleText.addEventListener('click', function () {
        setAsideImageScrollLocked(!isAsideImageScrollLocked());
      });
    }
    var overlay = document.getElementById('imageMobileOverlay');
    if (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeImageMobileOverlay();
      });
      var closeBtn = document.getElementById('imageMobileOverlayClose');
      if (closeBtn) {
        closeBtn.addEventListener('click', closeImageMobileOverlay);
      }
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var o = document.getElementById('imageMobileOverlay');
        if (o && !o.classList.contains('hidden')) closeImageMobileOverlay();
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
