var Film = function(filmTitle) {
  this.url = 'http://localhost:3000/films/' + filmTitle;
  this.data;
}

Film.prototype = {
  get: function( callback ) {
    var that = this;
    var request = new XMLHttpRequest();
    request.open('GET', this.url);
    request.onload = function() {
      that.data = JSON.parse( request.responseText );
      callback();
    };
    request.send(null);
  }
}

window.onload = function() {

  input70sfilms();

}

var input70sfilms = function() {

  var form = document.querySelector('#filmSearch70s');
  var input1 = document.querySelector('#film70sInput1');
  var input2 = document.querySelector('#film70sInput2');
  var input3 = document.querySelector('#film70sInput3');
  var filmView = document.querySelector('#filmDisplay');
  // var storedFilmsView = document.querySelector('#storedFilms');

  // var films = JSON.parse(localStorage.getItem('films')) || [];

  // var displayFilms = function() {
  //   storedFilmsView.innerHTML = '';
  //   for (film in films) {
  //     var data = films[film];
  //     var li = document.createElement('li');
  //     li.innerHTML = "<h4>" + data.Title + "</h4>";
  //     storedFilmsView.appendChild(li);
  //   }
  // }

  form.onsubmit = function(event) {
    event.preventDefault();
    var filmTitle = input1.value;
    var currentFilm = new Film( filmTitle );
    console.log(currentFilm);

    currentFilm.get( function() {
      var data = currentFilm.data;
      console.log( data );
      var filmDisplay = "<h4>" + data.Title + "</h4>";
      filmView.innerHTML = filmDisplay;

      var overallScore1 = calculateScore(1, data);

      // add film to films array and put into local storage
        //  films.push(data);
        //  localStorage.setItem('films', JSON.stringify(films));
        //  console.log("From local storage: ", JSON.parse(localStorage.getItem('films'))[0].Title);
        // displayFilms();
      
    }, handleSecondFilm())
  }

  // displayFilms();
  var handleSecondFilm = function() {
    console.log("IN handleSecondFilm");
    event.preventDefault();
    var filmTitle = input2.value;
    var currentFilm = new Film( filmTitle );
    console.log(currentFilm);

    currentFilm.get( function() {
      var data = currentFilm.data;
      console.log( data );
      var filmDisplay = "<h4>" + data.Title + "</h4>";
      filmView.innerHTML = filmDisplay;

      var overallScore2 = calculateScore(2, data);

    }, handleThirdFilm())
  }

  var handleThirdFilm = function() {
    console.log("IN handleThirdFilm");
    event.preventDefault();
    var filmTitle = input3.value;
    var currentFilm = new Film( filmTitle );
    console.log(currentFilm);

    currentFilm.get( function() {
      var data = currentFilm.data;
      console.log( data );
      var filmDisplay = "<h4>" + data.Title + "</h4>";
      filmView.innerHTML = filmDisplay;

      var overallScore3 = calculateScore(3, data);
    })
  }

}

var calculateScore = function(ranking, data) {
  var imdbRating = parseFloat(data.imdbRating);
  console.log("IMDB: ", imdbRating);
  var tomatoRating = parseFloat(data.tomatoRating);
  console.log("RT: ", tomatoRating);
  if (ranking == 1) {
    var rankingScore = 10
  }
  else if (ranking == 2) {
    var rankingScore = 7
  }
  else {var rankingScore = 5};
  console.log("RankingScore: ", rankingScore);
  var overallScore = imdbRating + tomatoRating + rankingScore;
  console.log("Overall Score: ", overallScore);
  return overallScore;
}


