import { compose } from 'redux';
import { withRouter } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Users } from '/imports/api/users/user';
import { Collections } from '/imports/api/collections/collection';
import SearchContent from '../components/Content';

export default compose(
  withRouter,
  withTracker(() => {
    const userHandler = Meteor.subscribe('Users.limit', 4);
    const collHandler = Meteor.subscribe('Collections.limit', 2);
    const dataIsReady = userHandler.ready() && collHandler.ready();

    const users = Users.find({}, { limit: 4 }).fetch();
    const collections = Collections.find({ private: false }, { limit: 2 }).fetch();

    return {
      dataIsReady,
      users,
      collections,
    };
  }),
)(SearchContent);