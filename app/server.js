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
app.use("/trade*", apiProxy); //proxing all requests to http://devsharewallet.airsoftltd.com/
app.use("/cdn*", apiProxy);

app.use(express.static(path.join(__dirname,'login-view'))); //Dont need to include Folder name
app.use(express.static(path.join(__dirname,'static'))); //in our HTML, only File name (inside Folder do insert)
app.use(express.static(path.join(__dirname,'main')));
//Entry point - login.html
app.get('/', function (req, res) {
  var options = {
    root: __dirname + '/login-view/',
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  };
 

  var fileName = "login.html";
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err);
    } else {
      console.log('Sent:', fileName);
    }
  });
});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!')
});