/**
 * jQuery/load
 *
 * @author: Lucas Bittar @ GA
 *
 * Creation Date: 20150326
 * 
 *
 */

// Global variables
var scrollPos;
var artistName;
var artworkHTML;
var artistHTML;
var songHTML;
var dateHTML;
var artwork;
var artist;
var song;
var songURL;
var album;
var date;
var nowPlaying;

// Custom variables
var username = GetUrlValue('username');
var apikey = "6ddc045f7d3cc33ab23feb89fc5e2e2a";

// On click scroll to scrobble list
$('.more-button').on('click', function() {

	$.scrollTo('.recent-tracks',1000,{easing:'easeOutCubic'});

});

// Listen to scroll position to hide navbar
$(window).scroll(function () { 

	scrollPos = $(window).scrollTop();

	$('.bg-artist').css('background-position-y', (50 + (scrollPos / 11)) + '%');
	$('.bg-artist-fade').css('opacity', (scrollPos / 800));
	$('.last-scrobble').css('-webkit-transform', 'translateY(' + (scrollPos * -.2) + 'px)');

    if ( scrollPos > 120 ) {

        $('#main-nav').css('-webkit-transform', 'translateY(-80px)');

    } else {

        $('#main-nav').css('-webkit-transform', 'translateY(0px)');

    }

    if ( scrollPos > $('#recent-tracks').offset().top - ($(window).height() / 1.4) ) {

        $('.scrobble').each(function(i) {

            setTimeout(function() {

                $('.scrobble').eq(i).addClass('is-showing-tracks');

            }, 150 * (i + 1));

        })

    }

    if ( scrollPos > $('#new-releases').offset().top - ($(window).height() / 1.4) ) {

        $('.release').each(function(i) {

            setTimeout(function() {

                $('.release').eq(i).addClass('is-showing-releases');

            }, 150 * (i + 1));

        })

    }

});

// Call Last.fm API Recent Tracks
$.ajax({
  url:"http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=" + username + "&api_key=" + apikey + "&format=json&limit=10",
  crossDomain: true,
  dataType: "json",
  success: function (data) {

    var results = data.recenttracks.track;
    var lastScrobble = results[0];

    artistName = lastScrobble.artist["#text"];

    artwork = lastScrobble.image[3]["#text"];
    artist = lastScrobble.artist["#text"];
    song = lastScrobble.name;
    songURL = lastScrobble.url;
    album = lastScrobble.album["#text"];

    artworkHTML = "<img src='" + artwork + "' alt='" + album + "'>";
    artistHTML = "<h1><a href='" + songURL + "'>" + artist + "</h1>";
    songHTML = "<h2>" + song + "</a></h2>";

    nowPlaying = lastScrobble["@attr"];

    if (nowPlaying == undefined) {

    	console.log('scrobbled');
    	date = lastScrobble.date["#text"];
    	dateHTML = "<span class='date'>" + date + "</span>";

        var link = document.createElement('link');
        link.rel = 'shortcut icon';
        link.href = '/favicon.ico?v=2.2';
        document.getElementsByTagName('head')[0].appendChild(link);

    } else {

    	console.log('nowplaying');
    	dateHTML = "<img src='../images/eq.gif' style='display:block; width: 75px; margin: 0 auto'><span class='listening'>Now Listening!</span>";

        var link = document.createElement('link');
        link.rel = 'shortcut icon';
        link.href = '/favicon-playing.ico?v=1';
        link.type = 'image/x-icon';
        document.getElementsByTagName('head')[0].appendChild(link);

    }
    
    $('.last-scrobble-wrap').append("<div class='last-scrobble'>" + artworkHTML + artistHTML + songHTML + dateHTML +"</div>");

    // Assemble recent tracks HTML
    for (var i = 1; i < results.length; ++i) {

        var scrobble = results[i];

        artwork = scrobble.image[2]["#text"];
        artist = scrobble.artist["#text"];
        song = scrobble.name;
        songURL = scrobble.url;
        album = scrobble.album["#text"];
        date = scrobble.date["#text"];

        artworkHTML = "<img src='" + artwork + "' alt='" + album + "'>";
        artistHTML = "<div class='track-info'><h1><a href='" + songURL + "'>" + artist + " - " + song + "</a></h1>";
        dateHTML = "<p>" + date + "</p></div>";

        $('.recent-tracks .scrobbles-list').append("<div class='scrobble'>" + artworkHTML + artistHTML + dateHTML + "</div>");

    }

    // Fetch image for the background
    searchImage(artistName);

    // Fetch user's info
    fetchUserInfo();

  },
  error: function () {
    alert('Error loading data. Reload the page.');
  }

});



