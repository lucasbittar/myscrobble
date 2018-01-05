import axios from 'axios';
import GoogleImages from 'google-images';

const APIKEY = '02f64007fda57f97ec5088a624c873c2';
const CSEID = '015322544866411100232:i941ndyid74';
const GOOGLE_IMAGES_APIKEY = 'AIzaSyDcuiakLRK_ou8J42V1t-ABvnKWNsg_wRo';
const client = new GoogleImages(CSEID, GOOGLE_IMAGES_APIKEY);

const endpoint = 'https://ws.audioscrobbler.com/2.0/?method=';

const getRandomArbitrary = (min, max) => Math.random() * (max - min) + min;

export function fetchArtist(artist) {
  return function(dispatch) {
    dispatch({ type: 'FETCH_ARTIST' });

    axios
      .get(
        `${endpoint}artist.getinfo&api_key=${APIKEY}&artist=${artist}&format=json`
      )
      .then((response) => {
        dispatch({
          type: 'FETCH_ARTIST_FULFILLED',
          payload: response.data.artist,
        });
      })
      .catch((err) => {
        dispatch({ type: 'FETCH_ARTIST_REJECTED', payload: err });
      });
  };
}

export function fetchArtistImage(artist) {
  return function(dispatch) {
    dispatch({ type: 'FETCH_ARTIST_IMAGE' });

    client
      .search(artist, { size: 'xxlarge' })
      .then((images) => {
        let imagesTotal = images.length;
        let random = parseInt(getRandomArbitrary(0, imagesTotal), 0);
        let imageUrl = images[random].url;
        dispatch({
          type: 'FETCH_ARTIST_IMAGE_FULFILLED',
          payload: imageUrl,
        });
      })
      .catch((err) => {
        dispatch({ type: 'FETCH_ARTIST_IMAGE_REJECTED', payload: err });
      });
  };
}
