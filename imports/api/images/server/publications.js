/* eslint prefer-arrow-callback: 0 */
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Images } from '../image.js';

Meteor.publish('Images.all', function images() {
  return Images.find({ deletedAt: null });
});

Meteor.publish('Images.ownImages', function ownImages() {
  return Images.find({
    uid: this.userId,
    deletedAt: null,
  });
});

Meteor.publish('Images.likedImages', function likedImages() {
  return Images.find({
    liker: { $in: [this.userId] },
  });
});

Meteor.publish('Images.inCollection', function inCollection(colName) {
  check(colName, String);
  return Images.find({
    uid: this.userId,
    deletedAt: null,
    collection: colName,
  });
});
