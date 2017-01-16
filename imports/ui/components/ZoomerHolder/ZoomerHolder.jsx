import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import moment from 'moment';
import IconButton from 'material-ui/IconButton';
import CameraIcon from 'material-ui/svg-icons/image/camera-alt';
import HeartIcon from 'material-ui/svg-icons/action/favorite';
import AddIcon from 'material-ui/svg-icons/content/add';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import InfoIcon from 'material-ui/svg-icons/action/info';
import TimelineIcon from 'material-ui/svg-icons/action/timeline';

import { zoomerClose, snackBarOpen } from '../../redux/actions/index.js';

class ZoomerHolder extends Component {

  constructor(props) {
    super(props);
    this.handleClose = this.handleClose.bind(this);
    this.handlePrompt = this.handlePrompt.bind(this);
  }

  handleClose() {
    const { dispatch } = this.props;
    document.body.style.overflow = '';
    dispatch(zoomerClose());
  }

  handlePrompt() {
    const { dispatch } = this.props;
    dispatch(snackBarOpen('功能开发中'));
  }

  render() {
    const { open, image, clientWidth } = this.props;
    if (!open) {
      return <div />;
    }
    const url = `${this.props.domain}/${image.user}/${image.collection}/${image.name}.${image.type}`;
    const src = `${url}?imageView2/0/w/${clientWidth * 2}`;
    const styles = {
      zoomer: {
        width: open ? '100%' : 0,
        height: open ? '100%' : 0,
        zIndex: open ? 1200 : 0,
      },
      imageHolder: {
        backgroundColor: '#68655B',
        backgroundImage: `url(${src})`,
        backgroundSize: 'cover',
        backgroundPosition: '50%',
      },
      iconButton: {
        color: '#fff',
      },
    };
    return (
      <div className="component__ZoomerHolder" style={styles.zoomer}>
        <div
          className="ZoomerHolder__image"
          style={styles.imageHolder}
          onTouchTap={this.handleClose}
        >
          <div className="ZoomerHolder__background" />
        </div>
        <div className="ZoomerHolder__toolbox">
          <div className="ZoomerHolder__logo">
            <IconButton iconStyle={styles.iconButton}>
              <CameraIcon />
            </IconButton>
          </div>
          <div className="ZoomerHolder__action">
            <IconButton iconStyle={styles.iconButton} onTouchTap={this.handlePrompt}>
              <HeartIcon />
            </IconButton>
            <IconButton iconStyle={styles.iconButton} onTouchTap={this.handlePrompt}>
              <AddIcon />
            </IconButton>
            <IconButton iconStyle={styles.iconButton} onTouchTap={this.handlePrompt}>
              <DownloadIcon />
            </IconButton>
          </div>
        </div>
        <div className="ZoomerHolder__info">
          <div className="ZoomerHolder__profile">
            <img
              src={image.avatar}
              role="presentation"
              onTouchTap={() => browserHistory.push(`/user/${image.user}`)}
            />
            <div className="ZoomerHolder__detail">
              <span className="ZoomerHolder__title">
                {image.user}
              </span>
              <span className="ZoomerHolder__subtitle">
                {moment(image.createdAt).format('YYYY-MM-DD HH:mm')}
              </span>
            </div>
          </div>
          <div className="ZoomerHolder__action">
            <IconButton iconStyle={styles.iconButton} onTouchTap={this.handlePrompt}>
              <TimelineIcon />
            </IconButton>
            <IconButton iconStyle={styles.iconButton} onTouchTap={this.handlePrompt}>
              <InfoIcon />
            </IconButton>
          </div>
        </div>
      </div>
    );
  }
}

ZoomerHolder.defaultProps = {
  domain: Meteor.settings.public.domain,
};

ZoomerHolder.propTypes = {
  domain: PropTypes.string.isRequired,
  clientWidth: PropTypes.number.isRequired,
  open: PropTypes.bool.isRequired,
  image: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  if (state.zoomer) {
    return {
      open: state.zoomer.open,
      image: state.zoomer.image,
    };
  }
  return { open: false };
};

export default connect(mapStateToProps)(ZoomerHolder);
