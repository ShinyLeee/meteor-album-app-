import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Button from 'material-ui/Button';
import Input from 'material-ui/Input';
import { checkCode, useCode } from '/imports/api/codes/methods';
import ContentLayout from '/imports/ui/layouts/ContentLayout';
import ModalLoader from '/imports/ui/components/Modal/Common/ModalLoader';

export default class RegisterContent extends Component {
  static propTypes = {
    userLogin: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    modalOpen: PropTypes.func.isRequired,
    modalClose: PropTypes.func.isRequired,
    snackBarOpen: PropTypes.func.isRequired,
  }

  state = {
    email: '',
    username: '',
    password: '',
    password2: '',
    code: '',
  }

  _handleChange = key => evt => {
    this.setState({
      [key]: evt.target.value,
    });
  }

  _handleRegister = () => {
    const { email, username, password, password2, code } = this.state;

    if (!email || !username || !password || !password2) {
      this.props.snackBarOpen('请输入必填项');
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

    this.renderLoadModal('创建账号中');
    checkCode.callPromise({ codeNo: code })
      .then((isExist) => {
        if (!isExist) {
          throw new Meteor.Error(403, '此邀请码不存在或已被使用');
        }
        return Meteor.callPromise('Accounts.createUser', { username, email, password });
      })
      .then(() => useCode.callPromise({ codeNo: code }))
      .then(() => {
        const loginWithPassword = Meteor.wrapPromise(Meteor.loginWithPassword);
        return loginWithPassword(username, password);
      })
      .then(() => {
        const userObj = Meteor.user();
        this.props.modalClose();
        this.props.userLogin(userObj);
        this.props.history.replace('/');
        this.props.snackBarOpen('注册成功');
      })
      .catch((err) => {
        console.log(err);
        this.props.modalClose();
        this.props.snackBarOpen(`注册失败 ${err.reason}`);
      });
  }

  renderLoadModal = (message, errMsg = '请求超时') => {
    this.props.modalOpen({
      content: <ModalLoader message={message} errMsg={errMsg} />,
      ops: { ignoreBackdropClick: true },
    });
  }

  render() {
    const { classes } = this.props;
    return (
      <ContentLayout loading={false}>
        <div className="content__register">
          <header className="register__logo">Gallery +</header>
          <section className="register__form">
            <Input
              className={classes.input}
              value={this.state.email}
              placeholder="邮箱"
              onChange={this._handleChange('email')}
              disableUnderline
              fullWidth
            /><br />
            <Input
              className={classes.input}
              value={this.state.username}
              placeholder="用户名"
              onChange={this._handleChange('username')}
              disableUnderline
              fullWidth
            /><br />
            <Input
              className={classes.input}
              value={this.state.password}
              placeholder="密码"
              onChange={this._handleChange('password')}
              disableUnderline
              type="password"
              fullWidth
            /><br />
            <Input
              className={classes.input}
              value={this.state.password2}
              placeholder="确认密码"
              onChange={this._handleChange('password2')}
              disableUnderline
              type="password"
              fullWidth
            /><br />
            <Input
              className={classes.input}
              value={this.state.code}
              placeholder="邀请码"
              onChange={this._handleChange('code')}
              disableUnderline
              type="text"
              fullWidth
            /><br />
          </section>
          <section className="register__button">
            <Button
              className={classes.btn__register}
              onClick={this._handleRegister}
              raised
            >注册
            </Button>
            <div className="separator">或</div>
            <Button
              className={classes.btn__login}
              onClick={() => this.props.history.push('/login')}
              raised
            >已有账号
            </Button>
          </section>
        </div>
      </ContentLayout>
    );
  }
}