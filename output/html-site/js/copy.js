function copyText(id) {
  var copyText = document.getElementById(id);

  copyText.select();
  copyText.setSelectionRange(0, 99999); /*For mobile devices*/

  navigator.clipboard.writeText(window.location.hostname+window.location.pathname +'#'+copyText.value);
}


function setFocus(id) {
  console.log(id);
  
  document.getElementById(id).focus();
}
