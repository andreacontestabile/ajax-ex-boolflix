$(document).ready(function() {

  var search = "Lost";

  var source = $("#movie-template").html();
  var template = Handlebars.compile(source);

 $.ajax(
   {
     "url": "https://api.themoviedb.org/3/search/movie",
     "method": "GET",
     "data": {
       "api_key": "455a355d80afa37b1862eb26f4991d02",
       "query": search,
     },
     "success": function(data) {
       renderMovies(data.results);
     },
     "error": function() {

     }
   }
 );

 function renderMovies(results) {
   for (var i = 0; i < results.length; i++) {
     // var context = {
     //   "title": results[i].title,
     //   "original_title": results[i].original_title,
     //   "original_language": results[i].original_language,
     //   "vote_average": results[i].vote_average
     // };
     var html = template(results[i]);
     $("ul.movie-list").append(html);
   }
 }

});
