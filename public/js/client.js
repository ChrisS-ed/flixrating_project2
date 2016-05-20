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

      // console.log(that.data);
      // console.log(that.data.Error);
      // if (that.data.Response == "False") {
      //   console.log("***** MOVIE NOT FOUND!")
      //   return;
      // }

      callback();
    };
    request.send(null);
  }
}

window.onload = function() {

  document.getElementById("submit80s").disabled = true;
  input70sfilms();
  input80sfilms();

}

var input70sfilms = function() {

  var form = document.querySelector('#filmSearch70s');
  var input1 = document.querySelector('#film70sInput1');
  var input2 = document.querySelector('#film70sInput2');
  var input3 = document.querySelector('#film70sInput3');
  var new70sFilmsView = document.querySelector('#new70sFilmsDisplay');
  var stored70sFilmsView = document.querySelector('#stored70sFilms');
  var new70sfilms = [];
  var best70sfilms = JSON.parse(localStorage.getItem('best70sfilms')) || [];

  form.onsubmit = function(event) {
    grabFilms(); 
  }

  var grabFilms = function() {
    event.preventDefault();
    var filmTitle1 = input1.value;
    var filmTitle2 = input2.value;
    var filmTitle3 = input3.value;

    // catch input errors before API call
    var message = document.getElementById("message70s");
    message.innerHTML = "";
    try { 
      if (filmTitle1 == "" || filmTitle2 == "" || filmTitle3 == "") throw "film input field is empty";
      if (filmTitle1 == filmTitle2 || filmTitle2 == filmTitle3 || filmTitle1 == filmTitle3) throw "each film can only be input once";
    }
    catch(err) {
      message.innerHTML = "ERROR: " + err;
      return;
    }

    var firstFilm = new Film( filmTitle1 );
    var secondFilm = new Film( filmTitle2 );
    var thirdFilm = new Film( filmTitle3 );

    var counter = 3;
    var waitForFilms = function() {
      //console.log("COUNTER: ", counter);
      counter--;
      if (counter < 1) {
        console.log("GOT ALL THREE");

        console.log("BEFORE DISPLAY, FIRST FILM IS: ", firstFilm.data);       
        console.log("BEFORE DISPLAY, SECOND FILM IS: ", secondFilm.data);       
        console.log("BEFORE DISPLAY, THIRD FILM IS: ", thirdFilm.data);       
        if (filmErrorFound(firstFilm.data) || filmErrorFound(secondFilm.data) || filmErrorFound(thirdFilm.data)) {
          new70sfilms = [];
          return;
        }

        displayNewFilms();
        displayBestFilms();
        document.getElementById("submit70s").disabled = true;
        document.getElementById("submit80s").disabled = false;
      }
    }

    firstFilm.get( function() {
      var data = firstFilm.data;
      console.log("FIRST FILM: ", data );
      firstFilm.overallScore = calculateScore(1, data);
      new70sfilms.push(firstFilm);
      waitForFilms();
    });

    secondFilm.get( function() {
      var data = secondFilm.data;
      console.log("SECOND FILM: ",  data );
      secondFilm.overallScore = calculateScore(2, data);
      new70sfilms.push(secondFilm);
      waitForFilms();
    });

    thirdFilm.get( function() {
      var data = thirdFilm.data;
      console.log("THIRD FILM: ",  data );
      thirdFilm.overallScore = calculateScore(3, data);
      new70sfilms.push(thirdFilm);
      waitForFilms();
    });

  }

  var filmErrorFound = function(data) {
    // catch errors after API call
    console.log("CHECKING FOR ERRORS IN: ", data);
    console.log("RESPONSE: ", data.Response);
    var message = document.getElementById("message70s");
    message.innerHTML = "";
    try { 
      if (data.Response == "False") throw "film title not found";
    }
    catch(err) {
      message.innerHTML = "ERROR: " + err;
      return true;
    }
  }

  var displayNewFilms = function() {
    new70sfilms.sort(function(a, b) {
        return b.overallScore - a.overallScore;
    });
    // console.log("SORTED FILMS: ", new70sfilms);
    new70sFilmsView.innerHTML = '';
    var h4 = document.createElement('h4');
    h4.innerHTML = "<h4>Your top films of the 1970s:</h4>";
    new70sFilmsView.appendChild(h4);
    for (film in new70sfilms) {
      var ranking = parseInt(film) + 1;
      var li = document.createElement('li');
      li.innerHTML = "<h4>" + ranking + ".  " + new70sfilms[film].data.Title + ", overall score: " + new70sfilms[film].overallScore + "</h4>";
      new70sFilmsView.appendChild(li);
    }
  }

  var displayBestFilms = function() {

    console.log("BEST FILMS BEFORE UPDATE: ", best70sfilms);

    // if bestfilms array is empty, add new films
    if (best70sfilms.length === 0) {
      best70sfilms.push(new70sfilms[0]);
      best70sfilms.push(new70sfilms[1]);
      best70sfilms.push(new70sfilms[2]);
      // console.log(best70sfilms);
    }

    else {

      for (newFilm in new70sfilms) {
        
        // if film already exists in best70sfilms: update the film's overall score and sort array
        if (filmFoundInDatabase(new70sfilms[newFilm], newFilm, best70sfilms)) {
          console.log("FOUND NEW FILM IN BESTFILMS = ", newFilm, (newFilm == 0));
          best70sfilms.sort(function(a, b) {
            return b.overallScore - a.overallScore;
          });
        }

        else {
          // film not in best film list: add to list and sort
          console.log("FILM NOT FOUND IN DATABASE: SPLICE IN ", new70sfilms[newFilm]);
          best70sfilms.push(new70sfilms[newFilm]);
          best70sfilms.sort(function(a, b) {
          return b.overallScore - a.overallScore;
          });

        }
      }
    }
    

    console.log("BEST FILMS AFTER UPDATE: ", best70sfilms);

    // add film to films array and put into local storage
    localStorage.setItem('best70sfilms', JSON.stringify(best70sfilms));
    console.log("From local storage: ", JSON.parse(localStorage.getItem('best70sfilms')));
    

    stored70sFilmsView.innerHTML = '';
    var h4 = document.createElement('h4');
    h4.innerHTML = "<h4>Top films of the 1970s (based on all votes):</h4>";
    stored70sFilmsView.appendChild(h4);
    for (i=0; i<=2; i++) {
      var ranking = i + 1;
      var li = document.createElement('li');
      li.innerHTML = "<h4>" + ranking + ".  " + best70sfilms[i].data.Title + ", overall score: " + best70sfilms[i].overallScore + "</h4>";
      stored70sFilmsView.appendChild(li);
    }
  }

  var filmFoundInDatabase = function(film, rank, bestFilmList) {
  for (var i = bestFilmList.length - 1; i >= 0; i--) {
    console.log("CHECKING NEW FILM ", film.data.Title, " AGAINST ", bestFilmList[i].data.Title);
    if (film.data.Title === bestFilmList[i].data.Title) {
      console.log("FILM FOUND ", film.data.Title, "in best70sfilms, with rank", rank);
      console.log("RANK 0: ", (rank == 0));
      console.log("RANK 1: ", (rank == 1));
      console.log("RANK 2: ", (rank == 2));

      if (rank == 0) {
        console.log("new film = 1st: add 10");
        best70sfilms[i].overallScore += 10
      }
      else if (rank == 1) {
        console.log("new film = 2nd: add 7");
        best70sfilms[i].overallScore += 7
      }
      else if (rank == 2) {
        console.log("new film = 3rd: add 5");
        best70sfilms[i].overallScore += 5
      }

      return true;
    }
  }

  console.log("FILM ", film.data.Title, " NOT FOUND");
  return false;
  }

}

