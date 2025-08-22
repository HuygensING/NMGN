let getNote = function() {
    // get noteNumber
    let noteNr = this.getAttribute("data-noteNumber");
    // set note content
    document.getElementById('notePopupContent').innerHTML = document.getElementById('noteContent'+noteNr).innerHTML
    document.getElementById('popupNoteNr').innerHTML = noteNr
    
    let positionHeight = this.getBoundingClientRect().top
    
    const noteOffset = document.getElementById('noteCol').getBoundingClientRect().top
    document.getElementById('notePopupBlock').style.top = (positionHeight-noteOffset-10)+'px'
    document.getElementById('notePopupBlock').classList.add('flex')
    document.getElementById('notePopupBlock').classList.remove('hidden')


};

let elements = document.querySelectorAll('.noteRef')
for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener('click', getNote, false);
}


function closeNotePopUp() {
  document.getElementById('notePopupBlock').classList.remove('flex')
  document.getElementById('notePopupBlock').classList.add('hidden')
}

