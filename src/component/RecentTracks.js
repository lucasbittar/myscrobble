import React, { Component } from 'react';

import './RecentTracks.css';

class RecentTracks extends Component {
  extractAlbumCover(images) {
    let image = images.filter((image) => image.size === 'extralarge');
    return image[0]['#text'];
  }
  renderDate(date) {
    return <span className="date">{date['#text']}</span>;
  }
  renderRecentTrack() {
    return this.props.tracks.map((track, i) => (
      <div className="track is-showing-tracks" key={i}>
        <img
          src={this.extractAlbumCover(track.image)}
          alt={track.album['#text']}
        />
        <div className="track-info">
          <h1>
            <a href={track.url}>
              {track.artist['#text']} - {track.name}
            </a>
          </h1>
          {track.date ? this.renderDate(track.date) : 'Now Playing!'}
        </div>
      </div>
    ));
  }
  render() {
    if (this.props.fetching) {
      return <div>Loading...</div>;
    } else {
      return (
        <section className="recent-tracks">
          <h1>Recent Tracks</h1>
          <div className="recent-tracks-list">{this.renderRecentTrack()}</div>
        </section>
      );
    }
  }
}

export default RecentTracks;
