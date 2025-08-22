function bigImageViewer() {
  
  let imgSrc = document.getElementById('asideImg').getAttribute('src')
  let activeImage = imgSrc.split("/").pop();
  document.getElementById("bigImageViewer").style.display= 'flex';
  document.getElementById('zoomFig').style.backgroundImage = 'url(\''+imgSrc.replace('-600/','-big/')+'\')';
  document.getElementById('zoomImg').setAttribute('src', imgSrc);

 fullImgSize('zoomImg')
  
}

//id="zoomFig"


function closeBigImage() {
  document.getElementById("bigImageViewer").style.display= 'none';
}

function zoom(e) {
  var zoomer = e.currentTarget;
  e.offsetX ? offsetX = e.offsetX : offsetX = e.touches[0].pageX;
  e.offsetY ? offsetY = e.offsetY : offsetX = e.touches[0].pageX;
  x = offsetX / zoomer.offsetWidth * 150;
  y = offsetY / zoomer.offsetHeight * 150;
  zoomer.style.backgroundPosition = x + '% ' + y + '%';
}

// set dimentions of the image
function imageDimentions(imagefile, placeId) {
  //console.log(imagefile);
  var elem = document.getElementById(imagefile);

  var elemImage = elem.getElementsByTagName("span")[0].getElementsByTagName("img")[0];
  var imgWidth = elemImage.naturalWidth;
  var imgHeight =elemImage.naturalHeight;
  var dimensionRatio = imgHeight / imgWidth;

  var placedImg = document.getElementById(placeId).getElementsByTagName("img")[0];

  //console.log(imagefile,imgHeight / imgWidth);

  if (dimensionRatio < .7) {
    placedImg.removeAttribute("class");
    placedImg.classList.add("imgFillW");

  }
  else {
    placedImg.removeAttribute("class");
    placedImg.classList.add("imgFillH");
  }

  //return imageId;
}



function fullImgSize(id) {


  document.getElementById(id);

  const img = document.getElementById(id);
  if (!img) return;

  function resize() {
    const { naturalWidth: w, naturalHeight: h } = img;
    if (!w || !h) return; // image not ready

    if (w > h) {
      // Landscape
      img.style.width = "100%";
      img.style.height = "auto";
    } else {
      // Portrait (or square treated as portrait)
      img.style.height = "100%";
      img.style.width = "auto";
    }
  }

  if (img.complete) {
    resize();
  } else {
    img.onload = resize;
  }
}