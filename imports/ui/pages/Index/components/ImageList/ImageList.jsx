import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { makeCancelable } from '/imports/utils/utils.js';
import { likeImage, unlikeImage } from '/imports/api/images/methods.js';

import { zoomerOpen, snackBarOpen } from '/imports/ui/redux/actions/index.js';
import ImageHolder from '/imports/ui/components/ImageHolder/ImageHolder.jsx';

const domain = Meteor.settings.public.domain;

class ImageList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      zoomer: false,
    };
    this.handleOpenPrompt = this.handleOpenPrompt.bind(this);
    this.handleAddLiker = this.handleAddLiker.bind(this);
    this.handleRemoveLiker = this.handleRemoveLiker.bind(this);
    this.handleForbidden = this.handleForbidden.bind(this);
    this.handleZoomImage = this.handleZoomImage.bind(this);
  }

  componentWillUnmount() {
    if (this.zoomPromise) {
      this.zoomPromise.cancel();
    }
  }

  handleOpenPrompt() {
    this.props.snackBarOpen('功能开发中');
  }

  handleAddLiker(image) {
    const imageId = image._id;
    const liker = this.props.User._id;

    likeImage.call({
      imageId,
      liker,
    }, (err) => {
      if (err) {
        this.props.snackBarOpen(err.message);
      }
      this.props.onLikeOrUnlikeAction();
    });
  }

  handleRemoveLiker(image) {
    const imageId = image._id;
    const unliker = this.props.User._id;

    unlikeImage.call({
      imageId,
      unliker,
    }, (err) => {
      if (err) {
        this.props.snackBarOpen(err.message);
      }
      this.props.onLikeOrUnlikeAction();
    });
  }

  handleForbidden() {
    this.props.snackBarOpen('您还未登录');
  }

  handleZoomImage(image) {
    const zoomImage = new Promise((resolve) => {
      this.setState({ zoomer: true }, resolve);
    });

    this.zoomPromise = makeCancelable(zoomImage);
    this.zoomPromise
      .promise
      .then(() => {
        this.props.zoomerOpen(image);
      })
      .then(() => {
        document.body.style.overflow = 'hidden';
      })
      .catch((err) => console.log(err)); // eslint-disable-line
  }

  render() {
    const { User, clientWidth, images } = this.props;
    return (
      <div className="component__ImageList">
        {
          images.map((image, i) => {
            const url = `${domain}/${image.user}/${image.collection}/${image.name}.${image.type}`;
            const src = `${url}?imageView2/2/w/${clientWidth * 2}`;
            const likers = image.liker;
            const curUser = User && User._id;
            const isLiked = likers.indexOf(curUser) > -1;
            return (
              <ImageHolder
                key={i}
                image={image}
                src={src}
                isLiked={isLiked}
                onLikeClick={() => this.handleAddLiker(image)}
                onUnlikeClick={() => this.handleRemoveLiker(image)}
                onMediaClick={() => this.handleZoomImage(image)}
                onCommentClick={this.handleOpenPrompt}
                onReplyClick={this.handleOpenPrompt}
              />
            );
          })
        }
      </div>
    );
  }
}

ImageList.displayName = 'ImageList';

ImageList.propTypes = {
  User: PropTypes.object,
  clientWidth: PropTypes.number.isRequired,
  images: PropTypes.array.isRequired,
  onLikeOrUnlikeAction: PropTypes.func.isRequired,
  snackBarOpen: PropTypes.func.isRequired,
  zoomerOpen: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => state;

const mapDispatchToProps = (dispatch) => bindActionCreators({
  snackBarOpen,
  zoomerOpen,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ImageList);