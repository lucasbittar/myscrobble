import React, { Component } from 'react';

import './TrackBackground.css';

class TrackBackground extends Component {
  render() {
    if (this.props.fetching) {
      return <div>Loading...</div>;
    } else {
      return (
        <div
          className="track-background"
          style={{
            backgroundImage: `url(${this.props.imageUrl})`,
          }}
        />
      );
    }
  }
}

export default TrackBackground;
