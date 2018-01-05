import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router';

import './App.css';

import Header from './Header';
import Loader from '../component/Loader';
import Footer from './Footer';
import UserName from '../component/UserName';
import MyScrobble from '../component/MyScrobble';

class App extends Component {
  render() {
    console.log('App props:', this.props);
    return (
      <div className="App">
        <Loader
          label={this.props.user.fetchingLabel}
          fetchingUser={this.props.user.fetching}
          fetchingArtist={this.props.artist.fetching}
        />
        <Header username={this.props.user} />
        <Route exact path="/" component={UserName} />
        <Route
          path="/scrobble/:username"
          render={({ match }) => (
            <MyScrobble username={match.params.username} />
          )}
        />
        <Footer />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user,
    artist: state.artist,
  };
}

export default connect(mapStateToProps)(App);
