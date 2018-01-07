export default function reducer(
  state = {
    user: {},
    recenttracks: [],
    lovedtracks: [],
    fetching: false,
    fetchingLabel: 'Fetching user info...',
    error: null,
  },
  action
) {
  switch (action.type) {
    case '@@router/LOCATION_CHANGE': {
      let path = action.payload.pathname;
      if (path === '/') {
        return { ...state, user: {}, recenttracks: [], lovedtracks: [] };
      }
      return { ...state };
    }
    case 'FETCH_USER': {
      return { ...state, fetching: true };
    }
    case 'FETCH_USER_REJECTED': {
      return { ...state, fetching: false, error: action.payload };
    }
    case 'FETCH_USER_FULFILLED': {
      return {
        ...state,
        user: action.payload,
      };
    }
    case 'FETCH_USER_LOVED_TRACKS_FULFILLED': {
      return {
        ...state,
        lovedtracks: action.payload,
      };
    }
    case 'FETCH_USER_RECENT_TRACKS_FULFILLED': {
      return {
        ...state,
        fetching: false,
        fetchingLabel: 'Fetching user info... done!',
        recenttracks: action.payload,
      };
    }
    default:
      return state;
  }

  // eslint-disable-next-line
  return state;
}
