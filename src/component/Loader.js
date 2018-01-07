import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Loader.css';
import ajaxLoader from '../images/ajax-loader.gif';

class Loader extends Component {
  handleLoader() {
    let fetchingUser = this.props.user.fetching;
    let fetchingUserLabel = this.props.user.fetchingLabel;
    let fetchingArtist = this.props.artist.fetching;
    let fetchingArtistLabel = this.props.artist.fetchingLabel;

    this.label = fetchingUserLabel;

    if (fetchingUser || fetchingArtist) {
      return 'show';
    } else if (!fetchingUser && fetchingArtist) {
      this.label = fetchingArtistLabel;
      return 'show';
    }
  }
  render() {
    return (
      <div className={`Loader ${this.handleLoader()}`}>
        <div className="loader-label">
          <img src={ajaxLoader} alt="Loading..." />
          {this.label}
        </div>
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

export default connect(mapStateToProps)(Loader);
