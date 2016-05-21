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

  document.getElementById("submit80s").disabled = true;
  document.getElementById("submit90s").disabled = true;
  document.getElementById("submit00s").disabled = true;
  document.getElementById("submit10s").disabled = true;
  document.getElementById("refreshButton").disabled = true;
  //localStorage.clear();
  input70sfilms();
  input80sfilms();
  input90sfilms();
  input00sfilms();
  input10sfilms();

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

        console.log("BEFORE DISPLAY, FIRST FILM IS: ", filmTitle1, firstFilm.data);       
        console.log("BEFORE DISPLAY, SECOND FILM IS: ", filmTitle2, secondFilm.data);       
        console.log("BEFORE DISPLAY, THIRD FILM IS: ", filmTitle3, thirdFilm.data);       
        if (filmErrorFound(filmTitle1, [1970, 1979], firstFilm.data) || filmErrorFound(filmTitle2, [1970, 1979], secondFilm.data) || filmErrorFound(filmTitle3, [1970, 1979], thirdFilm.data)) {
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

  var filmErrorFound = function(filmTitle, [startDate, endDate], data) {
    // catch errors after API call
    console.log("CHECKING FOR ERRORS IN: ", data);
    console.log("RESPONSE: ", data.Response);
    var message = document.getElementById("message70s");
    message.innerHTML = "";
    try { 
      if (data.Response == "False") throw "film title '" + filmTitle + "' not found";
      if (data.Year == "N/A") throw "film year for '" + filmTitle + "' unavailable";
      if (data.imdbRating == "N/A" || data.tomatoRating == "N/A") throw "critic rating data for '" + filmTitle + "' unavailable";
      if (data.Year < startDate || data.Year > endDate) throw "film out of date range - '" + filmTitle + "' is from " + data.Year;
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

        console.log("BEFORE DISPLAY, FIRST FILM IS: ", filmTitle1, firstFilm.data);       
        console.log("BEFORE DISPLAY, SECOND FILM IS: ", filmTitle2, secondFilm.data);       
        console.log("BEFORE DISPLAY, THIRD FILM IS: ", filmTitle3, thirdFilm.data);       
        if (filmErrorFound(filmTitle1, [1980, 1989], firstFilm.data) || filmErrorFound(filmTitle2, [1980, 1989], secondFilm.data) || filmErrorFound(filmTitle3, [1980, 1989], thirdFilm.data)) {
          new80sfilms = [];
          return;
        }

        displayNewFilms();
        displayBestFilms();
        document.getElementById("submit80s").disabled = true;
        document.getElementById("submit90s").disabled = false;
      }
    }

    firstFilm.get( function() {
      var data = firstFilm.data;
      console.log("FIRST FILM: ", data );
      firstFilm.overallScore = calculateScore(1, data);
      new80sfilms.push(firstFilm);
      waitForFilms();
    });

    secondFilm.get( function() {
      var data = secondFilm.data;
      console.log("SECOND FILM: ",  data );
      secondFilm.overallScore = calculateScore(2, data);
      new80sfilms.push(secondFilm);
      waitForFilms();
    });

    thirdFilm.get( function() {
      var data = thirdFilm.data;
      console.log("THIRD FILM: ",  data );
      thirdFilm.overallScore = calculateScore(3, data);
      new80sfilms.push(thirdFilm);
      waitForFilms();
    });

  }

  var filmErrorFound = function(filmTitle, [startDate, endDate], data) {
    // catch errors after API call
    console.log("CHECKING FOR ERRORS IN: ", data);
    console.log("RESPONSE: ", data.Response);
    var message = document.getElementById("message80s");
    message.innerHTML = "";
    try { 
      if (data.Response == "False") throw "film title '" + filmTitle + "' not found";
      if (data.Year == "N/A") throw "film year for '" + filmTitle + "' unavailable";
      if (data.imdbRating == "N/A" || data.tomatoRating == "N/A") throw "critic rating data for '" + filmTitle + "' unavailable";
      if (data.Year < startDate || data.Year > endDate) throw "film out of date range - '" + filmTitle + "' is from " + data.Year;
    }
    catch(err) {
      message.innerHTML = "ERROR: " + err;
      return true;
    }
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

var input90sfilms = function() {

  var form = document.querySelector('#filmSearch90s');
  var input1 = document.querySelector('#film90sInput1');
  var input2 = document.querySelector('#film90sInput2');
  var input3 = document.querySelector('#film90sInput3');
  var new90sFilmsView = document.querySelector('#new90sFilmsDisplay');
  var stored90sFilmsView = document.querySelector('#stored90sFilms');
  var new90sfilms = [];
  var best90sfilms = JSON.parse(localStorage.getItem('best90sfilms')) || [];

  form.onsubmit = function(event) {
    grabFilms(); 
  }

  var grabFilms = function() {
    event.preventDefault();
    var filmTitle1 = input1.value;
    var filmTitle2 = input2.value;
    var filmTitle3 = input3.value;

    // catch input errors before API call
    var message = document.getElementById("message90s");
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

        console.log("BEFORE DISPLAY, FIRST FILM IS: ", filmTitle1, firstFilm.data);       
        console.log("BEFORE DISPLAY, SECOND FILM IS: ", filmTitle2, secondFilm.data);       
        console.log("BEFORE DISPLAY, THIRD FILM IS: ", filmTitle3, thirdFilm.data);       
        if (filmErrorFound(filmTitle1, [1990, 1999], firstFilm.data) || filmErrorFound(filmTitle2, [1990, 1999], secondFilm.data) || filmErrorFound(filmTitle3, [1990, 1999], thirdFilm.data)) {
          new90sfilms = [];
          return;
        }

        displayNewFilms();
        displayBestFilms();
        document.getElementById("submit90s").disabled = true;
        document.getElementById("submit00s").disabled = false;
      }
    }

    firstFilm.get( function() {
      var data = firstFilm.data;
      console.log("FIRST FILM: ", data );
      firstFilm.overallScore = calculateScore(1, data);
      new90sfilms.push(firstFilm);
      waitForFilms();
    });

    secondFilm.get( function() {
      var data = secondFilm.data;
      console.log("SECOND FILM: ",  data );
      secondFilm.overallScore = calculateScore(2, data);
      new90sfilms.push(secondFilm);
      waitForFilms();
    });

    thirdFilm.get( function() {
      var data = thirdFilm.data;
      console.log("THIRD FILM: ",  data );
      thirdFilm.overallScore = calculateScore(3, data);
      new90sfilms.push(thirdFilm);
      waitForFilms();
    });

  }

  var filmErrorFound = function(filmTitle, [startDate, endDate], data) {
    // catch errors after API call
    console.log("CHECKING FOR ERRORS IN: ", data);
    console.log("RESPONSE: ", data.Response);
    var message = document.getElementById("message90s");
    message.innerHTML = "";
    try { 
      if (data.Response == "False") throw "film title '" + filmTitle + "' not found";
      if (data.Year == "N/A") throw "film year for '" + filmTitle + "' unavailable";
      if (data.imdbRating == "N/A" || data.tomatoRating == "N/A") throw "critic rating data for '" + filmTitle + "' unavailable";
      if (data.Year < startDate || data.Year > endDate) throw "film out of date range - '" + filmTitle + "' is from " + data.Year;
    }
    catch(err) {
      message.innerHTML = "ERROR: " + err;
      return true;
    }
  }

  var displayNewFilms = function() {
    new90sfilms.sort(function(a, b) {
        return b.overallScore - a.overallScore;
    });
    // console.log("SORTED FILMS: ", new90sfilms);
    new90sFilmsView.innerHTML = '';
    var h4 = document.createElement('h4');
    h4.innerHTML = "<h4>Your top films of the 1990s:</h4>";
    new90sFilmsView.appendChild(h4);
    for (film in new90sfilms) {
      var ranking = parseInt(film) + 1;
      var li = document.createElement('li');
      li.innerHTML = "<h4>" + ranking + ".  " + new90sfilms[film].data.Title + ", overall score: " + new90sfilms[film].overallScore + "</h4>";
      new90sFilmsView.appendChild(li);
    }
  }

  var displayBestFilms = function() {

    console.log("BEST FILMS BEFORE UPDATE: ", best90sfilms);

    // if bestfilms array is empty, add new films
    if (best90sfilms.length === 0) {
      best90sfilms.push(new90sfilms[0]);
      best90sfilms.push(new90sfilms[1]);
      best90sfilms.push(new90sfilms[2]);
      // console.log(best90sfilms);
    }

    else {

      for (newFilm in new90sfilms) {
        
        // if film already exists in best90sfilms: update the film's overall score and sort array
        if (filmFoundInDatabase(new90sfilms[newFilm], newFilm, best90sfilms)) {
          console.log("FOUND NEW FILM IN BESTFILMS = ", newFilm, (newFilm == 0));
          best90sfilms.sort(function(a, b) {
            return b.overallScore - a.overallScore;
          });
        }

        else {
          // film not in best film list: add to list and sort
          console.log("FILM NOT FOUND IN DATABASE: SPLICE IN ", new90sfilms[newFilm]);
          best90sfilms.push(new90sfilms[newFilm]);
          best90sfilms.sort(function(a, b) {
          return b.overallScore - a.overallScore;
          });

        }
      }
    }
    
    console.log("BEST FILMS AFTER UPDATE: ", best90sfilms);

    // add film to films array and put into local storage
    localStorage.setItem('best90sfilms', JSON.stringify(best90sfilms));
    console.log("From local storage: ", JSON.parse(localStorage.getItem('best90sfilms')));
    

    stored90sFilmsView.innerHTML = '';
    var h4 = document.createElement('h4');
    h4.innerHTML = "<h4>Top films of the 1990s (based on all votes):</h4>";
    stored90sFilmsView.appendChild(h4);
    for (i=0; i<=2; i++) {
      var ranking = i + 1;
      var li = document.createElement('li');
      li.innerHTML = "<h4>" + ranking + ".  " + best90sfilms[i].data.Title + ", overall score: " + best90sfilms[i].overallScore + "</h4>";
      stored90sFilmsView.appendChild(li);
    }
  }

  var filmFoundInDatabase = function(film, rank, bestFilmList) {
  for (var i = bestFilmList.length - 1; i >= 0; i--) {
    console.log("CHECKING NEW FILM ", film.data.Title, " AGAINST ", bestFilmList[i].data.Title);
    if (film.data.Title === bestFilmList[i].data.Title) {
      console.log("FILM FOUND ", film.data.Title, "in best90sfilms, with rank", rank);
      console.log("RANK 0: ", (rank == 0));
      console.log("RANK 1: ", (rank == 1));
      console.log("RANK 2: ", (rank == 2));

      if (rank == 0) {
        console.log("new film = 1st: add 10");
        best90sfilms[i].overallScore += 10
      }
      else if (rank == 1) {
        console.log("new film = 2nd: add 7");
        best90sfilms[i].overallScore += 7
      }
      else if (rank == 2) {
        console.log("new film = 3rd: add 5");
        best90sfilms[i].overallScore += 5
      }

      return true;
    }
  }

  console.log("FILM ", film.data.Title, " NOT FOUND");
  return false;
  }

}

