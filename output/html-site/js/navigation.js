function loadNavContent() {
  const allEmen = document.querySelectorAll(".contentNavigation");
  allEmen.forEach(element => {
    element.innerHTML = document.getElementById('contentNavigationSource').innerHTML
  });
}

window.onload = function() {
  loadNavContent()
}