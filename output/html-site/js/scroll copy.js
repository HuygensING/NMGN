//viewport dimentions
var elem = (document.compatMode === "CSS1Compat") ?
document.documentElement :
document.body;
var vpHeight = elem.clientHeight;
var vpWidth = elem.clientWidth;
var switchpoint = .2*vpHeight;


var imgAndPos = [];


// if being scrollt set the right images
window.addEventListener("scroll", function (event) {
  //console.log(this.scrollY,getOffsetBottom(document.getElementById('subNavigation')).bottom);


    var scroll = this.scrollY;
    var msg;
    var loopAmount =imgAndPos.length-1

    for (var j = 0; j < loopAmount; j++) {
      if ((scroll >= (imgAndPos[j][1]-switchpoint)) && (scroll <= (imgAndPos[j+1][1]-switchpoint))) {
        if (scrollChange) {
          handleImage(imgAndPos[j][0]);
        }

      }
    }

    if (scroll > getOffsetBottom(document.getElementById('subNavigation')).bottom) {

      document.getElementById('mgSiteFixed').style.zIndex = 200;
      document.getElementById('theContent').style.zIndex = '1220 !important';

    } else {

      document.getElementById('mgSiteFixed').style.zIndex = 0;
      document.getElementById('theContent').style.zIndex = 10;
      theContent
    }


});





window.onload = function(){

  var tempStoreVal = 0;
  var yPosImage;

  for (var i = 0; i < imgArr.length; i++) {

    yPosImage = getOffset(document.getElementById(imgArr[i])).top;
    if (yPosImage != tempStoreVal) {
      imgAndPos.push([imgArr[i], yPosImage]);
    }
    tempStoreVal = yPosImage;
  }
  imgAndPos.push(['end', 1000000]);
  //console.log(imgAndPos);

  // place the first image
  handleImage(imgAndPos[0][0]);
  //handleImage('-170'+imgArr[0]);
};



// get top value of element
function getOffset(el) {
  //console.log(el);
  const rect = el.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY
  };
}


// get top value of element
function getOffsetBottom(el) {
  //console.log(el);
  const rect = el.getBoundingClientRect();
  return {
    bottom: rect.bottom + window.scrollY
  };
}
