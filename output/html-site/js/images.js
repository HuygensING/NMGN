var MOBILE_IMAGE_BREAKPOINT = 768;

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

function showImageAside() {
  var elem = this;
  var imgSource = elem.getAttribute('data-src');
  var imgTitle = elem.getAttribute('data-title');
  var imgCaption = elem.getAttribute('data-caption');

  if (window.innerWidth < MOBILE_IMAGE_BREAKPOINT) {
    openImageMobileOverlay(imgSource, imgTitle, imgCaption);
    return;
  }

  var asideImg = document.getElementById('asideImg');
  var asideTitle = document.getElementById('asideImgTitle');
  var asideCaption = document.getElementById('asideCaption');
  if (asideImg) asideImg.setAttribute('src', imgSource);
  if (asideTitle) asideTitle.innerHTML = imgTitle;
  if (asideCaption) asideCaption.innerHTML = imgCaption;
}

(function initInlineImages() {
  function setup() {
    var allInlineImages = document.querySelectorAll('.inlineImage');
    for (var i = 0; i < allInlineImages.length; i++) {
      allInlineImages[i].addEventListener('click', showImageAside);
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
