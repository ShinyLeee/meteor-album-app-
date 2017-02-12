import React, { Component, PropTypes } from 'react';
import { browserHistory } from 'react-router';
import { Meteor } from 'meteor/meteor';
import Dialog from 'material-ui/Dialog';
import Divider from 'material-ui/Divider';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import ArrowBackIcon from 'material-ui/svg-icons/navigation/arrow-back';
import DoneIcon from 'material-ui/svg-icons/action/done';
import { blue500 } from 'material-ui/styles/colors';
import { insertDiary } from '/imports/api/diarys/methods.js';
import NavHeader from '/imports/ui/components/NavHeader/NavHeader.jsx';
import QuillEditor from '/imports/ui/components/Quill/QuillEditor.jsx';
import Loader from '/imports/ui/components/Loader/Loader.jsx';

export default class WriteDiaryPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isProcessing: false,
      processMsg: '',
      isAlertOpen: false,
      title: '',
      outline: '',
      content: '',
    };
    this.handleGoBack = this.handleGoBack.bind(this);
    this.handleInsertDiary = this.handleInsertDiary.bind(this);
  }

  get quillModulesConfig() {
    return {
      toolbar: {
        container: [
          [{ header: [1, 2, false] }],
          ['bold', { color: [] }, { align: [false, 'center', 'right'] }],
          ['blockquote', 'code-block'],
          ['link', 'image'],
        ],
      },
    };
  }

  handleGoBack() {
    if (this.state.content) {
      this.setState({ isAlertOpen: true });
      return;
    }
    browserHistory.goBack();
  }

  handleInsertDiary() {
    const { User } = this.props;
    const { title, outline, content } = this.state;
    if (!title || !content) {
      this.props.snackBarOpen('请输入必填项');
      return;
    }
    this.setState({ isProcessing: true, processMsg: '添加日记中' });
    insertDiary.callPromise({
      user: User.username,
      title,
      outline,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .then(() => {
      // because go to another component so we do not need set inital state
      browserHistory.replace('/diary');
      this.props.snackBarOpen('添加日记成功');
    })
    .catch((err) => {
      this.setState({ isProcessing: false, processMsg: '' });
      console.log(err); // eslint-disable-line no-console
      this.props.snackBarOpen(err.reason || '添加日记失败');
      throw new Meteor.Error(err);
    });
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
          title="添加日记"
          style={{ backgroundColor: blue500 }}
          iconElementLeft={<IconButton onTouchTap={this.handleGoBack}><ArrowBackIcon /></IconButton>}
          iconElementRight={<IconButton onTouchTap={this.handleInsertDiary}><DoneIcon /></IconButton>}
        />
        <div className="content">
          <Loader
            open={this.state.isProcessing}
            message={this.state.processMsg}
          />
          <div className="content__writeDiary">
            <TextField
              hintText="标题"
              style={{ padding: '0 20px' }}
              underlineShow={false}
              value={this.state.title}
              onChange={(e) => this.setState({ title: e.target.value })}
              fullWidth
            />
            <Divider />
            <QuillEditor
              placeholder="内容"
              modules={this.quillModulesConfig}
              contentType="delta"
              onChange={(outline, content) => this.setState({ outline, content })}
            />
          </div>
        </div>
        <Dialog
          title="提示"
          titleStyle={{ border: 'none' }}
          actions={actions}
          actionsContainerStyle={{ border: 'none' }}
          open={this.state.isAlertOpen}
          modal
        >您还有未保存的日记内容，是否确认退出？
        </Dialog>
      </div>
    );
  }
}

WriteDiaryPage.displayName = 'WriteDiaryPage';

WriteDiaryPage.propTypes = {
  User: PropTypes.object,
  // Below Pass from Redux
  snackBarOpen: PropTypes.func.isRequired,
};