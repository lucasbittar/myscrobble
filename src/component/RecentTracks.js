import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import './RecentTracks.css';

class RecentTracks extends Component {
  extractAlbumCover(images) {
    let image = images.filter((image) => image.size === 'extralarge');
    return image[0]['#text'];
  }
  renderDate(date) {
    return <span className="date">{date['#text']}</span>;
  }
  componentDidMount() {
    window.addEventListener('scroll', (event) => {
      let rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
      let scrollTop = window.pageYOffset;
      let windowHeight = window.innerHeight;
      if (scrollTop > rect.y - windowHeight / 2) {
        console.error('Reveal Recent Tracks!');
      }
      // console.log('Window scrolling', scrollTop);
      // console.log('Element position', rect);
    });
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
    if (this.props.tracks === undefined) {
      return <div>Fetching your last track info...</div>;
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
