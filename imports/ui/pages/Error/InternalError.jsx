import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { Notes } from '/imports/api/notes/note.js';
import NavHeader from '/imports/ui/components/NavHeader/NavHeader.jsx';

class InternalError extends Component {

  constructor(props) {
    super(props);
    this.state = {
      location: '500',
    };
  }

  render() {
    const { User, noteNum } = this.props;
    return (
      <div className="container">
        <NavHeader User={User} location={this.state.location} noteNum={noteNum} primary />
        <div className="content Error">
          <div className="Error__container">
            <h2 className="Error__status">Error: 500 Unexpected Error</h2>
            <img className="Error__logo" src="/img/500.png" alt="500 Unexpected Error" />
            <p className="Error__info">服务器内部发生错误</p>
            <p className="Error__info">
              请检查地址是否输入正确&nbsp;
              <Link to="/">返回首页</Link>，或向管理员汇报这个问题
            </p>
          </div>
        </div>
      </div>
    );
  }

}

InternalError.propTypes = {
  User: PropTypes.object,
  noteNum: PropTypes.number.isRequired,
};

export default createContainer(() => {
  Meteor.subscribe('Notes.own');
  const noteNum = Notes.find({ isRead: { $ne: true } }).count();
  return {
    noteNum,
  };
}, InternalError);
