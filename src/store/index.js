import { applyMiddleware, createStore } from 'redux';

import { logger } from 'redux-logger';
import thunk from 'redux-thunk';
import promise from 'redux-promise-middleware';
import createHistory from 'history/createBrowserHistory';
import { routerMiddleware } from 'react-router-redux';

import reducer from '../reducers';

const history = createHistory();

const middleware = applyMiddleware(
  promise(),
  thunk,
  logger,
  routerMiddleware(history)
);

/*
const store = createStore(reducer, middleware);

store.subscribe(() => {
  console.log('store changed', store.getState());
});

store.dispatch(fetchUser('lucasbittar'));
*/
export default createStore(reducer, middleware);
