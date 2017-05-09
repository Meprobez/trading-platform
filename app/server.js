var express = require('express');
var app = express();
var path = require('path');

/*All that we need to proxy requests*/
var proxy = require('express-http-proxy');

// New hostname+path as specified by question:
var apiProxy = proxy('http://devsharewallet.airsoftltd.com/', {
    proxyReqPathResolver: function (req, res) {
        return require('url').parse(req.baseUrl).path;
    }
});

//proxing all requests to http://devsharewallet.airsoftltd.com/
app.use("/trade.php/trader/connection/in", apiProxy); 
app.use("/trade.php/trader/connection/getPassword", apiProxy);
app.use("/trade.php/trader/connection/out", apiProxy);
app.use("/cdn*", apiProxy);

/*Serving static files*/
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname,'main')));
app.use(express.static(path.join(__dirname,'login-view'))); //Dont need to include Folder name
app.use(express.static(path.join(__dirname,'static'))); //in our HTML, only File name (inside Folder do insert)

//Entry point - index.html
app.get('/', entryPoint);
app.get('/trade.php/trader/connection/login', entryPoint);
app.get('/trade.php/trader/connection/login/forgotPassword', entryPoint);
app.get('/trade.php/trader', entryPoint);
function entryPoint(req, res) 
{
  var options = {
    root: __dirname,
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  };
 
  var fileName = "index.html";
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err);
    } else {
      console.log('Sent:', fileName);
    }
  });
};

app.listen(8080, function () {
  console.log('trading-platform listening on port 8080!')
});