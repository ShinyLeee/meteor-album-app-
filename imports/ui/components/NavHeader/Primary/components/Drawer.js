import PropTypes from 'prop-types';
import classNames from 'classnames';
import React, { PureComponent } from 'react';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { withStyles } from 'material-ui/styles';
import Avatar from 'material-ui/Avatar';
import Divider from 'material-ui/Divider';
import Drawer from 'material-ui/Drawer';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Popover from 'material-ui/Popover';
import UserIcon from 'material-ui-icons/AccountCircle';
import ExploreIcon from 'material-ui-icons/Explore';
import CameraIcon from 'material-ui-icons/Camera';
import DiaryIcon from 'material-ui-icons/Book';
import DeleteIcon from 'material-ui-icons/Delete';
import SettingsIcon from 'material-ui-icons/Settings';
import ArrowDropdownIcon from 'material-ui-icons/ArrowDropDown';
import Modal from '/imports/ui/components/Modal';
import settings from '/imports/utils/settings';
import { userLogout } from '/imports/ui/redux/actions';
import {
  DrawerProfile,
  DrawerBackground,
  DrawerAvatar,
  DrawerEmail,
} from '../Primary.style';

const noop = () => {};

const { sourceDomain } = settings;

class NavHeaderDrawer extends PureComponent {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    User: PropTypes.object,
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    userLogout: PropTypes.func.isRequired,
  }

  state = {
    popover: false,
    popoverAnchor: undefined,
  }

  get avatarSrc() {
    const { User } = this.props;
    const defaultAvatar = `${sourceDomain}/GalleryPlus/Default/default-avatar.jpg`;
    return User ? User.profile.avatar : defaultAvatar;
  }

  get coverSrc() {
    const { User } = this.props;
    const defaultCover = `url(${sourceDomain}/GalleryPlus/Default/default-cover.jpg)`;
    return User ? `url("${User.profile.cover}")` : defaultCover;
  }

  _navTo = (to) => () => {
    const { location: { pathname } } = this.props;
    if (pathname === to) {
      this.props.onRequestClose();
    }
    this.props.history.push(to);
  }

  _handleLogout = async () => {
    this.props.onRequestClose();
    await Modal.showLoader('登出中');
    await this.props.userLogout();
    Modal.close();
  }

  renderPopover = (e) => {
    this.setState({
      popover: true,
      popoverAnchor: e.currentTarget,
    });
  }

  render() {
    const {
      visible,
      User,
      match,
      classes,
      onRequestClose,
    } = this.props;
    const indexPage = match.path === '/';
    const userPage = !!match.params.username;
    return (
      <Drawer
        open={visible}
        classes={{ paper: classes.drawer }}
        onRequestClose={onRequestClose}
      >
        <DrawerProfile style={{ backgroundImage: this.coverSrc }}>
          <DrawerBackground />
          <DrawerAvatar>
            <Avatar
              className={classes.avatar}
              src={this.avatarSrc}
              onClick={User ? this._navTo(`/user/${User.username}`) : noop}
            />
          </DrawerAvatar>
          {
            User && (
              <DrawerEmail>
                <span>{(User.emails && User.emails[0].address) || User.username}</span>
                <ArrowDropdownIcon color="#fff" onClick={this.renderPopover} />
                <Popover
                  open={this.state.popover}
                  anchorEl={this.state.popoverAnchor}
                  anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
                  transformOrigin={{ horizontal: 'center', vertical: 'top' }}
                  onRequestClose={() => this.setState({ popover: false })}
                >
                  <List>
                    <ListItem onClick={this._handleLogout}>
                      <ListItemText primary="登出" />
                    </ListItem>
                  </List>
                </Popover>
              </DrawerEmail>
            )
          }
        </DrawerProfile>
        <Divider />
        <div>
          <List>
            <ListItem
              onClick={this._navTo('/')}
              button
            >
              <ListItemIcon className={classNames({ [classes.purple]: indexPage })}>
                <ExploreIcon />
              </ListItemIcon>
              <ListItemText
                classes={indexPage ? { text: classes.purple } : {}}
                primary="探索"
              />
            </ListItem>
            <ListItem
              onClick={User ? this._navTo(`/user/${User.username}`) : this._navTo('/login')}
              button
            >
              <ListItemIcon className={classNames({ [classes.red]: userPage })}>
                <UserIcon />
              </ListItemIcon>
              <ListItemText
                classes={userPage ? { text: classes.red } : {}}
                primary="主页"
              />
            </ListItem>
            <ListItem
              onClick={User ? this._navTo(`/user/${User.username}/collection`) : this._navTo('/login')}
              button
            >
              <ListItemIcon>
                <CameraIcon />
              </ListItemIcon>
              <ListItemText primary="相册" />
            </ListItem>
            <ListItem
              onClick={this._navTo('/diary')}
              button
            >
              <ListItemIcon>
                <DiaryIcon />
              </ListItemIcon>
              <ListItemText primary="日记" />
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem
              onClick={this._navTo('/recycle')}
              button
            >
              <ListItemIcon>
                <DeleteIcon />
              </ListItemIcon>
              <ListItemText primary="回收站" />
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem
              onClick={this._navTo('/setting')}
              button
            >
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="设置" />
            </ListItem>
          </List>
        </div>
      </Drawer>
    );
  }
}

const mapStateToProps = ({ sessions }) => ({
  User: sessions.User,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  userLogout,
}, dispatch);

const styles = {
  drawer: {
    width: '70%',
  },

  avatar: {
    width: 54,
    height: 54,
  },

  purple: {
    color: '#764ba2',
  },

  red: {
    color: 'rgb(196, 58, 48)',
  },
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
  withRouter,
)(NavHeaderDrawer);
