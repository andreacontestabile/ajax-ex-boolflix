$(document).ready(function() {

  // Inizializzazione template Handlebars
  var source = $("#movie-template").html();
  var template = Handlebars.compile(source);

  // Evento KEYPRESS (tasto INVIO) campo search
  $("#search").keypress(function(e) {
    // Se il tasto premuto è INVIO e il campo search non è vuoto
    if ((e.which == 13) && ($("#search").val().length > 0)) {
      // Salvo in una variabile il contenuto del campo search
      var searchQuery = $("#search").val();
      // Eseguo la funzione searchMovies passando come query di ricerca il contenuto del campo search
      searchMovies(searchQuery);
    }
  });

  // Evento CLICK sul bottone #search-btn
  $("#search-btn").click(function() {
    // Se il campo search non è vuoto
    if ($("#search").val().length > 0) {
      // Salvo in una variabile il contenuto del campo search
      var searchQuery = $("#search").val();
      // Eseguo la funzione searchMovies passando come query di ricerca il contenuto del campo search
      searchMovies(searchQuery);
    }
  });


  // Funzione searchMovies
  function searchMovies(query) {
    // Effettuo la chiamata ajax all'API TMDB.org
    $.ajax(
      {
       "url": "https://api.themoviedb.org/3/search/movie",
       "method": "GET",
       "data": {
         // Api Key
         "api_key": "455a355d80afa37b1862eb26f4991d02",
         // Query di ricerca
         "query": query,
       },
       "success": function(data) {
         // Al successo, eseguo la funzione renderMovies, passando come argomento l'array dei risultati
         renderMovies(data.results);
       },
       "error": function() {
         // All'errore, eseguo un alert di errore
        alert("Errore di ricerca! Riprova.")
       }
     }
   );
 }

 // Funzione renderMovies
 function renderMovies(results) {
   // Svuoto la lista dei film ul.movie-list
   $("ul.movie-list").empty();
   // Effettuo un ciclo dell'array di risultati ottenuto dalla chiamata ajax
   for (var i = 0; i < results.length; i++) {
     // var context = {
     //   "title": results[i].title,
     //   "original_title": results[i].original_title,
     //   "original_language": results[i].original_language,
     //   "vote_average": results[i].vote_average
     // };
     var finalVote = renderVote(results[i].vote_average);
     console.log(finalVote);
     // Compilo il template Handlebars passando direttamente ogni oggetto/film (le chiavi corrispondono)
     var html = $(template(results[i]));
     $(html).find(".movie-vote").append(finalVote);
     // Faccio l'append del template compilato all'interno della lista dei film
     $("ul.movie-list").append(html);
   }
 }

 function renderVote(vote) {
   var newVote = Math.ceil(vote / 2);

   var voteHtml = $("<span></span>");

   for (var i = 0; i < newVote; i++) {
     var star = $("<i class='fas fa-star'></i>");
     voteHtml.append(star);
   }
   
   for (var i = 0; i < (5 - newVote); i++) {
       var emptyStar = $("<i class='far fa-star'></i>");
       voteHtml.append(emptyStar);
   }

   return voteHtml;
 }



});
