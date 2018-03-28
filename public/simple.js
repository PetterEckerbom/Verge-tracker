//Makes sure its easy to see what URL you visit
window.onload = function(){
  document.getElementById('link').innerHTML = window.location.href;
  document.getElementById('link_href').href = window.location.href;
};
