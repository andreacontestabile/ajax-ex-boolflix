$(document).ready(function() {

  // Inizializzazione template Handlebars
  var source = $("#result-template").html();
  var template = Handlebars.compile(source);

  // Evento KEYPRESS (tasto INVIO) campo search
  $("#search").keypress(function(e) {
    // Se il tasto premuto è INVIO e il campo search non è vuoto
    if ((e.which == 13) && ($("#search").val().length > 0)) {
      // Salvo in una variabile il contenuto del campo search
      var searchQuery = $("#search").val();
      // Eseguo la funzione che svuota la pagina ed effettua una nuova ricerca
      clearAndSearch(searchQuery);
    }
  });

  // Evento CLICK sul bottone #search-btn
  $("#search-btn").click(function() {
    // Se il campo search non è vuoto
    if ($("#search").val().length > 0) {
      // Salvo in una variabile il contenuto del campo search
      var searchQuery = $("#search").val();
      // Eseguo la funzione che svuota la pagina ed effettua una nuova ricerca
      clearAndSearch(searchQuery);
    }
  });

  // Conservo in due variabili gli url relativi all'API di TMDB
  var urlMovies = "https://api.themoviedb.org/3/search/movie"
  var urlTV = "https://api.themoviedb.org/3/search/tv";

  // Funzione typeToUrl, converte il tipo di ricerca (stringa) nell'url corretto da utilizzare
  function typeToUrl(type) {
    if (type == "movie") {
      return urlMovies;
    } else if (type == "tv") {
      return urlTV;
    }
  }

  // Funzione generica di ricerca dei risultati (richiede type e query)
  function search(type, query) {
    // Effettuo la chiamata ajax all'API TMDB.org
    $.ajax(
      {
        // Ottengo l'url corretto in base al tipo di ricerca
       "url": typeToUrl(type),
       "method": "GET",
       "data": {
         // Api Key
         "api_key": "455a355d80afa37b1862eb26f4991d02",
         // Query di ricerca
         "query": query,
       },
       "success": function(data) {
         // Al successo, eseguo la funzione renderMovies, passando come argomento l'array dei risultati
         renderSearch(type, query, data.results);
       },
       "error": function() {
         // All'errore, eseguo un alert di errore
        alert("Errore di ricerca! Riprova.")
       }
     }
   );
 }

 // Definisco una variabile che contiene l'url base delle immagini poster
 var imgUrl = "https://image.tmdb.org/t/p/w342"

 // Funzione renderMovies
 function renderSearch(type, query, results) {
   // Se non ottengo risultati dalla chiamata
   if (results.length == 0) {
     // Se il tipo di ricerca effettuata è "movie"
     if (type == "movie") {
       // Il tipo di ricerca sarà relativa ai film
       var searchType = "Film"
     // Se il tipo di ricerca effettuata è "tv"
     } else if (type == "tv") {
       // Il tipo di ricerca sarà relativa alle Serie TV
       var searchType= "Serie TV"
     }
     // Creo una stringa per comunicare l'assenza di risultati all'utente
     var noResults = "<p class='no-results'>Nessun risultato per '" + query + "' nella categoria " + searchType +". Effettua una nuova ricerca.</p>";
     $("ul."+type+"-list").remove();
     $("."+type+"-results").append(noResults);
   }
   // Effettuo un ciclo dell'array di risultati ottenuto dalla chiamata ajax
   for (var i = 0; i < results.length; i++) {
     var context = {
       "type": "movie",
       "id": results[i].id,
       "title": results[i].title,
       "original_title": results[i].original_title,
       "original_language": renderFlag(results[i].original_language),
       "vote_average": renderVote(results[i].vote_average),
       "poster_path": imgUrl + results[i].poster_path,
       "overview": results[i].overview
     };
     // Se invece l'oggetto ha la proprietà "original_name" (invece di original_title)
     if (results[i].hasOwnProperty("original_name")) {
       // Modifico il context con le nuove proprietà/chiavi
       context.title = results[i].name;
       context.original_title = results[i].original_name;
       context.htmlContainer = $(".tv-list");
       context.type = "tv";
     }
     // Se non ricevo un'immagine valida da mostrare, svuoto l'attributo src (src vuoto è nascosto nel CSS)
     if (results[i].poster_path == null) {
       context.poster_path = "img/no_poster.png";
     }
     // Eseguo la funzione che ottiene la lista del cast, in base a id e type
     getCast(results[i].id, type);
     // Compilo il template Handlebars passando direttamente ogni oggetto (le chiavi corrispondono)
     var html = template(context);
     // Faccio l'append del template compilato all'interno della lista corretta
     $("."+context.type+"-list").append(html);
   }
 }

// Funzione getCast, che ricerca la lista del cast in base all'id del film/serie
 function getCast(id, type) {
   // Definisco l'url della chiamata, in base all'id
   var castUrl = "https://api.themoviedb.org/3/" + type + "/" + id + "/credits";
   $.ajax(
     {
       // Ottengo l'url corretto in base al tipo di ricerca
      "url": castUrl,
      "method": "GET",
      "data": {
        // Api Key
        "api_key": "455a355d80afa37b1862eb26f4991d02",
        // Query di ricerca
      },
      "success": function(data) {
        // Inizializzo una stringa che elencherà il cast
        var castString = "";
        // Se la lista del cast ha del contenuto
        if (data.cast.length > 0 ) {
          // Eseguo un ciclo per ogni membro del cast, fino ad un massimo di 5
          for (var i = 0; (i < data.cast.length) && (i < 5); i++) {
            // Se il campo nome restituito non è vuoto
            if (data.cast[i].name.length > 0 ) {
              // Aggiungo solo il nome del membro del cast alla stringa se è l'ultimo
              if ((i == 4) || (i == data.cast.length - 1)) {
                castString += data.cast[i].name;
              } else {
              // Altrimenti, aggiungo una virgola alla fine.
                castString += data.cast[i].name + ", ";
              }
            }
          }
        } else {
          // Se invece non c'è una lista del cast, rimuovo li.cast
          $("li.results-item[data-id='"+ id +"']").find("li.cast").remove();
        }
        // Infine, aggiungo la lista del cast nell'apposito campo
        $("li.results-item[data-id='"+ id +"']").find("span.cast-list").append(castString);
      },
      "error": function() {
        // All'errore, eseguo un alert di errore

      }
    }
  );
 }

 // Funzione renderVote
 function renderVote(vote) {
   // Dato un voto (da 1 a 10), lo divido per 2 (ottenendo un voto da 1 a 5, arrotondato per eccesso)
   var newVote = Math.ceil(vote / 2);
   // Creo due stringhe relative agli elementi stella
   var star = "<i class='fas fa-star'></i>";
   var emptyStar = "<i class='far fa-star'></i>";
   // Creo una variabile che conterrà l'elemento finale
   var voteHtml = "";
   // Per un numero di volte pari al voto, aggiungo una stella piena
   for (var i = 0; i < 5; i++) {
     if (i < newVote) {
       voteHtml += star;
     } else {
       voteHtml += emptyStar
     }
   }
   return voteHtml;
 }

 // Funzione renderFlag
 function renderFlag(lang) {
   // Definisco un array contenente tutte le bandiere disponibili
   var flags = ["ar", "cs", "da", "de", "el", "en", "es", "et", "fa", "fi", "fr", "hi", "is", "it", "ja", "ko", "lt", "nl", "no", "pl", "pt", "ru", "sv", "th", "tr", "uk", "us", "vi", "zh"];
   // Se l'array include la stringa ricevuta dall'oggetto json
   if (flags.includes(lang)) {
     // allora restituisco l'immagine della bandiera
     return ("<img class='language-flag' src='img/" + lang + ".png'>");
   } else {
     // altrimenti restituisco la stringa stessa
     return lang;
   }
 }

 // Funzione clearPage
 function clearPage() {
   // Svuoto la lista dei risultati nella pagina
   $(".movie-list").empty();
   $(".tv-list").empty();
   $("p.no-results").remove();
 }

 // Funzione clearAndSearch
 function clearAndSearch(query) {
   // Svuoto la lista dei risultati con la funzione clearPage()
   clearPage();
   // Mostro gli header delle categorie di risultati
   $("h2.category-header").fadeIn();
   // Eseguo la funzione search (movies e TV) passando i relativi URL
   // e come query di ricerca il contenuto del campo search
   search("movie", query);
   search("tv", query);
 }

});