var input80sfilms = function() {

  var form = document.querySelector('#filmSearch80s');
  var input1 = document.querySelector('#film80sInput1');
  var input2 = document.querySelector('#film80sInput2');
  var input3 = document.querySelector('#film80sInput3');
  var new80sFilmsView = document.querySelector('#new80sFilmsDisplay');
  var stored80sFilmsView = document.querySelector('#stored80sFilms');
  var new80sfilms = [];
  var best80sfilms = JSON.parse(localStorage.getItem('best80sfilms')) || [];

  form.onsubmit = function(event) {
    grabFilms(); 
  }

  var grabFilms = function() {
    event.preventDefault();
    var filmTitle1 = input1.value;
    var filmTitle2 = input2.value;
    var filmTitle3 = input3.value;

    // catch input errors before API call
    var message = document.getElementById("message80s");
    message.innerHTML = "";
    try { 
      if (filmTitle1 == "" || filmTitle2 == "" || filmTitle3 == "") throw "film input field is empty";
      if (filmTitle1 == filmTitle2 || filmTitle2 == filmTitle3 || filmTitle1 == filmTitle3) throw "each film can only be input once";
    }
    catch(err) {
      message.innerHTML = "ERROR: " + err;
      return;
    }

    var firstFilm = new Film( filmTitle1 );
    var secondFilm = new Film( filmTitle2 );
    var thirdFilm = new Film( filmTitle3 );

    var counter = 3;
    var waitForFilms = function() {
      //console.log("COUNTER: ", counter);
      counter--;
      if (counter < 1) {
        console.log("GOT ALL THREE");
        displayNewFilms();
        displayBestFilms();
        document.getElementById("submit80s").disabled = true;
        document.getElementById("submit90s").disabled = false;
      }
    }

    firstFilm.get( function() {
      var data = firstFilm.data;
      //console.log( data );
      firstFilm.overallScore = calculateScore(1, data);
      new80sfilms.push(firstFilm);
      waitForFilms();
    });

    secondFilm.get( function() {
      var data = secondFilm.data;
      //console.log( data );
      secondFilm.overallScore = calculateScore(2, data);
      new80sfilms.push(secondFilm);
      waitForFilms();
    });

    thirdFilm.get( function() {
      var data = thirdFilm.data;
      //console.log( data );
      thirdFilm.overallScore = calculateScore(3, data);
      new80sfilms.push(thirdFilm);
      waitForFilms();
    });

  }

  var displayNewFilms = function() {
    new80sfilms.sort(function(a, b) {
        return b.overallScore - a.overallScore;
    });
    // console.log("SORTED FILMS: ", new80sfilms);
    new80sFilmsView.innerHTML = '';
    var h4 = document.createElement('h4');
    h4.innerHTML = "<h4>Your top films of the 1980s:</h4>";
    new80sFilmsView.appendChild(h4);
    for (film in new80sfilms) {
      var ranking = parseInt(film) + 1;
      var li = document.createElement('li');
      li.innerHTML = "<h4>" + ranking + ".  " + new80sfilms[film].data.Title + ", overall score: " + new80sfilms[film].overallScore + "</h4>";
      new80sFilmsView.appendChild(li);
    }
  }

  var displayBestFilms = function() {

    console.log("BEST FILMS BEFORE UPDATE: ", best80sfilms);

    // if bestfilms array is empty, add new films
    if (best80sfilms.length === 0) {
      best80sfilms.push(new80sfilms[0]);
      best80sfilms.push(new80sfilms[1]);
      best80sfilms.push(new80sfilms[2]);
      // console.log(best80sfilms);
    }

    else {

      for (newFilm in new80sfilms) {
        
        // if film already exists in best80sfilms: update the film's overall score and sort array
        if (filmFoundInDatabase(new80sfilms[newFilm], newFilm, best80sfilms)) {
          console.log("FOUND NEW FILM IN BESTFILMS = ", newFilm, (newFilm == 0));
          best80sfilms.sort(function(a, b) {
            return b.overallScore - a.overallScore;
          });
        }

        else {
          // film not in best film list: add to list and sort
          console.log("FILM NOT FOUND IN DATABASE: SPLICE IN ", new80sfilms[newFilm]);
          best80sfilms.push(new80sfilms[newFilm]);
          best80sfilms.sort(function(a, b) {
          return b.overallScore - a.overallScore;
          });

        }
      }
    }
    

    console.log("BEST FILMS AFTER UPDATE: ", best80sfilms);

    // add film to films array and put into local storage
    localStorage.setItem('best80sfilms', JSON.stringify(best80sfilms));
    console.log("From local storage: ", JSON.parse(localStorage.getItem('best80sfilms')));
    

    stored80sFilmsView.innerHTML = '';
    var h4 = document.createElement('h4');
    h4.innerHTML = "<h4>Top films of the 1980s (based on all votes):</h4>";
    stored80sFilmsView.appendChild(h4);
    for (i=0; i<=2; i++) {
      var ranking = i + 1;
      var li = document.createElement('li');
      li.innerHTML = "<h4>" + ranking + ".  " + best80sfilms[i].data.Title + ", overall score: " + best80sfilms[i].overallScore + "</h4>";
      stored80sFilmsView.appendChild(li);
    }
  }

  var filmFoundInDatabase = function(film, rank, bestFilmList) {
  for (var i = bestFilmList.length - 1; i >= 0; i--) {
    console.log("CHECKING NEW FILM ", film.data.Title, " AGAINST ", bestFilmList[i].data.Title);
    if (film.data.Title === bestFilmList[i].data.Title) {
      console.log("FILM FOUND ", film.data.Title, "in best80sfilms, with rank", rank);
      console.log("RANK 0: ", (rank == 0));
      console.log("RANK 1: ", (rank == 1));
      console.log("RANK 2: ", (rank == 2));

      if (rank == 0) {
        console.log("new film = 1st: add 10");
        best80sfilms[i].overallScore += 10
      }
      else if (rank == 1) {
        console.log("new film = 2nd: add 7");
        best80sfilms[i].overallScore += 7
      }
      else if (rank == 2) {
        console.log("new film = 3rd: add 5");
        best80sfilms[i].overallScore += 5
      }

      return true;
    }
  }

  console.log("FILM ", film.data.Title, " NOT FOUND");
  return false;
  }

}


var calculateScore = function(ranking, data) {
  var imdbRating = parseFloat(data.imdbRating);
  //console.log("IMDB: ", imdbRating);
  var tomatoRating = parseFloat(data.tomatoRating);
  //console.log("RT: ", tomatoRating);
  if (ranking == 1) {
    var rankingScore = 10
  }
  else if (ranking == 2) {
    var rankingScore = 7
  }
  else {var rankingScore = 5};
  //console.log("RankingScore: ", rankingScore);
  var overallScore = imdbRating + tomatoRating + rankingScore;
  //console.log("Overall Score: ", overallScore);
  return overallScore;
}
