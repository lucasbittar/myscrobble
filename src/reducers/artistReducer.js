export default function reducer(
  state = {
    artist: {},
    image: '',
    fetching: true,
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
        fetching: false,
        artist: action.payload,
      };
    }
    case 'FETCH_ARTIST_IMAGE_FULFILLED': {
      return {
        ...state,
        image: action.payload,
      };
    }
    default:
      return state;
  }

  return state;
}
