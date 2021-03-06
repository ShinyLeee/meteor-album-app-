import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';
import { Collections } from '/imports/api/collections/collection';
import {
  disableSelectAll,
  snackBarOpen,
  uploaderStart,
} from '/imports/ui/redux/actions';
import CollectionPage from '../index';

const mapStateToProps = ({ sessions, selectCounter }) => ({
  User: sessions.User,
  counter: selectCounter.counter,
  selectImages: selectCounter.selectImages,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  disableSelectAll,
  snackBarOpen,
  uploaderStart,
}, dispatch);

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withTracker(({ User, match }) => {
    const { username: curUserName, cname: curCName } = match.params;

    const isOwner = !!User && (User.username === curUserName);

    const collHandler = isOwner
      ? Meteor.subscribe('Collections.own')
      : Meteor.subscribe('Collections.inUser', curUserName);
    const dataIsReady = collHandler.ready();

    // curColl is currentCollection use for lock/remove etc.
    const curColl = Collections.findOne({ name: curCName }) || {};
    // otherColls use for shift photos
    const otherColls = Collections.find(
      { name: { $ne: curCName } },
      { fields: { name: 1, private: 1 } },
    ).fetch();

    return {
      dataIsReady,
      isOwner,
      curColl,
      otherColls,
    };
  }),
)(CollectionPage);
