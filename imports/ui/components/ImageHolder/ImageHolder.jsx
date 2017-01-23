import React, { PropTypes } from 'react';
import { browserHistory } from 'react-router';
import TimeAgo from 'react-timeago';
import CNStrings from 'react-timeago/lib/language-strings/zh-CN';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';
import LazyLoad from 'react-lazyload';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Card, CardHeader, CardActions, CardMedia } from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import HeartIcon from 'material-ui/svg-icons/action/favorite';
import EmptyHeartIcon from 'material-ui/svg-icons/action/favorite-border';
import ReplyIcon from 'material-ui/svg-icons/content/reply';
import CommentIcon from 'material-ui/svg-icons/communication/chat-bubble-outline';

const formatter = buildFormatter(CNStrings);

const styles = {
  flipReplyStyle: {
    MozTransform: 'scaleX(-1)',
    WebkitTransform: 'scaleX(-1)',
    OTransform: 'scaleX(-1)',
    transform: 'scaleX(-1)',
  },
};

const ImageHolder = ({ image, src, isLiked, onMediaClick, onLikeClick, onUnlikeClick, onCommentClick, onReplyClick }) => (
  <div className="component__ImageHolder">
    <Card>
      <CardHeader
        title={image.user}
        subtitle={<TimeAgo date={image.createdAt} formatter={formatter} />}
        avatar={image.avatar}
        onTouchTap={() => browserHistory.push(`/user/${image.user}`)}
      />
      <ReactCSSTransitionGroup
        key={image.id}
        transitionName="fade"
        transitionAppear
        transitionAppearTimeout={500}
        transitionEnter={false}
        transitionLeave={false}
      >
        <CardMedia onTouchTap={onMediaClick}>
          <LazyLoad height={200} offset={200} once>
            <img style={{ width: '100%' }} src={src} role="presentation" />
          </LazyLoad>
        </CardMedia>
      </ReactCSSTransitionGroup>
      <CardActions>
        { isLiked
          ? (<IconButton onTouchTap={onUnlikeClick} iconStyle={{ color: '#f15151' }}><HeartIcon /></IconButton>)
          : (<IconButton onTouchTap={onLikeClick}><EmptyHeartIcon /></IconButton>) }
        <IconButton onTouchTap={onCommentClick}>
          <CommentIcon />
        </IconButton>
        <IconButton style={{ float: 'right' }} onTouchTap={onReplyClick} iconStyle={styles.flipReplyStyle}>
          <ReplyIcon />
        </IconButton>
      </CardActions>
    </Card>
  </div>
);

ImageHolder.displayName = 'ImageHolder';

ImageHolder.defaultProps = {
  isLiked: false,
};

ImageHolder.propTypes = {
  image: PropTypes.object.isRequired,
  src: PropTypes.string.isRequired,
  isLiked: PropTypes.bool.isRequired,
  onLikeClick: PropTypes.func,
  onUnlikeClick: PropTypes.func,
  onMediaClick: PropTypes.func,
  onCommentClick: PropTypes.func,
  onReplyClick: PropTypes.func,
};

export default ImageHolder;
