var express = require('express');
var path = require('path');
var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));

app.listen(5000,function(){
  console.log("server started port 5000");
});

//Upon visit to index, render the URL generator
app.get('/', function(req, res){
  res.render('generate')
});

//based on the currency key and amount we calculate values
app.get('/:currency/:amount',function(req, res){
  var request = require('request');
  //Initializes varibles
  var verge_price = "Error";
  var bitcoin_price = "Error";
  var LTC_price = "Error";
  var ETH_price = "Error";
  //Use request module to make a https request, looks a little cleaner than the https module
  request('https://www.binance.com/api/v1/ticker/allPrices', function (error, response, body) {
	  //Makes sure no error occured
      if (!error && response.statusCode == 200) {
		//convert response to JSON
        var info = JSON.parse(body);
		//Loops through the array and extracts relavant price values. (Could be done in cleaner ways)
        for(var i = 0; i < info.length; i++){
          if(info[i].symbol == "XVGBTC"){
            verge_price = info[i].price;
          }
          if(info[i].symbol == "BTCUSDT"){
            bitcoin_price = info[i].price;
          }
          if(info[i].symbol == "ETHBTC"){
            ETH_price = info[i].price;
          }
          if(info[i].symbol == "LTCBTC"){
            LTC_price = info[i].price;
          }
        }
      }
      var exvalue = 0;
      var type = req.params.currency;
      request('https://api.fixer.io/latest?base=USD&symbols='+type, function (error, response, body) {
          if (!error && response.statusCode == 200) {
			//since fixer.io api can interpret somewhat missspelled inputs, we turn it into string and extracts the numbers to not ruin this feature
            var value = JSON.parse(body);
            var result = JSON.stringify(value.rates);
            exvalue = result.replace(/[^0-9$.,]/g, '');
          }
          var procent = 0;
          request('https://www.binance.com/api/v1/ticker/24hr?symbol=XVGBTC', function (error, response, body) {
              if (!error && response.statusCode == 200) {
				 //Get Verge price history
                 procent = JSON.parse(body);
              }
			  //If response from fixer.io is invalid we use USD as fallback and make a few changes to values
              var use_USD = true;
              if(exvalue == ""){
                exvalue = 1;
                use_USD = false;
                type = "USD";
              }
			  //Calculates the diffrent values and saves in object
              var btc_value = verge_price * req.params.amount;
              var to_user = {
                satoshi: Math.round(verge_price / 0.00000001) + " Satoshi",
                verge_price: verge_price + " BTC",
                total_verge: Math.round(req.params.amount) + " XVG",
                total_value: btc_value.toFixed(6) + " BTC",
                total_LTC: (btc_value / LTC_price).toFixed(6) + " LTC",
                total_ETH: (btc_value / ETH_price).toFixed(6) + " ETH",
                USD_value: Math.round(btc_value * bitcoin_price) + " USD",
                currency_value: Math.round(btc_value * bitcoin_price * exvalue) + " " + type,
                change24h: Math.floor((btc_value * bitcoin_price * exvalue)-((btc_value * bitcoin_price * exvalue)/((100 + 1*procent.priceChangePercent)/100))),
                new_price: use_USD,
                type: type
              };
			  //renders the Main PUG template with the calculated values sent as a object
              res.render('Main',to_user);
          });
      });
  });
});