var input00sfilms = function() {

  var form = document.querySelector('#filmSearch00s');
  var input1 = document.querySelector('#film00sInput1');
  var input2 = document.querySelector('#film00sInput2');
  var input3 = document.querySelector('#film00sInput3');
  var new00sFilmsView = document.querySelector('#new00sFilmsDisplay');
  var stored00sFilmsView = document.querySelector('#stored00sFilms');
  var new00sfilms = [];
  var best00sfilms = JSON.parse(localStorage.getItem('best00sfilms')) || [];

  form.onsubmit = function(event) {
    grabFilms(); 
  }

  var grabFilms = function() {
    event.preventDefault();
    var filmTitle1 = input1.value;
    var filmTitle2 = input2.value;
    var filmTitle3 = input3.value;

    // catch input errors before API call
    var message = document.getElementById("message00s");
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

        console.log("BEFORE DISPLAY, FIRST FILM IS: ", filmTitle1, firstFilm.data);       
        console.log("BEFORE DISPLAY, SECOND FILM IS: ", filmTitle2, secondFilm.data);       
        console.log("BEFORE DISPLAY, THIRD FILM IS: ", filmTitle3, thirdFilm.data);       
        if (filmErrorFound(filmTitle1, [2000, 2009], firstFilm.data) || filmErrorFound(filmTitle2, [2000, 2009], secondFilm.data) || filmErrorFound(filmTitle3, [2000, 2009], thirdFilm.data)) {
          new00sfilms = [];
          return;
        }

        displayNewFilms();
        displayBestFilms();
        document.getElementById("submit00s").disabled = true;
        document.getElementById("submit10s").disabled = false;
      }
    }

    firstFilm.get( function() {
      var data = firstFilm.data;
      console.log("FIRST FILM: ", data );
      firstFilm.overallScore = calculateScore(1, data);
      new00sfilms.push(firstFilm);
      waitForFilms();
    });

    secondFilm.get( function() {
      var data = secondFilm.data;
      console.log("SECOND FILM: ",  data );
      secondFilm.overallScore = calculateScore(2, data);
      new00sfilms.push(secondFilm);
      waitForFilms();
    });

    thirdFilm.get( function() {
      var data = thirdFilm.data;
      console.log("THIRD FILM: ",  data );
      thirdFilm.overallScore = calculateScore(3, data);
      new00sfilms.push(thirdFilm);
      waitForFilms();
    });

  }

  var filmErrorFound = function(filmTitle, [startDate, endDate], data) {
    // catch errors after API call
    console.log("CHECKING FOR ERRORS IN: ", data);
    console.log("RESPONSE: ", data.Response);
    var message = document.getElementById("message00s");
    message.innerHTML = "";
    try { 
      if (data.Response == "False") throw "film title '" + filmTitle + "' not found";
      if (data.Year == "N/A") throw "film year for '" + filmTitle + "' unavailable";
      if (data.imdbRating == "N/A" || data.tomatoRating == "N/A") throw "critic rating data for '" + filmTitle + "' unavailable";
      if (data.Year < startDate || data.Year > endDate) throw "film out of date range - '" + filmTitle + "' is from " + data.Year;
    }
    catch(err) {
      message.innerHTML = "ERROR: " + err;
      return true;
    }
  }

  var displayNewFilms = function() {
    new00sfilms.sort(function(a, b) {
        return b.overallScore - a.overallScore;
    });
    // console.log("SORTED FILMS: ", new00sfilms);
    new00sFilmsView.innerHTML = '';
    var h4 = document.createElement('h4');
    h4.innerHTML = "<h4>Your top films of the 2000s:</h4>";
    new00sFilmsView.appendChild(h4);
    for (film in new00sfilms) {
      var ranking = parseInt(film) + 1;
      var li = document.createElement('li');
      li.innerHTML = "<h4>" + ranking + ".  " + new00sfilms[film].data.Title + ", overall score: " + new00sfilms[film].overallScore + "</h4>";
      new00sFilmsView.appendChild(li);
    }
  }

  var displayBestFilms = function() {

    console.log("BEST FILMS BEFORE UPDATE: ", best00sfilms);

    // if bestfilms array is empty, add new films
    if (best00sfilms.length === 0) {
      best00sfilms.push(new00sfilms[0]);
      best00sfilms.push(new00sfilms[1]);
      best00sfilms.push(new00sfilms[2]);
      // console.log(best00sfilms);
    }

    else {

      for (newFilm in new00sfilms) {
        
        // if film already exists in best00sfilms: update the film's overall score and sort array
        if (filmFoundInDatabase(new00sfilms[newFilm], newFilm, best00sfilms)) {
          console.log("FOUND NEW FILM IN BESTFILMS = ", newFilm, (newFilm == 0));
          best00sfilms.sort(function(a, b) {
            return b.overallScore - a.overallScore;
          });
        }

        else {
          // film not in best film list: add to list and sort
          console.log("FILM NOT FOUND IN DATABASE: SPLICE IN ", new00sfilms[newFilm]);
          best00sfilms.push(new00sfilms[newFilm]);
          best00sfilms.sort(function(a, b) {
          return b.overallScore - a.overallScore;
          });

        }
      }
    }
    
    console.log("BEST FILMS AFTER UPDATE: ", best00sfilms);

    // add film to films array and put into local storage
    localStorage.setItem('best00sfilms', JSON.stringify(best00sfilms));
    console.log("From local storage: ", JSON.parse(localStorage.getItem('best00sfilms')));
    

    stored00sFilmsView.innerHTML = '';
    var h4 = document.createElement('h4');
    h4.innerHTML = "<h4>Top films of the 2000s (based on all votes):</h4>";
    stored00sFilmsView.appendChild(h4);
    for (i=0; i<=2; i++) {
      var ranking = i + 1;
      var li = document.createElement('li');
      li.innerHTML = "<h4>" + ranking + ".  " + best00sfilms[i].data.Title + ", overall score: " + best00sfilms[i].overallScore + "</h4>";
      stored00sFilmsView.appendChild(li);
    }
  }

  var filmFoundInDatabase = function(film, rank, bestFilmList) {
  for (var i = bestFilmList.length - 1; i >= 0; i--) {
    console.log("CHECKING NEW FILM ", film.data.Title, " AGAINST ", bestFilmList[i].data.Title);
    if (film.data.Title === bestFilmList[i].data.Title) {
      console.log("FILM FOUND ", film.data.Title, "in best00sfilms, with rank", rank);
      console.log("RANK 0: ", (rank == 0));
      console.log("RANK 1: ", (rank == 1));
      console.log("RANK 2: ", (rank == 2));

      if (rank == 0) {
        console.log("new film = 1st: add 10");
        best00sfilms[i].overallScore += 10
      }
      else if (rank == 1) {
        console.log("new film = 2nd: add 7");
        best00sfilms[i].overallScore += 7
      }
      else if (rank == 2) {
        console.log("new film = 3rd: add 5");
        best00sfilms[i].overallScore += 5
      }

      return true;
    }
  }

  console.log("FILM ", film.data.Title, " NOT FOUND");
  return false;
  }

}

