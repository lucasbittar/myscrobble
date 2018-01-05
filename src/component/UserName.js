import React, { Component } from 'react';
import { connect } from 'react-redux';
import './UserName.css';

import { fetchUser } from '../actions/userActions';

class UserName extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleChange(event) {
    this.setState({ username: event.target.value });
  }
  handleSubmit(event) {
    event.preventDefault();
    this.props.dispatch(fetchUser(this.state.username));
    this.props.history.push(`/scrobble/${this.state.username}`);
  }
  render() {
    return (
      <section className="UserName">
        <h1 className="username-h1 elements-hidden">
          Welcome to MyScrobble.fm!
        </h1>
        <p className="username-p elements-hidden">
          Type in your Last.fm username below
        </p>
        <form
          id="username"
          onSubmit={this.handleSubmit}
          className="username-form elements-hidden"
        >
          <div className="form-container">
            <input
              type="text"
              className="username-input"
              placeholder="Last.fm username"
              value={this.state.username}
              onChange={this.handleChange}
            />
            <input type="submit" value="♫" className="username-submit" />
          </div>
        </form>
      </section>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user,
  };
}

export default connect(mapStateToProps)(UserName);
