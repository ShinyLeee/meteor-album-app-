import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { likeImage, unlikeImage } from '/imports/api/images/methods.js';

import { zoomerOpen, snackBarOpen } from '/imports/ui/redux/actions/index.js';
import ImageHolder from '../ImageHolder/ImageHolder.jsx';

class ImageList extends Component {

  constructor(props) {
    super(props);
    this.handleAddLiker = this.handleAddLiker.bind(this);
    this.handleRemoveLiker = this.handleRemoveLiker.bind(this);
    this.handleZoomImage = this.handleZoomImage.bind(this);
  }

  componentWillUnmount() {
    if (this.zoomPromise) {
      this.zoomPromise.cancel();
    }
  }

  handleAddLiker(image) {
    const { User } = this.props;

    if (!User) {
      this.props.snackBarOpen('您还尚未登录');
      return;
    }

    likeImage.call({
      imageId: image._id,
      liker: User.username,
    }, (err) => {
      if (err) {
        this.props.snackBarOpen(err.message);
        return;
      }
      this.props.onLikeOrUnlikeAction();
    });
  }

  handleRemoveLiker(image) {
    const { User } = this.props;

    unlikeImage.call({
      imageId: image._id,
      unliker: User.username,
    }, (err) => {
      if (err) {
        this.props.snackBarOpen(err.message);
        return;
      }
      this.props.onLikeOrUnlikeAction();
    });
  }

  handleZoomImage(image) {
    this.props.zoomerOpen(image);
    document.body.style.overflow = 'hidden';
  }

  render() {
    const { User, domain, clientWidth, images } = this.props;
    return (
      <div className="component__ImageList">
        {
          images.map((image, i) => {
            // get avatar src
            const user = Meteor.users.findOne({ username: image.user });
            const avatar = user && user.profile.avatar;

            // get image src
            const url = `${domain}/${image.user}/${image.collection}/${image.name}.${image.type}`;
            const src = `${url}?imageView2/2/w/${clientWidth * 2}`;

            // whether current user liked this image
            const curUser = User && User.username;
            const isLiked = image.liker.indexOf(curUser) > -1;
            return (
              <ImageHolder
                key={i}
                User={User}
                avatar={avatar}
                image={image}
                imageSrc={src}
                isLiked={isLiked}
                onLikeClick={() => this.handleAddLiker(image)}
                onUnlikeClick={() => this.handleRemoveLiker(image)}
                onMediaClick={() => this.handleZoomImage(image)}
              />
            );
          })
        }
      </div>
    );
  }
}

ImageList.displayName = 'ImageList';

ImageList.defaultProps = {
  domain: Meteor.settings.public.domain,
  clientWidth: document.body.clientWidth,
};

ImageList.propTypes = {
  User: PropTypes.object,
  domain: PropTypes.string.isRequired,
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
