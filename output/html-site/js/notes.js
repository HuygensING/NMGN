let getNote = function() {
    // get noteNumber
    let noteNr = this.getAttribute("data-noteNumber");
    const contentEl = document.getElementById('notePopupContent')
    contentEl.innerHTML = document.getElementById('noteContent'+noteNr).innerHTML
    // Restore focusability: copied HTML may include tabindex="-1" from inline notes
    contentEl.querySelectorAll('a[href], button, input, select, textarea').forEach(function (el) {
      el.removeAttribute('tabindex')
    })
    document.getElementById('popupNoteNr').innerHTML = 'Noot ' + noteNr

    let positionHeight = this.getBoundingClientRect().top

    const popup = document.getElementById('notePopupBlock')
    if (window.matchMedia('(min-width: 1024px)').matches) {
      const noteOffset = document.getElementById('noteCol').getBoundingClientRect().top
      popup.style.top = (positionHeight - noteOffset - 10) + 'px'
    } else {
      popup.style.top = ''
    }
    popup.classList.add('flex')
    popup.classList.remove('hidden')
    popup.setAttribute('aria-hidden', 'false')
    
    // Store reference to triggering element for focus return
    popup.dataset.triggerElement = this.id || this.getAttribute('data-noteNumber')
    
    // Focus the close button for keyboard navigation
    const closeButton = popup.querySelector('button[aria-label="Sluit notitie"]')
    if (closeButton) {
      closeButton.focus()
    }

};

// Inline note content is only for popup copy; when not visible it must be ignored by screen reader and tab
function ignoreInlineNoteContent() {
  document.querySelectorAll('.note-inline').forEach(function (el) {
    el.setAttribute('aria-hidden', 'true')
    el.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])').forEach(function (focusable) {
      focusable.setAttribute('tabindex', '-1')
    })
  })
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ignoreInlineNoteContent)
} else {
  ignoreInlineNoteContent()
}

let elements = document.querySelectorAll('.noteRef')
for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener('click', getNote, false);
}


function closeNotePopUp() {
  const popup = document.getElementById('notePopupBlock')
  popup.classList.remove('flex')
  popup.classList.add('hidden')
  popup.setAttribute('aria-hidden', 'true')
  // Clear popup content so links inside are not in tab order or read by screen reader when closed
  const content = document.getElementById('notePopupContent')
  if (content) content.innerHTML = ''

  // Return focus to triggering element if available
  const triggerId = popup.dataset.triggerElement
  if (triggerId) {
    const triggerElement = document.getElementById(triggerId) || document.querySelector(`[data-noteNumber="${triggerId}"]`)
    if (triggerElement) {
      triggerElement.focus()
    }
  }
}

// Close popup on Escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    const popup = document.getElementById('notePopupBlock')
    if (!popup.classList.contains('hidden')) {
      closeNotePopUp()
    }
  }
})

// Focus trap: keep Tab inside popup so focus doesn't jump to bottom of page
function getFocusables(container) {
  const selector = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
  return Array.from(container.querySelectorAll(selector)).filter(function(el) {
    return el.offsetParent !== null && !el.hasAttribute('disabled')
  })
}

document.addEventListener('keydown', function(event) {
  const popup = document.getElementById('notePopupBlock')
  if (popup.classList.contains('hidden')) return
  if (event.key !== 'Tab') return

  const focusables = getFocusables(popup)
  if (focusables.length === 0) return

  const first = focusables[0]
  const last = focusables[focusables.length - 1]

  if (event.shiftKey) {
    if (document.activeElement === first) {
      event.preventDefault()
      last.focus()
    }
  } else {
    if (document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }
})

