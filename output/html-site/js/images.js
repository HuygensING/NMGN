let showImageAside = function() {
  let elem = this

  let imgSource = elem.getAttribute("data-src");
  let imgTitle = elem.getAttribute("data-title");
  let imgCaption = elem.getAttribute("data-caption");

  document.getElementById('asideImg').setAttribute('src',imgSource)
  document.getElementById('asideImgTitle').innerHTML = imgTitle
  document.getElementById('asideCaption').innerHTML = imgCaption


};

let allInlineImages = document.querySelectorAll('.inlineImage')
for (var i = 0; i < allInlineImages.length; i++) {
    allInlineImages[i].addEventListener('click', showImageAside, this);
}