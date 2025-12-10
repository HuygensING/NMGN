let focusRuler = setFocusRuler()
const headerElementsInit = document.querySelectorAll("h2,h3,h4,h5")
let currentHeader = headerElementsInit.length > 0 ? headerElementsInit[0].getAttribute("id") : null
checkHeaderFocus()
if (currentHeader) {
  setCurrentHeader(currentHeader)
}

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
    console.log(allAboveArr[allAboveArr.length - 1].getAttribute("id"));
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
    if (!headerId) return;
    const allEmen = document.querySelectorAll(".contentNavigationItem");
    
    allEmen.forEach(header => {
      header.classList.remove('font-bold')
    });
    const target = document.getElementById('a'+headerId)
    if (target) {
      target.classList.add('font-bold')
    }
}
