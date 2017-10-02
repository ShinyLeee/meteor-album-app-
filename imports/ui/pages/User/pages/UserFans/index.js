import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { snackBarOpen } from '/imports/ui/redux/actions';
import UserFansPage from './UserFans';

const MeteorContainer = createContainer(({ User, match }) => {
  const { username } = match.params;

  let isGuest = !User;  // if User is null, isGuest is true

  // if User exist and its name equal with params.username, isGuest is false
  if (User && User.username === username) isGuest = false;
  else isGuest = true;

  const userHandler = Meteor.subscribe('Users.all');
  const dataIsReady = userHandler.ready();
  const curUser = Meteor.users.findOne({ username });
  const initialFans = isGuest ? (curUser && curUser.profile.followers) : User.profile.followers;

  return {
    dataIsReady,
    isGuest,
    curUser,
    initialFans,
  };
}, UserFansPage);

const mapStateToProps = (state) => ({
  User: state.User,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  snackBarOpen,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(MeteorContainer);
