export default function reducer(
  state = {
    artist: {},
    image: '',
    fetching: false,
    fetchingLabel: 'Fetching artist info...',
    error: null,
  },
  action
) {
  switch (action.type) {
    case 'FETCH_ARTIST': {
      return { ...state, fetching: true };
    }
    case 'FETCH_ARTIST_REJECTED': {
      return { ...state, fetching: false, error: action.payload };
    }
    case 'FETCH_ARTIST_FULFILLED': {
      return {
        ...state,
        artist: action.payload,
      };
    }
    case 'FETCH_ARTIST_IMAGE_FULFILLED': {
      return {
        ...state,
        fetching: false,
        fetchingLabel: 'Fetching artist info... done!',
        image: action.payload,
      };
    }
    case 'FETCH_ARTIST_IMAGE_REJECTED': {
      return {
        ...state,
        fetching: false,
        image: 'fallback-image.png',
      };
    }
    default:
      return state;
  }

  // eslint-disable-next-line
  return state;
}
