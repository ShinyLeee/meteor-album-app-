import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { snackBarOpen } from '/imports/ui/redux/actions/index.js';
import ResetPassword from './ResetPassword.jsx';

const mapStateToProps = (state) => state;

const mapDispatchToProps = (dispatch) => bindActionCreators({ snackBarOpen }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ResetPassword);
