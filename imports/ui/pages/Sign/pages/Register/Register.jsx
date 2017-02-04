import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import { browserHistory } from 'react-router';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import { createUser } from '/imports/api/users/methods.js';
import { checkCode, useCode } from '/imports/api/codes/methods.js';

import NavHeader from '/imports/ui/components/NavHeader/NavHeader.jsx';
import signHOC from '../../components/signHOC.js';
import styles from '../../sign.style.js';

class RegisterPage extends Component {

  constructor(props) {
    super(props);
    this.handleRegister = this.handleRegister.bind(this);
  }

  handleRegister(e) {
    e.preventDefault();

    const username = this.usrField.input.value;
    const password = this.pwdField.input.value;
    const password2 = this.pwd2Field.input.value;
    const code = this.codeField.input.value;

    if (!password || !password2) {
      this.props.snackBarOpen('请输入密码');
      return;
    }
    if (password !== password2) {
      this.props.snackBarOpen('请确认两次密码输入是否正确');
      return;
    }
    if (password.length < 6) {
      this.props.snackBarOpen('密码长度必须大于6位');
      return;
    }
    checkCode.callPromise({ codeNo: code })
    .then((isExist) => {
      if (!isExist) {
        throw new Meteor.Error(403, '此邀请码不存在或已被使用');
      }
      return createUser.callPromise({ username, password });
    })
    .then(() => useCode.callPromise({ codeNo: code }))
    .then(() => {
      const loginWithPassword = Meteor.wrapPromise(Meteor.loginWithPassword);
      return loginWithPassword(username, password);
    })
    .then(() => {
      browserHistory.replace('/');
      this.props.snackBarOpen('登陆成功');
    })
    .catch((err) => {
      this.props.snackBarOpen(err.reason);
      console.log(err); // eslint-disable-line no-console
      throw new Meteor.Error(err);
    });
  }

  render() {
    return (
      <div className="container">
        <NavHeader primary />
        <div className="content__register">
          <div className="register__logo">Gallery +</div>
          <div className="register__form">
            <TextField
              hintText="用户名"
              ref={(ref) => { this.usrField = ref; }}
              fullWidth
            /><br />
            <TextField
              hintText="密码"
              ref={(ref) => { this.pwdField = ref; }}
              type="password"
              fullWidth
            /><br />
            <TextField
              hintText="确认密码"
              ref={(ref) => { this.pwd2Field = ref; }}
              type="password"
              fullWidth
            /><br />
            <TextField
              hintText="邀请码"
              ref={(ref) => { this.codeField = ref; }}
              type="text"
              fullWidth
            /><br />
          </div>
          <div className="register__button">
            <RaisedButton
              label="注册"
              labelStyle={styles.label}
              buttonStyle={styles.logBtn}
              onTouchTap={this.handleRegister}
              fullWidth
            />
            <div className="separator">或</div>
            <RaisedButton
              label="已有账号?"
              labelStyle={styles.label}
              buttonStyle={styles.regBtn}
              onTouchTap={() => browserHistory.push('/login')}
              fullWidth
            />
          </div>
        </div>
      </div>
    );
  }

}

RegisterPage.displayName = 'RegisterPage';

RegisterPage.propTypes = {
  snackBarOpen: PropTypes.func.isRequired,
};

export default signHOC(RegisterPage);
