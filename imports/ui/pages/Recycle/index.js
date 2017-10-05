import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Images } from '/imports/api/images/image.js';

import {
  selectCounter,
  enableSelectAll,
  disableSelectAll,
  snackBarOpen,
} from '../../redux/actions';
import RecyclePage from './Recycle';

const RecycleContainer = createContainer(() => {
  const imageHandle = Meteor.subscribe('Images.recycle');
  const dataIsReady = imageHandle.ready();
  const images = Images.find(
    { deletedAt: { $ne: null } },
    { sort: { shootAt: -1 } }
  ).fetch();
  return {
    dataIsReady,
    images,
  };
}, RecyclePage);

const mapStateToProps = (state) => ({
  User: state.User,
  selectImages: state.selectCounter.selectImages,
  counter: state.selectCounter.counter,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  selectCounter,
  enableSelectAll,
  disableSelectAll,
  snackBarOpen,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(RecycleContainer);
