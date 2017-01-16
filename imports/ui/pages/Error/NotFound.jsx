import { Meteor } from 'meteor/meteor';
import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import errorHOC from './errorHOC';
import NavHeader from '../../components/NavHeader/NavHeader.jsx';

const NotFound = ({ User, sourceDomain, noteNum, snackBarOpen }) => (
  <div className="container">
    <NavHeader
      User={User}
      noteNum={noteNum}
      snackBarOpen={snackBarOpen}
      primary
    />
    <div className="content Error">
      <div className="Error__container">
        <h2 className="Error__status">Error: 404 Page Not Found</h2>
        <img
          className="Error__logo"
          src={`${sourceDomain}/GalleryPlus/Error/404.png`}
          alt="404 Not Found"
        />
        <p className="Error__info">您访问的这个页面不存在</p>
        <p className="Error__info">
          请检查地址是否输入正确&nbsp;
          <Link to="/">返回首页</Link>，或向管理员汇报这个问题
        </p>
      </div>
    </div>
  </div>
);

NotFound.displayName = 'NotFound';

NotFound.defaultProps = {
  sourceDomain: Meteor.settings.public.sourceDomain,
};

NotFound.propTypes = {
  User: PropTypes.object,
  sourceDomain: PropTypes.string.isRequired,
  noteNum: PropTypes.number.isRequired,
  snackBarOpen: PropTypes.func.isRequired,
};

export default errorHOC(NotFound);
