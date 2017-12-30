/**
 * Main Functions
 *
 * @author: Lucas Bittar @ GA
 *
 * Creation Date: 20150404
 *
 *
 */

var CSEID = '015322544866411100232:i941ndyid74';
var APIKEY = 'AIzaSyDcuiakLRK_ou8J42V1t-ABvnKWNsg_wRo';

// Starts project
function init() {
  $('.loader')
    .delay(1000)
    .animate(
      {
        opacity: '0',
      },
      1000,
      'easeOutCubic',
      function() {
        $('.loader-label').html(
          '<img src="images/ajax-loader.gif">Fetching Info...'
        );
        $('.loader').css({
          opacity: 1,
          left: '-100%',
        });

        $('.elements-hidden').each(function(i) {
          var toAnimate = $('.' + elements[i]);

          setTimeout(function() {
            toAnimate.removeClass('elements-hidden');
            toAnimate.addClass('elements-show');
          }, 120 * (i + 1));
        });

        setTimeout(function() {
          $('input.username-input').focus();
        }, 1000);
      }
    );
}

// Fetches username and redirect to scrobble page
function getScrobble(event) {
  event.preventDefault();

  console.log('lets get it started!');

  var username = $('.username-input').val();

  var url = currUrl + 'myscrobble.html?username=' + username;

  $('.loader').animate(
    {
      left: '0',
    },
    800,
    'easeOutCubic',
    function() {
      window.location.href = url;
    }
  );
}

