/**
 * Main Functions
 *
 * @author: Lucas Bittar @ GA
 *
 * Creation Date: 20150404
 * 
 *
 */

 // Function to get user's info
 function fetchUserInfo() {

 	// Call Last.fm API Recent Tracks
 	$.ajax({
 	  url:"http://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=" + username + "&api_key=" + apikey + "&format=json",
 	  crossDomain: true,
 	  dataType: "json",
 	  success: function (data) {

 	  	var name = data.user.realname;
 	  	var uname = data.user.name;
 	  	var avatar = data.user.image[3]["#text"];
 	  	var playcount = data.user.playcount;

 	  	$('.more-button').append("Check out " + name + "'s recent tracks");
 	  	$('.navbar-brand').append('/' + uname);

 	  	$('.user-info .username').append(name);
 	  	$('.user-info .avatar').css('background', 'url(' + avatar + ') no-repeat center center');
 	  	$('.user-info .playcount').append('<span class="glyphicon glyphicon-music" aria-hidden="true"></span> ' + playcount + ' Plays<br>');


 	  },
 	  error: function () {
 	  	$('.loader-label').append(' Error loading data. Reload the page.');
 	  }

 	});

 	// Call Last.fm API Tags
 	$.ajax({
 	  url:"http://ws.audioscrobbler.com/2.0/?method=user.gettoptags&user=" + username + "&api_key=" + apikey + "&format=json",
 	  crossDomain: true,
 	  dataType: "json",
 	  success: function (data) {

 	  	var tags = data.toptags.tag;

 	  	for (var i = 0; i < tags.length; i++) {

 	  		var tag = tags[i];
 	  		var tagName = tag.name;
 	  		var tagUrl = tag.url;

 	  		$('.user-info .tags').append('<span><a href="http://' + tagUrl + '" target="_blank">' + tagName + '</a></span>');

 	  	};

 	  },
 	  error: function () {
 	  	$('.loader-label').append(' Error loading data. Reload the page.');
 	  }

 	});

 	// Call Last.fm API Loved Tracks
 	$.ajax({
 	  url:"http://ws.audioscrobbler.com/2.0/?method=user.getlovedtracks&user=" + username + "&api_key=" + apikey + "&format=json",
 	  crossDomain: true,
 	  dataType: "json",
 	  success: function (data) {

 	  	var lovedTracks = data.lovedtracks["@attr"].total;

 	  	$('.user-info .playcount').append('<span class="glyphicon glyphicon-heart" aria-hidden="true"></span> ' + lovedTracks + ' Loved Tracks<br>');

 	  },
 	  error: function () {
 	  	$('.loader-label').append(' Error loading data. Reload the page.');
 	  }

 	});

 	fetchNewReleases();

 }

 // Function to get new releases
 function fetchNewReleases() {

 	// Call Last.fm API New Releases
 	$.ajax({
 	  url:"http://ws.audioscrobbler.com/2.0/?method=user.getnewreleases&user=" + username + "&api_key=" + apikey + "&format=json",
 	  crossDomain: true,
 	  dataType: "json",
 	  success: function (data) {

 	  	var releases = data.albums.album;

 	  	for (var i = 0; i < releases.length; i++) {

 	  		var release = releases[i];
 	  		var name = release.name;
 	  		var url = release.url;
 	  		var artist = release.artist.name;
 	  		var artwork = release.image[3]["#text"];

 	  		artworkHTML = "<a href='" + url + "' target='_blank'><img src='" + artwork + "' alt='" + name + "'>";
 	  		artistHTML = "<div class='release-info'><h1>" + name + "</h1><h2>" + artist +"</h2></a>";

 	  		$('.new-releases .releases-list').append("<div class='release'>" + artworkHTML + artistHTML + "</div>");

 	  	};

 		fetchArtistInfo();

 	  },
 	  error: function () {
 	  	$('.loader-label').append(' Error loading data. Reload the page.');
 	  }

 	});

 }

 // Function to get artist's info
 function fetchArtistInfo() {

 	// Call Last.fm API Artist Info
 	$.ajax({
 	  url:"http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=" + artistName + "&api_key=" + apikey + "&format=json",
 	  crossDomain: true,
 	  dataType: "json",
 	  success: function (data) {

 	  	var tour = data.artist.ontour;

 	  	if (tour == true) {

 	  		$('.last-scrobble h2').after('<span class="ontour"><span class="glyphicon glyphicon-fire" aria-hidden="true"></span> On tour!</span>');

 	  	}

 	  	$('.loader-label').append(' done!');
 		$('.loader').delay(1000).animate({
 			left: "100%"
 			}, 800, "easeOutCubic", function() {
 				$('.loader').fadeOut();
 			}
 		);

 	  },
 	  error: function () {
 	  	$('.loader-label').append(' Error loading data. Reload the page.');
 	  }

 	});

 }

 // Function to fill with background image
 function searchImage(searchQuery) {

 	console.log('fetching image for: ' + searchQuery);

 	// Call Google Image API
 	$.ajax({
 	  url:"https://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=group " + searchQuery + "&imgsz=xxlarge&imgtype=photo",
 	  crossDomain: true,
 	  dataType: "jsonp",
 	  success: function (data) {

 	  	console.log('search complete!');

 	  	var images = data.responseData.results;

 	  	var minNumber = 0;
 		var maxNumber = 3;

 		function randomNumberFromRange(min,max)
 		{
 		    var randomNumber = Math.floor(Math.random()*(max-min+1)+min);
 		    var imageToLoad = images[randomNumber].url;

 		    $('.bg-artist').css('background', 'url(' + imageToLoad + ') no-repeat 50% center');

 		}

 		randomNumberFromRange(minNumber, maxNumber);

 	  },
 	  error: function () {
 	    alert('Error loading data. Reload the page.');
 	  }

 	});

 }

 // Fetches URL values
 function GetUrlValue(VarSearch){
     var SearchString = window.location.search.substring(1);
     var VariableArray = SearchString.split('&');
     for(var i = 0; i < VariableArray.length; i++){
         var KeyValuePair = VariableArray[i].split('=');
         if(KeyValuePair[0] == VarSearch){
             return KeyValuePair[1];
         }
     }
 }