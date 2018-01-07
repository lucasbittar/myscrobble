import React, { Component } from 'react';

import './LastTrack.css';
import TrackBackground from './TrackBackground';
import eq from '../images/eq.gif';
import favicon from '../images/favicon.ico';
import faviconNowPlaying from '../images/favicon-playing.ico';

class LastTrack extends Component {
  extractAlbumCover(images) {
    let image = images.filter((image) => image.size === 'extralarge');
    return image[0]['#text'];
  }
  renderDate(date) {
    var link = document.createElement('link');
    link.rel = favicon;
    link.href = 'favicon.ico?v=2.2';
    document.getElementsByTagName('head')[0].appendChild(link);

    return <span className="date">{date['#text']}</span>;
  }
  renderOnTour() {
    return (
      <span className="ontour">
        <span className="glyphicon glyphicon-fire" aria-hidden="true" />
        On tour!
      </span>
    );
  }
  renderNowPlaying() {
    let link = document.createElement('link');
    link.rel = 'shortcut icon';
    link.href = faviconNowPlaying;
    link.type = 'image/x-icon';

    document.getElementsByTagName('head')[0].appendChild(link);

    return (
      <div>
        <img
          src={eq}
          alt="Now Playing!"
          style={{ display: 'block', width: 75, margin: '0 auto' }}
        />
        <span className="listening">Now Listening!</span>
      </div>
    );
  }
  render() {
    if (this.props.track === undefined) {
      return (
        <section className="last-track-wrap">
          <div className="last-track">
            <div>Fetching your last track info...</div>
          </div>
        </section>
      );
    } else {
      const { image, name, artist, date, album } = this.props.track;
      const { ontour } = this.props.artist;
      return (
        <section className="last-track-wrap">
          <div className="last-track">
            <img src={this.extractAlbumCover(image)} alt={album['#text']} />
            <h1>
              <a href={this.props.track.url}>{name}</a>
            </h1>
            <h2>
              <a href={this.props.artist.url}>{artist['#text']}</a>
            </h2>
            {ontour === '1' ? this.renderOnTour() : ''}
            {date ? this.renderDate(date) : this.renderNowPlaying()}
          </div>
          <TrackBackground imageUrl={this.props.imageUrl} />
        </section>
      );
    }
  }
}

export default LastTrack;
