var Film = function(filmTitle) {
  this.url = 'http://localhost:3000/films/' + filmTitle;
  this.data;
  this.overallScore = 0;
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
  var new70sFilmsView = document.querySelector('#new70sFilmsDisplay');
  // var storedFilmsView = document.querySelector('#storedFilms');
  var new70sfilms = [];

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
    //handleFirstFilm(handleSecondFilm)
    grabFilms()
  }

  var grabFilms = function() {
    event.preventDefault();
    var filmTitle1 = input1.value;
    var filmTitle2 = input2.value;
    var filmTitle3 = input3.value;
    var firstFilm = new Film( filmTitle1 );
    var secondFilm = new Film( filmTitle2 );
    var thirdFilm = new Film( filmTitle3 );

    firstFilm.get( function() {
      var data = firstFilm.data;
      console.log( data );
      firstFilm.overallScore = calculateScore(1, data);
      new70sfilms.push(firstFilm);
    });
    secondFilm.get( function() {
      var data = secondFilm.data;
      console.log( data );
      secondFilm.overallScore = calculateScore(2, data);
      new70sfilms.push(secondFilm);
    });
    thirdFilm.get( function() {
      var data = thirdFilm.data;
      console.log( data );
      thirdFilm.overallScore = calculateScore(3, data);
      new70sfilms.push(thirdFilm);
    });
  }

  // displayFilms();

  var handleFirstFilm = function(callback) {
    event.preventDefault();
    var filmTitle = input1.value;
    var currentFilm = new Film( filmTitle );
    console.log(currentFilm);

    currentFilm.get( function() {
      var data = currentFilm.data;
      console.log( data );
      //var filmDisplay = "<h4>" + data.Title + "</h4>";
      //filmView.innerHTML = filmDisplay;

      currentFilm.overallScore = calculateScore(1, data);
      console.log("FILM1: ", currentFilm);
      new70sfilms.push(currentFilm);

      console.log("IN FIRST FILM: ", new70sfilms);

      callback();

      // add film to films array and put into local storage
        //  films.push(data);
        //  localStorage.setItem('films', JSON.stringify(films));
        //  console.log("From local storage: ", JSON.parse(localStorage.getItem('films'))[0].Title);
        // displayFilms();
      
    })
  }

  var handleSecondFilm = function(callback) {
    console.log("IN handleSecondFilm");
    event.preventDefault();
    var filmTitle = input2.value;
    var currentFilm = new Film( filmTitle );
    console.log(currentFilm);

    currentFilm.get( function() {
      var data = currentFilm.data;
      console.log( data );
      //var filmDisplay = "<h4>" + data.Title + "</h4>";
      //filmView.innerHTML = filmDisplay;

      currentFilm.overallScore = calculateScore(2, data);
      new70sfilms.push(currentFilm);

      callback();

    })
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
      //var filmDisplay = "<h4>" + data.Title + "</h4>";
      //filmView.innerHTML = filmDisplay;

      currentFilm.overallScore = calculateScore(3, data);
      new70sfilms.push(currentFilm);
      console.log("new70sfilms: ", new70sfilms);
      //displayNewFilms(new70sfilms, new70sFilmsView);
    }, displayNewFilms())
  }

  var displayNewFilms = function(films, filmsView) {
    new70sfilms.sort(function(a, b) {
        return b.overallScore - a.overallScore;
    });
    console.log("SORTED FILMS: ", new70sfilms);
    //filmsView.innerHTML = '';
    for (film in new70sfilms) {
      //var data = films[film];
      var li = document.createElement('li');
      li.innerHTML = "<h4>" + new70sfilms[film].data.Title + "</h4>";
      new70sFilmsView.appendChild(li);
    }
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

// var displayNewFilms = function(films, filmsView) {
//   films.sort(function(a, b) {
//       return b.overallScore - a.overallScore;
//   });
//   console.log("SORTED FILMS: ", films);
//   //filmsView.innerHTML = '';
//   for (film in films) {
//     //var data = films[film];
//     var li = document.createElement('li');
//     li.innerHTML = "<h4>" + films[film].data.Title + "</h4>";
//     filmsView.appendChild(li);
//   }
// }

