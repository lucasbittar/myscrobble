import React, { Component } from 'react';
import { connect } from 'react-redux';
import './MyScrobble.css';

import { fetchArtist, fetchArtistImage } from '../actions/artistActions';

import {
  fetchUser,
  fetchUserRecentTracks,
  fetchUserLovedTracks,
} from '../actions/userActions';

import LastTrack from './LastTrack';
import RecentTracks from './RecentTracks';

class MyScrobble extends Component {
  componentWillMount() {
    if (!this.props.user.user.name) {
      console.log('Need to fetch user!');
      this.props.dispatch(fetchUser(this.props.username));
    }
    this.props
      .dispatch(fetchUserRecentTracks(this.props.username, { limit: 10 }))
      .then(() => {
        this.props.dispatch(
          fetchArtist(this.props.user.recenttracks[0].artist['#text'])
        );
        this.props.dispatch(
          fetchArtistImage(this.props.user.recenttracks[0].artist['#text'])
        );
      });
    this.props.dispatch(
      fetchUserLovedTracks(this.props.username, { limit: 9 })
    );
  }
  render() {
    return (
      <section className="my-scrobble">
        <LastTrack
          imageUrl={this.props.artist.image}
          fetching={this.props.artist.fetching}
          artist={this.props.artist.artist}
          track={this.props.user.recenttracks[0]}
        />
        <RecentTracks
          fetching={this.props.artist.fetching}
          tracks={this.props.user.recenttracks}
        />
      </section>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user,
    artist: state.artist,
  };
}

export default connect(mapStateToProps)(MyScrobble);
