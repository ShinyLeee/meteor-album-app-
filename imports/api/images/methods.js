import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import moment from 'moment';

import { Images } from './image.js';
import { Collections } from '../collections/collection.js';

export const insertImage = new ValidatedMethod({
  name: 'images.insert',
  validate: Images.simpleSchema().validator({ clean: true, filter: false }),
  run(image) {
    if (!this.userId) {
      throw new Meteor.Error('user.accessDenied');
    }
    const privateStatus = Collections.findOne({ name: image.collection }).private || false;
    const newImage = Object.assign({}, image, { private: privateStatus });
    return Images.insert(newImage);
  },
});

export const removeImagesToRecycle = new ValidatedMethod({
  name: 'images.removeToRecycle',
  validate: new SimpleSchema({
    selectImages: { type: [String], regEx: SimpleSchema.RegEx.Id },
    uid: { type: String, regEx: SimpleSchema.RegEx.Id },
    colName: { type: String, max: 10 },
  }).validator({ clean: true, filter: false }),
  run({ selectImages, uid, colName }) {
    if (!this.userId) {
      throw new Meteor.Error('user.accessDenied');
    }
    const count = selectImages.length;
    const deletedAt = moment().add(1, 'M').toDate();

    Images.update(
      { _id: { $in: selectImages } },
      { $set: { deletedAt } },
      { multi: true }
    );

    Meteor.users.update(
      { _id: uid },
      { $inc: { 'profile.images': -count } }
    );

    Collections.update(
      { uid, name: colName },
      { $inc: { quantity: -count } }
    );
  },
});

export const shiftImages = new ValidatedMethod({
  name: 'images.shift',
  validate: new SimpleSchema({
    selectImages: { type: [String], regEx: SimpleSchema.RegEx.Id },
    src: { type: String, max: 10 },
    dest: { type: String, max: 10 },
  }).validator({ clean: true, filter: false }),
  run({ selectImages, src, dest }) {
    if (!this.userId) {
      throw new Meteor.Error('user.accessDenied');
    }
    const count = selectImages.length;

    Images.update(
      { _id: { $in: selectImages } },
      { $set: { collection: dest } },
      { multi: true }
    );

    Collections.update(
      { uid: this.userId, name: src },
      { $inc: { quantity: -count } }
    );

    Collections.update(
      { uid: this.userId, name: dest },
      { $inc: { quantity: count } },
    );
  },
});

export const likeImage = new ValidatedMethod({
  name: 'images.like',
  validate: new SimpleSchema({
    imageId: { type: String, regEx: SimpleSchema.RegEx.Id },
    liker: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator({ clean: true, filter: false }),
  run({ imageId, liker }) {
    if (!this.userId) {
      throw new Meteor.Error('user.accessDenied');
    }
    Images.update(imageId, { $inc: { likes: 1 }, $addToSet: { liker } });
    Meteor.users.update(liker, { $inc: { 'profile.likes': 1 } });
  },
});

export const unlikeImage = new ValidatedMethod({
  name: 'images.unlike',
  validate: new SimpleSchema({
    imageId: { type: String, regEx: SimpleSchema.RegEx.Id },
    unliker: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator({ clean: true, filter: false }),
  run({ imageId, unliker }) {
    if (!this.userId) {
      throw new Meteor.Error('user.accessDenied');
    }
    Images.update(imageId, { $inc: { likes: -1 }, $pull: { liker: unliker } });
    Meteor.users.update(unliker, { $inc: { 'profile.likes': -1 } });
  },
});

// Get list of all method names on Images
const IMAGES_METHODS = _.pluck([
  // insertImage, // allow call this method within 1 second
  removeImagesToRecycle,
  shiftImages,
  likeImage,
  unlikeImage,
], 'name');

if (Meteor.isServer) {
  // Only allow 1 user operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(IMAGES_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; },
  }, 1, 1000);
}
