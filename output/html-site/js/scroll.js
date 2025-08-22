let focusRuler = setFocusRuler()
let currentHeader = document.querySelectorAll("h2,h3,h3,h4,h5")[0].getAttribute("id")
checkHeaderFocus()
setCurrentHeader(currentHeader)

window.onresize = function() { 
  focusRuler = setFocusRuler()
  
};


function setFocusRuler() {
  let screenHeight = window.screen.height
  return screenHeight/4
}


function checkHeaderFocus() {
  let allAboveArr = []
  const allEmen = document.querySelectorAll("h2,h3,h3,h4,h5");
  allEmen.forEach(header => {
    if (header.getBoundingClientRect().top < focusRuler) {
      allAboveArr.push(header)
    }
    
  });
  if (allAboveArr.length != 0) {
    setCurrentHeader(allAboveArr[allAboveArr.length - 1].getAttribute("id"))
  }
}


function checkImageFocus() {
  let allAboveArr = []
  const allEmen = document.querySelectorAll("imgFirstOfSet");
  allEmen.forEach(image => {
    if (image.getBoundingClientRect().top < focusRuler) {
      allAboveArr.push(image)
    }
    
  });
  if (allAboveArr.length != 0) {
    showImageAside(allAboveArr[allAboveArr.length - 1])
  }
}


window.onscroll = function() {
  checkHeaderFocus();
  checkImageFocus()
};


function setCurrentHeader(headerId) {
    const allEmen = document.querySelectorAll(".contentNavigationItem");
    allEmen.forEach(header => {
      header.classList.remove('font-bold')
    });
    document.getElementById('a'+headerId).classList.add('font-bold')
}
