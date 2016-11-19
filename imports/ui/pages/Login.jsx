import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import { purple500, grey500 } from 'material-ui/styles/colors';

import NavHeader from '../components/NavHeader.jsx';
import { snackBarOpen } from '../actions/actionTypes.js';

const styles = {
  logBtn: {
    fontFamily: 'Microsoft Yahei',
    backgroundColor: purple500,
  },
  regBtn: {
    fontFamily: 'Microsoft Yahei',
    backgroundColor: grey500,
  },
  label: {
    color: '#fff',
  },
};

class Login extends Component {

  constructor(props) {
    super(props);
    this.handleLogin = this.handleLogin.bind(this);
  }

  handleLogin() {
    const usr = this.usrInput.input.value;
    const pwd = this.pwdInput.input.value;

    const { dispatch } = this.props;

    this.usrInput.blur();
    this.pwdInput.blur();

    Meteor.loginWithPassword(usr, pwd, (err) => {
      if (err) {
        dispatch(snackBarOpen(err.message));
        console.error(err); // eslint-disable-line no-console
        return false;
      }
      this.context.router.replace('/');
      dispatch(snackBarOpen('登录成功'));
      return true;
    });
  }

  render() {
    return (
      <div className="container">
        <NavHeader primary />
        <div className="default-page">
          <div className="logo-zone">Gallery +</div>
          <div className="input-zone">
            <TextField
              hintText="邮箱"
              ref={(ref) => { this.usrInput = ref; }}
              fullWidth
            /><br />
            <TextField
              hintText="密码"
              ref={(ref) => { this.pwdInput = ref; }}
              type="password"
              fullWidth
            /><br />
          </div>
          <div className="button-zone">
            <RaisedButton
              label="立即登录"
              labelStyle={styles.label}
              buttonStyle={styles.logBtn}
              onTouchTap={this.handleLogin}
              fullWidth
            />
            <div className="separator">或</div>
            <RaisedButton
              label="创建账号"
              labelStyle={styles.label}
              buttonStyle={styles.regBtn}
              containerElement={<Link to={'/register'} />}
              fullWidth
            />
          </div>
        </div>
      </div>
    );
  }

}

Login.propTypes = {
  dispatch: PropTypes.func,
};

// If contextTypes is not defined, then context will be an empty object.
Login.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default connect()(Login);