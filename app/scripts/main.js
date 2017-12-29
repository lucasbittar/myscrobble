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
