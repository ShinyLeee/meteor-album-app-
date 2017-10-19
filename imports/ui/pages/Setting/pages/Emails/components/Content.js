import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import Button from 'material-ui/Button';
import Divider from 'material-ui/Divider';
import List, { ListSubheader, ListItem, ListItemSecondaryAction, ListItemText } from 'material-ui/List';
import Menu, { MenuItem } from 'material-ui/Menu';
import IconButton from 'material-ui/IconButton';
import Input from 'material-ui/Input';
import MoreVertIcon from 'material-ui-icons/MoreVert';
import ContentLayout from '/imports/ui/layouts/ContentLayout';
import ModalLoader from '/imports/ui/components/Modal/Common/ModalLoader';

export default class EmailsContent extends Component {
  static propTypes = {
    User: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    modalOpen: PropTypes.func.isRequired,
    modalClose: PropTypes.func.isRequired,
    snackBarOpen: PropTypes.func.isRequired,
  }

  state = {
    anchorEl: null,
    email: '',
  }

  _handleEmailValueChange = (e) => {
    this.setState({ email: e.target.value });
  }

  _handleSentVerifyEmail = () => {
    this.renderLoadModal('发送邮件中');
    Meteor.callPromise('Accounts.sendVerifyEmail')
      .then(() => {
        this.props.modalClose();
        this.props.snackBarOpen('发送成功');
      })
      .catch((err) => {
        console.log(err);
        this.props.modalClose();
        this.props.snackBarOpen(`发送失败 ${err.reason}`);
      });
  }

  /**
   * Return the new gloabl counter and group state, when select or cancel one photo
   * @param {string} email - the email address in Menu item wait for remove
   */
  _handleRemoveEmail(email) {
    this.renderLoadModal('解除绑定邮箱中');
    Meteor.callPromise('Accounts.removeEmail', { email })
      .then(() => {
        this.props.modalClose();
        this.props.snackBarOpen('解除绑定邮箱成功');
      })
      .catch((err) => {
        console.log(err);
        this.props.modalClose();
        this.props.snackBarOpen(`解除邮箱绑定失败 ${err.reason}`);
      });
  }

  _handleAddEmail = () => {
    if (!this.state.email) {
      this.props.snackBarOpen('请输入新邮箱地址');
      return;
    }
    this.renderLoadModal('发送验证邮件中');
    Meteor.callPromise('Accounts.addEmail', { email: this.state.email })
      .then(() => {
        this.props.modalClose();
        this.props.snackBarOpen('添加成功，请前往邮箱进行验证');
      })
      .catch((err) => {
        console.log(err);
        this.props.modalClose();
        this.props.snackBarOpen(`更换邮箱失败 ${err.reason}`);
      });
  }

  renderLoadModal = (message, errMsg = '请求超时') => {
    this.props.modalOpen({
      content: <ModalLoader message={message} errMsg={errMsg} />,
      ops: { ignoreBackdropClick: true },
    });
  }

  render() {
    const { User, classes } = this.props;
    return (
      <ContentLayout loading={false}>
        <div className="content__settingEmails">
          <section className="settingEmails__current">
            <List subheader={<ListSubheader>邮箱列表</ListSubheader>}>
              {
              !User.emails || User.emails.length === 0
              ? (
                <ListItem>
                  <ListItemText primary="暂无邮箱" secondary="请即刻通过下方区域添加邮箱" />
                </ListItem>
              )
              : (
                _.map(User.emails, (email, i) => (
                  <ListItem key={email.address}>
                    <ListItemText
                      primary={email.address}
                      secondary={email.verified ? '验证通过' : '等待验证中'}
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={(e) => this.setState({ [`email_${i}`]: true, anchorEl: e.currentTarget })}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        open={this.state[`email_${i}`]}
                        anchorEl={this.state.anchorEl}
                        onRequestClose={() => this.setState({ [`email_${i}`]: false })}
                      >
                        {
                          !email.verified && (
                            <MenuItem onClick={this._handleSentVerifyEmail}>
                              重新发送验证邮件
                            </MenuItem>
                          )
                        }
                        <MenuItem onClick={() => this._handleRemoveEmail(email.address)}>
                          解除绑定
                        </MenuItem>
                      </Menu>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))
              )
            }
            </List>
          </section>
          <Divider />
          <section className="settingEmails__new">
            <List subheader={<ListSubheader>添加邮箱</ListSubheader>}>
              <ListItem>
                <Input
                  name="email"
                  value={this.state.email}
                  placeholder="邮箱地址"
                  onChange={this._handleEmailValueChange}
                  disableUnderline
                  fullWidth
                />
              </ListItem>
            </List>
          </section>
          <Divider />
          <section className="settingEmails__action">
            <p>邮箱用于登陆及修改密码等安全性操作，如若尚未绑定邮箱或仍未完成验证，请即刻完成邮箱绑定或验证，以保护账号安全。</p>
            <div>
              <Button
                className={classes.btn__add}
                onClick={this._handleAddEmail}
                raised
              >下一步
              </Button>
            </div>
          </section>
        </div>
      </ContentLayout>
    );
  }
}