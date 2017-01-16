import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import LinearProgress from 'material-ui/LinearProgress';
import { Images } from '/imports/api/images/image.js';
import { makeCancelable } from '/imports/utils/utils.js';

import NavHeader from '../../components/NavHeader/NavHeader.jsx';
import Infinity from '../../components/Infinity/Infinity.jsx';
import Recap from '../../components/Recap/Recap.jsx';
import PicHolder from '../../components/PicHolder/PicHolder.jsx';
import ZoomerHolder from '../../components/ZoomerHolder/ZoomerHolder.jsx';

const styles = {
  indeterminateProgress: {
    position: 'fixed',
    backgroundColor: 'none',
    zIndex: 99,
  },
};

export default class IndexPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      location: 'explore',
      isLoading: false,
      images: props.initialImages,
    };
    this.handleLoadImages = this.handleLoadImages.bind(this);
    this.handleRefreshImages = this.handleRefreshImages.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // When dataIsReady return true start setState
    if (nextProps.dataIsReady) {
      this.setState({
        images: nextProps.initialImages,
      });
    }
  }

  componentWillUnmount() {
    // If lifecyle is in componentWillUnmount,
    // But if promise still in progress then Cancel the promise
    if (this.loadPromise) {
      this.loadPromise.cancel();
    }
  }

  handleLoadImages() {
    const { limit } = this.props;
    const { images } = this.state;
    const skip = images.length;
    this.setState({ isLoading: true });
    const loadPromise = new Promise((resolve) => {
      Meteor.defer(() => {
        const newImages = Images.find(
          { private: { $ne: true } },
          { sort: { createdAt: -1 }, limit, skip }).fetch();
        const curImages = [...images, ...newImages];
        this.setState({ images: curImages }, () => resolve());
      });
    });

    this.loadPromise = makeCancelable(loadPromise);
    this.loadPromise
      .promise
      .then(() => {
        this.setState({ isLoading: false });
      })
      .catch((err) => {
        throw new Meteor.Error(err);
      });
  }

  handleRefreshImages() {
    // after like or unlike a image, we need to refresh the data
    const trueImages = Images.find(
      { private: { $ne: true } },
      { sort: { createdAt: -1 }, limit: this.state.images.length }).fetch();
    this.setState({ images: trueImages });
  }

  renderPicHolder() {
    const { users } = this.props;
    const images = this.state.images;
    images.forEach((image) => {
      const img = image;
      users.forEach((user) => {
        if (user.username === img.user) {
          img.avatar = user.profile.avatar;
        }
      });
    });
    return images.map((image, i) => (
      <PicHolder
        key={i}
        User={this.props.User}
        image={image}
        clientWidth={this.props.clientWidth}
        onLikeOrUnlikeAction={this.handleRefreshImages}
      />
    ));
  }

  render() {
    return (
      <div className="container">
        <NavHeader
          User={this.props.User}
          location={this.state.location}
          noteNum={this.props.noteNum}
          snackBarOpen={this.props.snackBarOpen}
          primary
        />
        { !this.props.dataIsReady
          && (<LinearProgress style={styles.indeterminateProgress} mode="indeterminate" />) }
        <div className="content">
          <Recap
            title="Gallery"
            detailFir="Vivian的私人相册"
            detailSec="Created By Shiny Lee"
            showIcon
          />
          { this.props.dataIsReady && (
            <div className="content__index">
              <Infinity
                isLoading={this.state.isLoading}
                onInfinityLoad={this.handleLoadImages}
                offsetToBottom={100}
              >
                { this.renderPicHolder() }
                <ZoomerHolder clientWidth={this.props.clientWidth} />
              </Infinity>
            </div>
            )
          }
        </div>
      </div>
    );
  }

}

IndexPage.displayName = 'IndexPage';

IndexPage.defaultProps = {
  clientWidth: document.body.clientWidth, // for PicHolder and ZoomerHolder
};

IndexPage.propTypes = {
  User: PropTypes.object,
  clientWidth: PropTypes.number.isRequired,
  // Below Pass from database
  limit: PropTypes.number.isRequired,
  dataIsReady: PropTypes.bool.isRequired,
  users: PropTypes.array.isRequired,
  noteNum: PropTypes.number.isRequired,
  initialImages: PropTypes.array.isRequired,
  snackBarOpen: PropTypes.func.isRequired,
};
