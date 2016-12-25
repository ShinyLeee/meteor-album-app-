import { Meteor } from 'meteor/meteor';

// If not login redirect location to /login
export const isLogin = (nextState, replace, cb) => {
  Meteor.callPromise('Auth.isLogin')
  .then((login) => {
    if (!login) replace({ pathname: '/login' });
    cb();
  })
  .catch((err) => {
    replace({ pathname: `/${err.error}` });
    cb();
    throw new Meteor.Error(err);
  });
};

// If has login, redirect to index page
export const isLogout = (nextState, replace, cb) => {
  Meteor.callPromise('Auth.isLogin')
  .then((login) => {
    if (login) replace({ pathname: '/' });
    cb();
  })
  .catch((err) => {
    replace({ pathname: `/${err.error}` });
    cb();
    throw new Meteor.Error(err);
  });
};

// Check is this user permit other visit home page TODO FIX USER NOT FOUND ERROR
export const isAllowVisitHome = (nextState, replace, cb) => {
  const { params } = nextState;
  Meteor.callPromise('Auth.isAllowVisitHome', { username: params.username })
  .then((allowVisitHome) => {
    if (!allowVisitHome) replace({ pathname: '/403', state: { message: '该用户不允许他人访问其主页' } });
    cb();
  })
  .catch((err) => {
    replace({ pathname: `/${err.error}` });
    cb();
    throw new Error(err);
  });
};

// Check is this user permit other visit this specific collection
export const isAllowVisitColl = (nextState, replace, cb) => {
  const { params } = nextState;
  Meteor.callPromise('Auth.isAllowVisitColl', {
    username: params.username,
    dest: params.colName,
  })
  .then((allowVisitColl) => {
    if (!allowVisitColl) replace({ pathname: '/403', state: { message: '该用户不允许他人访问其相册' } });
    cb();
  })
  .catch((err) => {
    replace({ pathname: `/${err.error}` });
    cb();
    throw new Meteor.Error(err);
  });
};