// Call Last.fm API Recent Tracks
function getTracks() {
  $.ajax({
    url:
      'https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=' +
      username +
      '&api_key=' +
      apikey +
      '&format=json&limit=10',
    crossDomain: true,
    dataType: 'json',
    success: function(data) {
      var results = data.recenttracks.track;

      if (results) {
      } else {
        $('.loader-label').html(
          'You haven\'t scrobbled anything yet. Get into it!'
        );
      }

      var lastScrobble = results[0];

      artistName = lastScrobble.artist['#text'];

      artwork = lastScrobble.image[3]['#text'];
      artist = lastScrobble.artist['#text'];
      song = lastScrobble.name;
      songURL = lastScrobble.url;
      album = lastScrobble.album['#text'];

      artworkHTML = '<img src=\'' + artwork + '\' alt=\'' + album + '\'>';
      artistHTML = '<h1><a href=\'' + songURL + '\'>' + artist + '</h1>';
      songHTML = '<h2>' + song + '</a></h2>';

      nowPlaying = lastScrobble['@attr'];

      if (nowPlaying == undefined) {
        // console.log('scrobbled');
        date = lastScrobble.date['#text'];
        dateHTML = '<span class=\'date\'>' + date + '</span>';

        var link = document.createElement('link');
        link.rel = 'shortcut icon';
        link.href = 'favicon.ico?v=2.2';
        document.getElementsByTagName('head')[0].appendChild(link);
      } else {
        console.log('nowplaying');
        dateHTML =
          '<img src=\'images/eq.gif\' style=\'display:block; width: 75px; margin: 0 auto\'><span class=\'listening\'>Now Listening!</span>';

        var link = document.createElement('link');
        link.rel = 'shortcut icon';
        link.href = 'favicon-playing.ico?v=1';
        link.type = 'image/x-icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }

      $('.last-scrobble-wrap').append(
        '<div class=\'last-scrobble\'>' +
          artworkHTML +
          artistHTML +
          songHTML +
          dateHTML +
          '</div>'
      );

      // Assemble recent tracks HTML
      for (var i = 1; i < results.length; ++i) {
        var scrobble = results[i];

        artwork = scrobble.image[2]['#text'];
        artist = scrobble.artist['#text'];
        song = scrobble.name;
        songURL = scrobble.url;
        album = scrobble.album['#text'];
        date = scrobble.date['#text'];

        artworkHTML = '<img src=\'' + artwork + '\' alt=\'' + album + '\'>';
        artistHTML =
          '<div class=\'track-info\'><h1><a href=\'' +
          songURL +
          '\'>' +
          artist +
          ' - ' +
          song +
          '</a></h1>';
        dateHTML = '<p>' + date + '</p></div>';

        $('.recent-tracks .scrobbles-list').append(
          '<div class=\'scrobble\'>' +
            artworkHTML +
            artistHTML +
            dateHTML +
            '</div>'
        );
      }

      // Fetch image for the background
      searchImage(artistName);

      // Fetch user's info
      fetchUserInfo();
    },
    error: function() {
      alert('Error loading data. Reload the page.');
    },
  });
}

// Function to get user's info
function fetchUserInfo() {
  // Call Last.fm API Recent Tracks
  $.ajax({
    url:
      'https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=' +
      username +
      '&api_key=' +
      apikey +
      '&format=json',
    crossDomain: true,
    dataType: 'json',
    success: function(data) {
      var name = data.user.realname;
      var uname = data.user.name;
      var avatar = data.user.image[3]['#text'];
      var playcount = data.user.playcount;

      $('.more-button').append('Check out ' + name + '\'s recent tracks');
      $('.navbar-brand').append(
        '<a title="View user\'s info" class="username">/' + uname + '</a>'
      );

      $('.user-info .username').append(name);
      $('.user-info .avatar').css(
        'background',
        'url(' + avatar + ') no-repeat center center'
      );
      $('.user-info .playcount').append(
        '<span class="glyphicon glyphicon-music" aria-hidden="true"></span> ' +
          playcount +
          ' Plays<br>'
      );
    },
    error: function() {
      $('.loader-label').append(' Error loading data. Reload the page.');
    },
  });

  // Call Last.fm API Tags
  $.ajax({
    url:
      'https://ws.audioscrobbler.com/2.0/?method=user.gettoptags&user=' +
      username +
      '&api_key=' +
      apikey +
      '&format=json',
    crossDomain: true,
    dataType: 'json',
    success: function(data) {
      var tags = data.toptags.tag;
      var numTags;

      if (tags.length < 10) {
        numTags = tags.length;
      } else {
        numTags = 10;
      }

      if (tags) {
        for (var i = 0; i < numTags; i++) {
          var tag = tags[i];
          var tagName = tag.name;
          var tagUrl = tag.url;

          $('.user-info .tags').append(
            '<span><a href="https://' +
              tagUrl +
              '" target="_blank">' +
              tagName +
              '</a></span>'
          );
        }
      }
    },
    error: function() {
      $('.loader-label').append(' Error loading data. Reload the page.');
    },
  });

  // Call Last.fm API Loved Tracks
  $.ajax({
    url:
      'https://ws.audioscrobbler.com/2.0/?method=user.getlovedtracks&user=' +
      username +
      '&api_key=' +
      apikey +
      '&format=json',
    crossDomain: true,
    dataType: 'json',
    success: function(data) {
      var lovedTracks = data.lovedtracks.track;
      var numLovedTracks = data.lovedtracks['@attr'].total;

      $('.user-info .playcount').append(
        '<span class="glyphicon glyphicon-heart" aria-hidden="true"></span> ' +
          numLovedTracks +
          ' Loved Tracks<br>'
      );

      if (lovedTracks) {
        for (var i = 0; i < 5; i++) {
          var lovedTrack = lovedTracks[i];
          var name = lovedTrack.name;
          var artist = lovedTrack.artist.name;

          $('.user-info .loved').append(
            '<div class="track"><span class="name">' +
              name +
              '</span><span class="artist">' +
              artist +
              '</span></div>'
          );
        }
      }
    },
    error: function() {
      $('.loader-label').append(' Error loading data. Reload the page.');
    },
  });

  fetchLovedTracks();
}

// Function to get new loved tracks
function fetchLovedTracks() {
  // Call Last.fm API Loved Tracks
  $.ajax({
    url:
      'https://ws.audioscrobbler.com/2.0/?method=user.getlovedtracks&user=' +
      username +
      '&api_key=' +
      apikey +
      '&format=json&limit=9',
    crossDomain: true,
    dataType: 'json',
    success: function(data) {
      console.log('Loved tracks', data);
      var lovedTracks = data.lovedtracks.track;

      if (lovedTracks) {
        for (var i = 0; i < lovedTracks.length; i++) {
          var release = lovedTracks[i];
          var name = release.name;
          var url = release.url;
          var artist = release.artist.name;
          var artwork = release.image[3]['#text'];

          artworkHTML =
            '<a href=\'' +
            url +
            '\' target=\'_blank\'><img src=\'' +
            artwork +
            '\' alt=\'' +
            name +
            '\'>';
          artistHTML =
            '<div class=\'release-info\'><h1>' +
            name +
            '</h1><h2>' +
            artist +
            '</h2></a>';

          $('.new-releases .releases-list').append(
            '<div class=\'release\'>' + artworkHTML + artistHTML + '</div>'
          );
        }

        fetchArtistInfo();
      } else {
        $('.new-releases').css('display', 'none');
        fetchArtistInfo();
      }
    },
    error: function() {
      $('.loader-label').append(' Error loading data. Reload the page.');
    },
  });
}

// Function to get artist's info
function fetchArtistInfo() {
  // Call Last.fm API Artist Info
  $.ajax({
    url:
      'https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=' +
      artistName +
      '&api_key=' +
      apikey +
      '&format=json',
    crossDomain: true,
    dataType: 'json',
    success: function(data) {
      console.log('On Tour', data);
      var tour = data.artist.ontour;

      if (tour == true) {
        $('.last-scrobble h2').after(
          '<span class="ontour"><span class="glyphicon glyphicon-fire" aria-hidden="true"></span> On tour!</span>'
        );
      }

      $('.loader-label').append(' done!');
      $('.loader')
        .delay(1000)
        .animate(
          {
            left: '100%',
          },
          800,
          'easeOutCubic',
          function() {
            $('.loader').fadeOut();
          }
        );
    },
    error: function() {
      $('.loader-label').append(' Error loading data. Reload the page.');
    },
  });
}

// Function to fill with background image
function searchImage(searchQuery) {
  console.log('fetching image for: ' + searchQuery);

  var endpoint = 'https://www.googleapis.com';

  // Call Google Image API
  $.ajax({
    url:
      endpoint +
      '/customsearch/v1?q=group+' +
      searchQuery.replace(/\s/g, '+') +
      '&searchType=image' +
      '&cx=' +
      CSEID +
      '&key=' +
      APIKEY,
    crossDomain: true,
    dataType: 'jsonp',
    success: function(response) {
      var images = response.items;

      console.log('Image', images);

      if (images.length) {
        var minNumber = 0;
        var maxNumber = 3;

        function randomNumberFromRange(min, max) {
          var randomNumber = Math.floor(Math.random() * (max - min + 1) + min);
          var imageToLoad = images[randomNumber].link;

          // $('.bg-artist').css('background', 'url(' + imageToLoad + ') no-repeat 50% center');
          $('.page-wrap').css(
            'background',
            'url(' + imageToLoad + ') no-repeat 50% center'
          );
        }

        randomNumberFromRange(minNumber, maxNumber);
      }
    },
    error: function() {
      alert('Error loading data. Reload the page.');
    },
  });

  /*
   $.ajax({
     url:
       'https://pixabay.com/api/?key=7541656-f946c6c55f57647be27ec3e5a&q=group+' +
       searchQuery.replace(/\s/g, '+') +
       '&image_type=photo',
     crossDomain: true,
     dataType: 'jsonp',
     success: function(data) {

       var images = data.hits;

       console.log('Image', images);

       if (images.length) {
         var minNumber = 0;
         var maxNumber = 3;

         function randomNumberFromRange(min, max) {
           var randomNumber = Math.floor(Math.random() * (max - min + 1) + min);
           var imageToLoad = images[randomNumber].webformatURL;

           // $('.bg-artist').css('background', 'url(' + imageToLoad + ') no-repeat 50% center');
           $('.page-wrap').css(
             'background',
             'url(' + imageToLoad + ') no-repeat 50% center'
           );
         }

         randomNumberFromRange(minNumber, maxNumber);
       }
     },
     error: function() {
       alert('Error loading data. Reload the page.');
     },
   });
  */
}

// Fetches URL values
function GetUrlValue(VarSearch) {
  var SearchString = window.location.search.substring(1);
  var VariableArray = SearchString.split('&');
  for (var i = 0; i < VariableArray.length; i++) {
    var KeyValuePair = VariableArray[i].split('=');
    if (KeyValuePair[0] == VarSearch) {
      return KeyValuePair[1];
    }
  }
}

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
var apikey = '02f64007fda57f97ec5088a624c873c2';
var currUrl = window.location.href;

// Elements to animate
var elements = ['username-h1', 'username-p', 'username-form'];

// On click scroll to scrobble list
$('.more-button').on('click', function() {
  $.scrollTo('.recent-tracks', 1000, { easing: 'easeOutCubic' });
});

// Buttons actions
$('#username').on('submit', getScrobble);

// Listen to scroll position to hide navbar
$(window).scroll(function() {
  scrollPos = $(window).scrollTop();

  $('.page-wrap').css(
    'background-position-y',
    Math.min(75, 50 + scrollPos / 25) + '%'
  );
  $('.bg-artist-fade').css('opacity', Math.min(1, scrollPos / 800));
  $('.last-scrobble').css(
    '-webkit-transform',
    'translateY(' + scrollPos * -0.2 + 'px)'
  );

  if (scrollPos > 30) {
    $('#main-nav').css('-webkit-transform', 'translateY(-80px)');
  } else {
    $('#main-nav').css('-webkit-transform', 'translateY(0px)');
  }

  if (scrollPos > $('#recent-tracks').offset().top - $(window).height() / 1.4) {
    $('.scrobble').each(function(i) {
      setTimeout(function() {
        $('.scrobble')
          .eq(i)
          .addClass('is-showing-tracks');
      }, 150 * (i + 1));
    });
  }

  if (scrollPos > $('#new-releases').offset().top - $(window).height() / 1.4) {
    $('.release').each(function(i) {
      setTimeout(function() {
        $('.release')
          .eq(i)
          .addClass('is-showing-releases');
      }, 150 * (i + 1));
    });
  }
});

$('.fb-icon').on('click', function() {
  var t = 'MyScrobble.fm';
  window.open(
    'http://www.facebook.com/sharer.php?u=' +
      encodeURIComponent(currUrl) +
      '&t=' +
      encodeURIComponent(t),
    'sharer',
    'toolbar=0,status=0,width=626,height=352'
  );
});

$('.gp-icon').on('click', function() {
  window.open(
    'https://plus.google.com/share?url=' + encodeURIComponent(currUrl),
    'sharer',
    'toolbar=0,status=0,width=626,height=352'
  );
});

$('.tw-icon').on('click', function() {
  window.open(
    'https://twitter.com/intent/tweet?url=' +
      encodeURIComponent(currUrl) +
      '&text=Check out MyScrobble.',
    'sharer',
    'toolbar=0,status=0,width=626,height=352'
  );
});
