import { Meteor } from 'meteor/meteor';
import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import errorHOC from './errorHOC';
import NavHeader from '../../components/NavHeader/NavHeader.jsx';

const Forbidden = ({ User, location, sourceDomain, noteNum, snackBarOpen }) => (
  <div className="container">
    <NavHeader
      User={User}
      noteNum={noteNum}
      snackBarOpen={snackBarOpen}
      primary
    />
    <div className="content Error">
      <div className="Error__container">
        <h2 className="Error__status">Error: 403 Access Denied</h2>
        <img
          className="Error__logo"
          src={`${sourceDomain}/GalleryPlus/Error/403.png`}
          alt="403 Access Denied"
        />
        <p className="Error__info">您没有权限访问该页面</p>
        {
          (location.state && location.state.message)
            ? (<p className="Error__info">{location.state.message}</p>)
            : (
              <p className="Error__info">
                请检查地址是否输入正确&nbsp;
                <Link to="/">返回首页</Link>，或向管理员汇报这个问题
              </p>
            )
        }
      </div>
    </div>
  </div>
);

Forbidden.displayName = 'Forbidden';

Forbidden.defaultProps = {
  sourceDomain: Meteor.settings.public.sourceDomain,
};

Forbidden.propTypes = {
  User: PropTypes.object,
  location: PropTypes.object,
  sourceDomain: PropTypes.string.isRequired,
  noteNum: PropTypes.number.isRequired,
  snackBarOpen: PropTypes.func.isRequired,
};

export default errorHOC(Forbidden);
