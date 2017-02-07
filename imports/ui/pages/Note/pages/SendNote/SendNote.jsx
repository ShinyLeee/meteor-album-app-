import React, { Component, PropTypes } from 'react';
import { browserHistory } from 'react-router';
import { Meteor } from 'meteor/meteor';
import Avatar from 'material-ui/Avatar';
import Chip from 'material-ui/Chip';
import AutoComplete from 'material-ui/AutoComplete';
import Dialog from 'material-ui/Dialog';
import Divider from 'material-ui/Divider';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import ArrowBackIcon from 'material-ui/svg-icons/navigation/arrow-back';
import SendIcon from 'material-ui/svg-icons/content/send';
import { blue500 } from 'material-ui/styles/colors';
import { insertNote } from '/imports/api/notes/methods.js';

import NavHeader from '/imports/ui/components/NavHeader/NavHeader.jsx';
import QuillEditor from '/imports/ui/components/Quill/QuillEditor.jsx';
import DatePickerCN from '/imports/ui/components/SubMaterialUI/DatePickerCN.jsx';
import Loading from '/imports/ui/components/Loader/Loading.jsx';
import styles from './SendNote.style.js';

export default class SendNotePage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isAlertOpen: false,
      receiver: props.initialReceiver,
      sendAt: new Date(),
      title: '',
      content: '',
    };
    this.handleGoBack = this.handleGoBack.bind(this);
    this.handleSentNote = this.handleSentNote.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.initialReceiver && nextProps.initialReceiver) {
      this.setState({ receiver: nextProps.initialReceiver });
    }
  }

  get quillModulesConfig() {
    return {
      toolbar: [
        [{ header: [1, 2, false] }],
        ['bold', 'italic', { align: [false, 'center', 'right'] }],
        ['link', 'image'],
      ],
    };
  }

  handleGoBack() {
    if (this.state.content) {
      this.setState({ isAlertOpen: true });
      return;
    }
    browserHistory.goBack();
  }

  handleSentNote() {
    if (!this.state.receiver) {
      this.props.snackBarOpen('请选择接受用户');
      return;
    }
    insertNote.call({
      title: this.state.title,
      content: this.state.content,
      sender: this.props.User.username,
      receiver: this.state.receiver.username,
      sendAt: this.state.sendAt,
      createdAt: new Date(),
    }, (err) => {
      if (err) {
        this.props.snackBarOpen(err.reason);
        throw new Meteor.Error(err);
      }
      browserHistory.goBack();
      this.props.snackBarOpen('发送成功');
    });
  }

  renderContent() {
    return (
      <div className="content__sendNote">
        <AutoComplete
          hintText="发送给"
          maxSearchResults={5}
          dataSource={this.props.otherUsers || []}
          dataSourceConfig={{ text: 'username', value: 'username' }}
          filter={AutoComplete.caseInsensitiveFilter}
          underlineShow={false}
          style={styles.noteTextField}
          onNewRequest={(receiver) => this.setState({ receiver })}
          fullWidth
        >
          { this.state.receiver && (
            <div>
              <span style={styles.noteHint}>发送给</span>
              <Chip
                onRequestDelete={() => this.setState({ receiver: null })}
                style={styles.noteChip}
              >
                <Avatar src={this.state.receiver.profile.avatar} />
                {this.state.receiver.username}
              </Chip>
            </div>
          )
        }
        </AutoComplete>
        <Divider />
        <DatePickerCN
          hintText="发送时间"
          underlineShow={false}
          style={styles.noteTextField}
          minDate={this.state.sendAt}
          value={this.state.sendAt}
          onChange={(e, date) => this.setState({ sendAt: date })}
          fullWidth
        /><Divider />
        <TextField
          hintText="标题"
          underlineShow={false}
          style={styles.noteTextField}
          value={this.state.title}
          onChange={(e) => this.setState({ title: e.target.value })}
          fullWidth
        /><Divider />
        <QuillEditor
          placeholder="内容"
          modules={this.quillModulesConfig}
          onChange={(content) => this.setState({ content })}
        />
      </div>
    );
  }

  render() {
    const actions = [
      <FlatButton
        label="取消"
        onTouchTap={() => this.setState({ isAlertOpen: false })}
        keyboardFocused
        primary
      />,
      <FlatButton
        label="确认"
        onTouchTap={() => browserHistory.goBack()}
        primary
      />,
    ];
    return (
      <div className="container">
        <NavHeader
          title="发送信息"
          style={{ backgroundColor: blue500 }}
          iconElementLeft={<IconButton onTouchTap={this.handleGoBack}><ArrowBackIcon /></IconButton>}
          iconElementRight={<IconButton onTouchTap={this.handleSentNote}><SendIcon /></IconButton>}
        />
        <div className="content">
          { this.props.userIsReady
            ? this.renderContent()
            : (<Loading />) }
        </div>
        <Dialog
          title="提示"
          titleStyle={{ border: 'none' }}
          actions={actions}
          actionsContainerStyle={{ border: 'none' }}
          open={this.state.isAlertOpen}
          modal={false}
        >您还有未发送的内容，是否确认退出？
        </Dialog>
      </div>
    );
  }
}

SendNotePage.propTypes = {
  User: PropTypes.object.isRequired,
  // Below Pass from Database
  userIsReady: PropTypes.bool.isRequired,
  initialReceiver: PropTypes.object,
  otherUsers: PropTypes.array.isRequired,
  // Below Pass from Redux
  snackBarOpen: PropTypes.func.isRequired,
};
