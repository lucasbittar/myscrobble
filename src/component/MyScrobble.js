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
import LovedTracks from './LovedTracks';

class MyScrobble extends Component {
  componentDidMount() {
    const username = this.props.username;
    this.props.dispatch(fetchUser(username));
    this.props.dispatch(fetchUserLovedTracks(username, { limit: 9 }));
    this.props
      .dispatch(fetchUserRecentTracks(username, { limit: 10 }))
      .then(() => {
        const artist = this.props.user.recenttracks[0].artist['#text'];
        this.props.dispatch(fetchArtist(artist));
        this.props.dispatch(fetchArtistImage(artist));
      });
  }
  render() {
    return (
      <section className="my-scrobble">
        <LastTrack
          imageUrl={this.props.artist.image}
          artist={this.props.artist.artist}
          track={this.props.user.recenttracks[0]}
        />
        <RecentTracks tracks={this.props.user.recenttracks} />
        <LovedTracks tracks={this.props.user.lovedtracks} />
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
