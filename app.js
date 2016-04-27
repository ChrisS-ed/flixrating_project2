var express = require('express');
var app = express();
var expressLayouts = require('express-ejs-layouts');
var http = require('http');

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(expressLayouts);
app.use(express.static('public'));


app.get('/films', function(req, res) {
    res.render("films");
});

// app.get('/films', function(req, res) {
//   res.send('Hello World!') 
// });

app.get('/films/:filmTitle', function(request, response) {
    // In here we will make our HTTP request to the OMDB API

    http.get('http://www.omdbapi.com/?t='+ request.params.filmTitle + '&y=&plot=short&tomatoes=true&r=json', function(res) {
        
        var body = '';
        res.on('data', function(d) {
          console.log("DATA: ", d);
          body += d;
        });

        res.on('end', function() {
          // console.log("BODY: ", body);
          var film = JSON.parse( body );
          // console.log("FILM: ", film);
          // console.log("FILM TITLE: ", film.Title);
          response.send( film );
        })

    });

});

app.listen('3000', function() {
  console.log('Serving on port 3000')
});
