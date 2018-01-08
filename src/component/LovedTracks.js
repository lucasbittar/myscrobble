import React, { Component } from 'react';
import InViewMonitor from 'react-inview-monitor';

import './LovedTracks.css';

class LovedTracks extends Component {
  extractAlbumCover(images) {
    let image = images.filter((image) => image.size === 'extralarge');
    return image[0]['#text'];
  }
  renderLovedTrack() {
    return this.props.tracks.map((track, i) => (
      <InViewMonitor
        className="loved-track"
        classNameNotInView="loved-track not-showing"
        classNameInView="loved-track is-showing"
        key={i}
      >
        <a href={track.url}>
          <img src={this.extractAlbumCover(track.image)} alt={track.name} />
        </a>
        <div className="loved-track-info">
          <a href={track.url}>
            <h1>{track.name}</h1>
            <h2>{track.artist.name}</h2>
          </a>
        </div>
      </InViewMonitor>
    ));
  }
  render() {
    if (this.props.tracks === undefined) {
      return <div>Fetching your loved tracks...</div>;
    } else {
      return (
        <section className="loved-tracks">
          <div className="container">
            <h1>Loved Tracks</h1>
            <div className="loved-tracks-list">{this.renderLovedTrack()}</div>
          </div>
        </section>
      );
    }
  }
}

export default LovedTracks;
