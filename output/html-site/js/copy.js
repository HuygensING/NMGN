function copyText(id) {
  var copyText = document.getElementById('paragraphLink'+id);

  copyText.select();
  copyText.setSelectionRange(0, 99999); /*For mobile devices*/

  navigator.clipboard.writeText(window.location.hostname+window.location.pathname +'#'+copyText.value);

  document.getElementById('b_paragraphLink'+id).innerHTML = 'Link naar deze paragraaf gekopieerd naar klembord.'
}


function setFocus(id) {
  console.log(id);
  
  document.getElementById(id).focus();
}
