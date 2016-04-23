var express = require('express');
var app = express();
var http = require('http');

app.get('/films', function(req, res) {
  res.send('Hello World!') 
});

app.listen('3000', function() {
  console.log('Serving on port 3000')
});

app.get('/films/:filmTitle', function(request, response) {
    // In here we will make our HTTP request to the OMDB API

    http.get('http://www.omdbapi.com/?t=FILMTITLE'+ request.params.filmTitle + '&y=&plot=short&r=json', function(res) {
        console.log(res.statusCode);

    });

});