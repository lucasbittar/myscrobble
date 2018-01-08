import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="Footer">
      <div className="container">
        <p>
          &copy;2015 - {new Date().getFullYear()} | MyScrobble.fm - Created by{' '}
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
};

export default Footer;
