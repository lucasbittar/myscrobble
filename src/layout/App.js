import React from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router';

import './App.css';

import Header from './Header';
import Loader from '../component/Loader';
import Footer from './Footer';
import UserName from '../component/UserName';
import MyScrobble from '../component/MyScrobble';

const App = (props) => {
  return (
    <div className="App">
      <Loader user={props.user} artist={props.artist} />
      <Header username={props.user} />
      <Route exact path="/" component={UserName} />
      <Route
        path="/scrobble/:username"
        render={({ match }) => <MyScrobble username={match.params.username} />}
      />
      <Footer />
    </div>
  );
};

function mapStateToProps(state) {
  return {
    user: state.user,
    artist: state.artist,
  };
}

export default connect(mapStateToProps)(App);
