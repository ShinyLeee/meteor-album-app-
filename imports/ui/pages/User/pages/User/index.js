import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Collections } from '/imports/api/collections/collection.js';
import { Images } from '/imports/api/images/image.js';

import { userLogout, snackBarOpen } from '/imports/ui/redux/actions';
import UserPage from './User';

const UserContainer = createContainer(({ User, match }) => {
  const { username } = match.params;
  let isGuest = !User;  // if User is null, isGuest is true

  // if User exist and its name equal with params.username, isGuest is false
  if (User && User.username === username) isGuest = false;
  else isGuest = true;

  const userHandler = Meteor.subscribe('Users.all');
  const imageHandler = Meteor.subscribe('Images.all');
  const collHandler = isGuest
                      ? Meteor.subscribe('Collections.inUser', username)
                      : Meteor.subscribe('Collections.own');

  let dataIsReady = false;
  let unOrderedImages = [];
  let likedCount = 0;
  let collectionCount = 0;
  const userIsReady = userHandler.ready();
  const curUser = Meteor.users.findOne({ username }) || {};

  if (userIsReady) {
    dataIsReady = imageHandler.ready() && collHandler.ready();
    collectionCount = Collections.find().count();
    likedCount = Images.find({ liker: { $in: [curUser.username] } }).count();
    unOrderedImages = Images.find(
      { user: curUser.username },
      { limit: 10 }
    ).fetch();
  }

  return {
    dataIsReady,
    isGuest,
    curUser,
    unOrderedImages,
    likedCount,
    collectionCount,
  };
}, UserPage);

const mapStateToProps = (state) => ({
  User: state.User,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  userLogout,
  snackBarOpen,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(UserContainer);