var input10sfilms = function() {

  var form = document.querySelector('#filmSearch10s');
  var input1 = document.querySelector('#film10sInput1');
  var input2 = document.querySelector('#film10sInput2');
  var input3 = document.querySelector('#film10sInput3');
  var new10sFilmsView = document.querySelector('#new10sFilmsDisplay');
  var stored10sFilmsView = document.querySelector('#stored10sFilms');
  var new10sfilms = [];
  var best10sfilms = JSON.parse(localStorage.getItem('best10sfilms')) || [];

  form.onsubmit = function(event) {
    grabFilms(); 
  }

  var grabFilms = function() {
    event.preventDefault();
    var filmTitle1 = input1.value;
    var filmTitle2 = input2.value;
    var filmTitle3 = input3.value;

    // catch input errors before API call
    var message = document.getElementById("message10s");
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

        console.log("BEFORE DISPLAY, FIRST FILM IS: ", filmTitle1, firstFilm.data);       
        console.log("BEFORE DISPLAY, SECOND FILM IS: ", filmTitle2, secondFilm.data);       
        console.log("BEFORE DISPLAY, THIRD FILM IS: ", filmTitle3, thirdFilm.data);       
        if (filmErrorFound(filmTitle1, [2010, 2019], firstFilm.data) || filmErrorFound(filmTitle2, [2010, 2019], secondFilm.data) || filmErrorFound(filmTitle3, [2010, 2019], thirdFilm.data)) {
          new10sfilms = [];
          return;
        }

        displayNewFilms();
        displayBestFilms();
        document.getElementById("submit10s").disabled = true;
        var message = document.getElementById("thankYou");
        message.innerHTML = "Thank you for taking part in FlixRating!";
        document.getElementById("refreshButton").disabled = false;
      }
    }

    firstFilm.get( function() {
      var data = firstFilm.data;
      console.log("FIRST FILM: ", data );
      firstFilm.overallScore = calculateScore(1, data);
      new10sfilms.push(firstFilm);
      waitForFilms();
    });

    secondFilm.get( function() {
      var data = secondFilm.data;
      console.log("SECOND FILM: ",  data );
      secondFilm.overallScore = calculateScore(2, data);
      new10sfilms.push(secondFilm);
      waitForFilms();
    });

    thirdFilm.get( function() {
      var data = thirdFilm.data;
      console.log("THIRD FILM: ",  data );
      thirdFilm.overallScore = calculateScore(3, data);
      new10sfilms.push(thirdFilm);
      waitForFilms();
    });

  }

  var filmErrorFound = function(filmTitle, [startDate, endDate], data) {
    // catch errors after API call
    console.log("CHECKING FOR ERRORS IN: ", data);
    console.log("RESPONSE: ", data.Response);
    var message = document.getElementById("message10s");
    message.innerHTML = "";
    try { 
      if (data.Response == "False") throw "film title '" + filmTitle + "' not found";
      if (data.Year == "N/A") throw "film year for '" + filmTitle + "' unavailable";
      if (data.imdbRating == "N/A" || data.tomatoRating == "N/A") throw "critic rating data for '" + filmTitle + "' unavailable";
      if (data.Year < startDate || data.Year > endDate) throw "film out of date range - '" + filmTitle + "' is from " + data.Year;
    }
    catch(err) {
      message.innerHTML = "ERROR: " + err;
      return true;
    }
  }

  var displayNewFilms = function() {
    new10sfilms.sort(function(a, b) {
        return b.overallScore - a.overallScore;
    });
    // console.log("SORTED FILMS: ", new10sfilms);
    new10sFilmsView.innerHTML = '';
    var h4 = document.createElement('h4');
    h4.innerHTML = "<h4>Your top films of the 2010s:</h4>";
    new10sFilmsView.appendChild(h4);
    for (film in new10sfilms) {
      var ranking = parseInt(film) + 1;
      var li = document.createElement('li');
      li.innerHTML = "<h4>" + ranking + ".  " + new10sfilms[film].data.Title + ", overall score: " + new10sfilms[film].overallScore + "</h4>";
      new10sFilmsView.appendChild(li);
    }
  }

  var displayBestFilms = function() {

    console.log("BEST FILMS BEFORE UPDATE: ", best10sfilms);

    // if bestfilms array is empty, add new films
    if (best10sfilms.length === 0) {
      best10sfilms.push(new10sfilms[0]);
      best10sfilms.push(new10sfilms[1]);
      best10sfilms.push(new10sfilms[2]);
      // console.log(best10sfilms);
    }

    else {

      for (newFilm in new10sfilms) {
        
        // if film already exists in best10sfilms: update the film's overall score and sort array
        if (filmFoundInDatabase(new10sfilms[newFilm], newFilm, best10sfilms)) {
          console.log("FOUND NEW FILM IN BESTFILMS = ", newFilm, (newFilm == 0));
          best10sfilms.sort(function(a, b) {
            return b.overallScore - a.overallScore;
          });
        }

        else {
          // film not in best film list: add to list and sort
          console.log("FILM NOT FOUND IN DATABASE: SPLICE IN ", new10sfilms[newFilm]);
          best10sfilms.push(new10sfilms[newFilm]);
          best10sfilms.sort(function(a, b) {
          return b.overallScore - a.overallScore;
          });

        }
      }
    }
    
    console.log("BEST FILMS AFTER UPDATE: ", best10sfilms);

    // add film to films array and put into local storage
    localStorage.setItem('best10sfilms', JSON.stringify(best10sfilms));
    console.log("From local storage: ", JSON.parse(localStorage.getItem('best10sfilms')));
    

    stored10sFilmsView.innerHTML = '';
    var h4 = document.createElement('h4');
    h4.innerHTML = "<h4>Top films of the 2010s (based on all votes):</h4>";
    stored10sFilmsView.appendChild(h4);
    for (i=0; i<=2; i++) {
      var ranking = i + 1;
      var li = document.createElement('li');
      li.innerHTML = "<h4>" + ranking + ".  " + best10sfilms[i].data.Title + ", overall score: " + best10sfilms[i].overallScore + "</h4>";
      stored10sFilmsView.appendChild(li);
    }
  }

  var filmFoundInDatabase = function(film, rank, bestFilmList) {
  for (var i = bestFilmList.length - 1; i >= 0; i--) {
    console.log("CHECKING NEW FILM ", film.data.Title, " AGAINST ", bestFilmList[i].data.Title);
    if (film.data.Title === bestFilmList[i].data.Title) {
      console.log("FILM FOUND ", film.data.Title, "in best10sfilms, with rank", rank);
      console.log("RANK 0: ", (rank == 0));
      console.log("RANK 1: ", (rank == 1));
      console.log("RANK 2: ", (rank == 2));

      if (rank == 0) {
        console.log("new film = 1st: add 10");
        best10sfilms[i].overallScore += 10
      }
      else if (rank == 1) {
        console.log("new film = 2nd: add 7");
        best10sfilms[i].overallScore += 7
      }
      else if (rank == 2) {
        console.log("new film = 3rd: add 5");
        best10sfilms[i].overallScore += 5
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
  var overallScore = (imdbRating + tomatoRating + rankingScore).toFixed(1);
  //console.log("Overall Score: ", overallScore);
  return overallScore;
}
