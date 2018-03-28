//Creates URL
function generate(){
  var fiat = document.getElementById("fiat").value;
  if(fiat == ""){
	  fiat="USD";
  }
  var xvg = document.getElementById("XVG").value;
  if(xvg == ""){
	  xvg="0";
  }
  window.location = "/"+fiat+"/"+xvg;
}
