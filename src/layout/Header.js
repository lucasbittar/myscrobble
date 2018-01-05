import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

class Header extends Component {
  render() {
    return (
      <header className="Header">
        <div className="container">
          <Link to={'/'}>
            <label className="navbar-brand" htmlFor="info-toggle">
              MyScrobble.fm{this.props.username.user.name
                ? `/${this.props.username.user.name}`
                : ''}
            </label>
          </Link>
        </div>
      </header>
    );
  }
}

export default Header;
