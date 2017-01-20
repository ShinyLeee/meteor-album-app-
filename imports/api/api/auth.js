import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

if (Meteor.isServer) {
  Meteor.methods({
    'Auth.isLogin': function isLogin() {
      const response = !!this.userId;
      return response;
    },

    'Auth.isAdmin': function isAdmin() {
      const response = !!Meteor.user().isAdmin;
      return response;
    },

    'Auth.isPermission': function isPermission({ username }) {
      new SimpleSchema({
        username: { type: String, label: '用户名', max: 20 },
      }).validator({ clean: true, filter: false });
      if (!this.userId) {
        return false;
      }
      const uid = Meteor.users.findOne({ username })._id;
      return this.userId === uid;
    },

    'Auth.isAllowVisitHome': function isAllowVisitHome({ username }) {
      new SimpleSchema({
        username: { type: String, label: '用户名', max: 20 },
      }).validator({ clean: true, filter: false });
      const targetUser = Meteor.users.findOne({ username });
      if (!targetUser) {
        throw new Meteor.Error(404, 'User home page not found');
      }
      if (targetUser._id === this.userId) {
        return true;
      }
      const response = !!targetUser.profile.settings.allowVisitHome;
      return response;
    },

    'Auth.isAllowVisitColl': function isAllowVisitColl({ username }) {
      new SimpleSchema({
        username: { type: String, label: '用户名', max: 20 },
      }).validator({ clean: true, filter: false });
      const targetUser = Meteor.users.findOne({ username });
      if (!targetUser) {
        throw new Meteor.Error(404, 'User home page not found');
      }
      if (targetUser._id === this.userId) {
        return true;
      }
      const response = !!targetUser.profile.settings.allowVisitColl;
      return response;
    },

  });

  const AUTH_METHODS = [
    'isLogin',
    'isAdmin',
    'isPermission',
    'isAllowVisitHome',
    'isAllowVisitColl',
  ];

  // Only allow 1 user operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(AUTH_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; },
  }, 2, 5000);
}