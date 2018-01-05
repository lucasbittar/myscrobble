import React, { Component } from 'react';
import './Footer.css';

class Footer extends Component {
  render() {
    return (
      <footer className="Footer">
        <div className="container">
          <p>
            &copy;2015 MyScrobble.fm - Created by{' '}
            <a
              href="http://lucasbittar.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              Lucas Bittar
            </a>.
          </p>
        </div>
      </footer>
    );
  }
}

export default Footer;
