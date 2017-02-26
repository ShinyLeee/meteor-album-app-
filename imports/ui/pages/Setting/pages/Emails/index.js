import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { snackBarOpen } from '/imports/ui/redux/actions/index.js';
import SettingEmailsPage from './Emails.jsx';

const mapDispatchToProps = (dispatch) => bindActionCreators({
  snackBarOpen,
}, dispatch);

export default connect(null, mapDispatchToProps)(SettingEmailsPage);
