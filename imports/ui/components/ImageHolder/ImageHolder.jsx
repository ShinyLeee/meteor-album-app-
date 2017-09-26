import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import TimeAgo from 'react-timeago';
import CNStrings from 'react-timeago/lib/language-strings/zh-CN';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';
import LazyLoad from 'react-lazyload';
import Avatar from 'material-ui/Avatar';
import { Card, CardHeader, CardActions, CardMedia } from 'material-ui/Card';
import HeartIcon from 'material-ui/svg-icons/action/favorite';
import EmptyHeartIcon from 'material-ui/svg-icons/action/favorite-border';
import CommentIcon from 'material-ui/svg-icons/communication/chat-bubble-outline';
import { Comments } from '/imports/api/comments/comment.js';
import { snackBarOpen } from '/imports/ui/redux/actions/index.js';
import CommentList from './components/CommentList.jsx';
import {
  Wrapper,
  ActionButtonWrapper,
  ActionButtonNum,
  StyledIconButton,
  Image,
} from './ImageHolder.style.js';

const formatter = buildFormatter(CNStrings);

const domain = Meteor.settings.public.imageDomain;

class ImageHolder extends Component {
  static propTypes = {
    image: PropTypes.object.isRequired,
    onLikeClick: PropTypes.func.isRequired,
    onUnlikeClick: PropTypes.func.isRequired,
    onMediaClick: PropTypes.func.isRequired,
    // Below Pass from Database and Redux
    User: PropTypes.object, // not required bc guest can visit it
    comments: PropTypes.array.isRequired,
    snackBarOpen: PropTypes.func.isRequired,
    // Below Pass from React-Router
    history: PropTypes.object.isRequired,
  }

  static defaultProps = {
    comments: [],
  }

  constructor(props) {
    super(props);
    this._clientWidth = document.body.clientWidth;
    this._pixelRatio = window.devicePixelRatio;
    this.state = {
      isCommentOpen: false,
    };
  }

  _handleMediaTouch = () => {
    this.props.onMediaClick(this.props.image);
  }

  _handleLike = () => {
    this.props.onLikeClick(this.props.image);
  }

  _handleUnlike = () => {
    this.props.onUnlikeClick(this.props.image);
  }

  render() {
    const {
      User,
      image,
      comments,
      history,
    } = this.props;

    // get avatar src
    const imageOwner = Meteor.users.findOne({ username: image.user });
    const avatar = imageOwner && imageOwner.profile.avatar;

    // get image src
    const url = `${domain}/${image.user}/${image.collection}/${image.name}.${image.type}`;
    const retinaWidth = Math.round(this._clientWidth * this._pixelRatio);

    // realHeight for lazyload
    const realHeight = Math.round((image.dimension[1] / image.dimension[0]) * this._clientWidth);

    const imageSrc = `${url}?imageView2/2/w/${retinaWidth}`;

    const isLiked = User && image.liker.indexOf(User.username) > -1;

    return (
      <Wrapper>
        <Card>
          <CardHeader
            title={image.user}
            subtitle={<TimeAgo date={image.createdAt} formatter={formatter} />}
            avatar={(
              <Avatar
                src={avatar}
                onTouchTap={() => history.push(`/user/${image.user}`)}
              />
            )}
          />
          <CardMedia
            style={{ height: realHeight, backgroundColor: image.color }}
            onTouchTap={this._handleMediaTouch}
          >
            <LazyLoad
              height={realHeight}
              once
            >
              <ReactCSSTransitionGroup
                transitionName="fade"
                transitionAppear
                transitionAppearTimeout={375}
                transitionEnterTimeout={375}
                transitionLeave={false}
              >
                <Image src={imageSrc} role="presentation" />
              </ReactCSSTransitionGroup>
            </LazyLoad>
          </CardMedia>
          <CardActions>
            <ActionButtonWrapper>
              {
                isLiked
                ? (
                  <StyledIconButton
                    iconStyle={{ color: '#f15151' }}
                    onTouchTap={this._handleUnlike}
                  ><HeartIcon />
                  </StyledIconButton>
                )
                : (
                  <StyledIconButton onTouchTap={this._handleLike}>
                    <EmptyHeartIcon />
                  </StyledIconButton>
                )
              }
              { image.liker.length > 0 && <ActionButtonNum>{image.liker.length}</ActionButtonNum> }
            </ActionButtonWrapper>
            <ActionButtonWrapper>
              <StyledIconButton onTouchTap={() => this.setState(prevState => ({ isCommentOpen: !prevState.isCommentOpen }))}>
                <CommentIcon />
              </StyledIconButton>
              { comments.length > 0 && <ActionButtonNum>{comments.length}</ActionButtonNum> }
            </ActionButtonWrapper>
          </CardActions>
          <CommentList
            key={image._id}
            open={this.state.isCommentOpen}
            discId={image._id}
            comments={comments}
          />
        </Card>
      </Wrapper>
    );
  }
}

const MeteorContainer = createContainer(({ image }) => {
  // discussion_id from comment
  const discId = image._id;

  Meteor.subscribe('Comments.inImage', discId);
  const comments = Comments.find(
    { discussion_id: discId, type: 'image' },
    { sort: { createdAt: -1 } }
  ).fetch();

  return {
    comments,
  };
}, ImageHolder);

const mapStateToProps = (state) => ({
  User: state.User,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  snackBarOpen,
}, dispatch);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MeteorContainer));
