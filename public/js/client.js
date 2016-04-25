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
  // var storedBooksView = document.querySelector('#storedBooks');

  // var books = JSON.parse( localStorage.getItem('books') ) || [];

  // var displayBooks = function() {
  //   storedBooksView.innerHTML = '';

  //   for (book in books) {
  //     var data = books[book];
  //     var li = document.createElement('li');
  //     li.innerHTML = "<img src='" + data.cover.small + "'>" + data.title + '<button class="removeBook" data-id="' + book + '">Remove Book</button>';
  //     storedBooksView.appendChild(li);
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

      // document.querySelector('#addBook').onclick = function() {
      //   books.push(data);
      //   localStorage.setItem('books', JSON.stringify(books));
      //   displayBooks();
      // }
    })

  }

  // displayBooks();

}

