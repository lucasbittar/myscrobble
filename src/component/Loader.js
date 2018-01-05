import React, { Component } from 'react';
import './Loader.css';
import ajaxLoader from '../images/ajax-loader.gif';

class Loader extends Component {
  render() {
    return (
      <div
        className={
          this.props.fetchingUser && this.props.fetchingArtist
            ? 'Loader show'
            : 'Loader'
        }
      >
        <div className="loader-label">
          <img src={ajaxLoader} alt="Loading..." />
          {this.props.label}
        </div>
      </div>
    );
  }
}

export default Loader;
