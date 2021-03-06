import map from 'lodash/map';
import includes from 'lodash/includes';
import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin';
import { Images } from '../images/image';
import { Collections } from './collection';

/**
 * Method contains manipulate Images collection ,
 * should provide username and collName value other than collId.
 *
 * Bc some collection name might be same.
 */

export const insertCollection = new ValidatedMethod({
  name: 'collections.insert',
  mixins: [CallPromiseMixin],
  validate: Collections.simpleSchema().validator({ clean: true, filter: false }),
  run(collection) {
    if (!this.userId) {
      throw new Meteor.Error('api.collections.insert.notLoggedIn');
    }
    // 根据用户设置来确认新建相册是否公开, 默认公开相册
    const settings = Meteor.users.findOne(this.userId).profile.settings;
    const mergedCollection = Object.assign({}, collection, { private: !settings.allowVisitColl });
    Collections.insert(mergedCollection);
  },
});

export const removeCollection = new ValidatedMethod({
  name: 'collections.remove',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    username: { type: String, label: '用户名', max: 20 },
    collName: { type: String, label: '相册名', max: 20 },
  }).validator({ clean: true, filter: false }),
  run({ username, collName }) {
    if (!this.userId) {
      throw new Meteor.Error('api.collections.remove.notLoggedIn');
    }
    const images = Images.find({ username, collection: collName }).fetch();

    if (images.length === 0) {
      return Collections.remove({ user: username, name: collName });
    }

    const keys = images.map((image) => `${image.user}/${collName}/${image.name}.${image.type}`);
    Meteor.call('Qiniu.remove', { keys });
    return Collections.remove({ user: username, name: collName });
  },
});

export const lockCollection = new ValidatedMethod({
  name: 'collections.lock',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    username: { type: String, label: '用户名', max: 20 },
    collId: { type: String, label: '相册Id', regEx: SimpleSchema.RegEx.Id },
    collName: { type: String, label: '相册名', max: 20 },
    privateStat: { type: Boolean, label: '当前相册状态' },
  }).validator({ clean: true, filter: false }),
  run({ username, collId, collName, privateStat }) {
    if (!this.userId) {
      throw new Meteor.Error('api.collections.lock.notLoggedIn');
    }
    Collections.update(
      collId,
      { $set: { private: !privateStat } },
    );
    Images.update(
      { user: username, collection: collName },
      { $set: { private: !privateStat } },
      { multi: true },
    );
  },
});

export const mutateCollectionCover = new ValidatedMethod({
  name: 'collections.mutateCover',
  mixins: [CallPromiseMixin],
  validate: new SimpleSchema({
    collId: { type: String, label: '相册Id', regEx: SimpleSchema.RegEx.Id },
    cover: { type: String, label: '封面图片' },
  }).validator({ clean: true, filter: false }),
  run({ collId, cover }) {
    if (!this.userId) {
      throw new Meteor.Error('api.collections.mutateCover.notLoggedIn');
    }
    Collections.update(
      collId,
      { $set: { cover } },
    );
  },
});

// Get list of all method names on Collections
const COLLECTIONS_METHODS = map([
  insertCollection,
  removeCollection,
  lockCollection,
  mutateCollectionCover,
], 'name');

if (Meteor.isServer) {
  // Only allow 1 user operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return includes(COLLECTIONS_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; },
  }, 2, 5000);
}
