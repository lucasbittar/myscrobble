import axios from 'axios';

const endpoint = 'https://ws.audioscrobbler.com/2.0/?method=';
const APIKEY = '02f64007fda57f97ec5088a624c873c2';
let params;

const extractObjectsIntoParams = (options) => {
  params = '';
  Object.entries(options).forEach(
    ([key, value]) => (params += `&${key}=${value}`)
  );
  return params;
};

export function resetUser() {
  return function(dispatch) {
    dispatch({ type: 'RESET_USER' });
  };
}

export function fetchUser(username) {
  return function(dispatch) {
    dispatch({ type: 'FETCH_USER' });

    return axios
      .get(
        `${endpoint}user.getinfo&api_key=${APIKEY}&username=${username}&format=json`
      )
      .then((response) => {
        dispatch({ type: 'FETCH_USER_FULFILLED', payload: response.data.user });
      })
      .catch((err) => {
        dispatch({ type: 'FETCH_USER_REJECTED', payload: err });
      });
  };
}

export function fetchUserRecentTracks(username, options) {
  return function(dispatch) {
    dispatch({ type: 'FETCH_USER_RECENT_TRACKS' });

    return axios
      .get(
        `${endpoint}user.getrecenttracks&api_key=${APIKEY}&username=${username}&format=json${extractObjectsIntoParams(
          options
        )}`
      )
      .then((response) => {
        dispatch({
          type: 'FETCH_USER_RECENT_TRACKS_FULFILLED',
          payload: response.data.recenttracks.track,
        });
      })
      .catch((err) => {
        dispatch({ type: 'FETCH_USER_RECENT_TRACKS_REJECTED', payload: err });
      });
  };
}

export function fetchUserLovedTracks(username, options) {
  return function(dispatch) {
    dispatch({ type: 'FETCH_USER_LOVED_TRACKS' });

    axios
      .get(
        `${endpoint}user.getlovedtracks&api_key=${APIKEY}&username=${username}&format=json${extractObjectsIntoParams(
          options
        )}`
      )
      .then((response) => {
        dispatch({
          type: 'FETCH_USER_LOVED_TRACKS_FULFILLED',
          payload: response.data.lovedtracks.track,
        });
      })
      .catch((err) => {
        dispatch({ type: 'FETCH_USER_LOVED_TRACKS_REJECTED', payload: err });
      });
  };
}
