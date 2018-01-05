import { combineReducers } from 'redux';

import user from './userReducer';
import artist from './artistReducer';

import { routerReducer } from 'react-router-redux';

export default combineReducers({
  user,
  artist,
  router: routerReducer,
});
