import React, { Component } from 'react';

import './LovedTracks.css';

class LovedTracks extends Component {
  extractAlbumCover(images) {
    let image = images.filter((image) => image.size === 'extralarge');
    return image[0]['#text'];
  }
  renderLovedTrack() {
    return this.props.tracks.map((track, i) => (
      <div className="loved-track is-showing-loved-track" key={i}>
        <a href={track.url}>
          <img src={this.extractAlbumCover(track.image)} alt={track.name} />
        </a>
        <div className="loved-track-info">
          <a href={track.url}>
            <h1>{track.name}</h1>
            <h2>{track.artist.name}</h2>
          </a>
        </div>
      </div>
    ));
  }
  render() {
    if (this.props.tracks === undefined) {
      return <div>Fetching your loved tracks...</div>;
    } else {
      return (
        <section className="loved-tracks">
          <h1>Loved Tracks</h1>
          <div className="loved-tracks-list">{this.renderLovedTrack()}</div>
        </section>
      );
    }
  }
}

export default LovedTracks;
