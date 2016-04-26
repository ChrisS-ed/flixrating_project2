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

  var form = document.querySelector('#filmSearch');
  var input = document.querySelector('#filmInput');
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
    var filmTitle = input.value;
    var currentFilm = new Film( filmTitle );
    console.log(currentFilm);

    currentFilm.get( function() {
      var data = currentFilm.data;
      console.log( data );
      var filmDisplay = "<h4>" + data.Title + "</h4>";
      filmView.innerHTML = filmDisplay;

      // add film to films array and put into local storage
        //  films.push(data);
        //  localStorage.setItem('films', JSON.stringify(films));
        //  console.log("From local storage: ", JSON.parse(localStorage.getItem('films'))[0].Title);
        // displayFilms();
      
    })

  }

  // displayFilms();

}

