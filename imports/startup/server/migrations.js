import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Migrations } from 'meteor/percolate:migrations';
import { Users } from '/imports/api/users/user.js';
import { Notes } from '/imports/api/notes/note.js';
import { Images } from '/imports/api/images/image.js';
import { Collections } from '/imports/api/collections/collection.js';

Migrations.config({
  // Log job run details to console
  log: true,

  // Use a custom logger function (defaults to Meteor's logging package)
  logger: null,

  // Enable/disable logging "Not migrating, already at version {number}"
  logIfLatest: true,

  // Migrations collection name to use in the database
  collectionName: 'migrations',
});

Migrations.add({
  version: 1,
  name: `Refactoring USER & IMAGES & COLLECTIONS & NOTES collection,
  change profile.followers field value from uid to username in USER,
  change liker field value from uid to username in IMAGE,
  unset uid field in IMAGES & COLLECTIONS,  
  change sender and receiver field's value from uid to username in NOTE.
  `,
  up: () => {
    // Get access to the raw MongoDB node collection that the Meteor server collection wraps
    const usersBulk = Users.rawCollection().initializeUnorderedBulkOp();
    const notesBulk = Notes.rawCollection().initializeUnorderedBulkOp();
    const imagesBulk = Images.rawCollection().initializeUnorderedBulkOp();
    const collectionsBulk = Collections.rawCollection().initializeUnorderedBulkOp();

    // Change all profile.followers value from uid to username
    Users.find().forEach((user) => {
      const uid = user._id;
      const followers = user.profile.followers;
      if (followers.length === 0) return;
      followers.forEach((followerId, i) => {
        const followerName = Users.findOne(followerId).username;
        followers[i] = followerName;
      });
      usersBulk.find({ _id: uid }).updateOne({ $set: { 'profile.followers': followers } });
    });

    // Change all liker field value from uid to username
    Images.find().forEach((image) => {
      const imageId = image._id;
      const likers = image.liker;
      if (likers.length === 0) return;
      likers.forEach((likerId, i) => {
        const username = Users.findOne(likerId).username;
        likers[i] = username;
      });
      imagesBulk.find({ _id: imageId }).updateOne({ $set: { liker: likers } });
    });

    // Unset all uid field in Collections & Images collection
    imagesBulk.find({}).update({ $unset: { uid: 1 } });
    collectionsBulk.find({}).update({ $unset: { uid: 1 } });

    // Change all sender and receiver fields' value from uid to username
    Users.find().forEach((user) => {
      const uid = user._id;
      const username = user.username;
      notesBulk.find({ sender: uid }).update({ $set: { sender: username } });
      notesBulk.find({ receiver: uid }).update({ $set: { receiver: username } });
    });

    // We need to wrap the async function to get a synchronous API that migrations expects
    const executeUsers = Meteor.wrapAsync(usersBulk.execute, usersBulk);
    const executeNotes = Meteor.wrapAsync(notesBulk.execute, notesBulk);
    const executeImages = Meteor.wrapAsync(imagesBulk.execute, imagesBulk);
    const executeCollections = Meteor.wrapAsync(collectionsBulk.execute, collectionsBulk);

    executeUsers();
    executeNotes();
    executeImages();
    executeCollections();
  },
  down: () => {
    const usersBulk = Users.rawCollection().initializeUnorderedBulkOp();
    const notesBulk = Notes.rawCollection().initializeUnorderedBulkOp();
    const imagesBulk = Images.rawCollection().initializeUnorderedBulkOp();
    const collectionsBulk = Collections.rawCollection().initializeUnorderedBulkOp();

    Users.find().forEach((user) => {
      const uid = user._id;
      const followers = user.profile.followers;
      if (followers.length === 0) return;
      followers.forEach((followerName, i) => {
        const followerId = Users.findOne({ username: followerName })._id;
        followers[i] = followerId;
      });
      usersBulk.find({ _id: uid }).updateOne({ $set: { 'profile.followers': followers } });
    });

    Images.find().forEach((image) => {
      const imageId = image._id;
      const likers = image.liker;
      if (likers.length === 0) return;
      likers.forEach((likerName, i) => {
        const uid = Users.findOne({ username: likerName })._id;
        likers[i] = uid;
      });
      imagesBulk.find({ _id: imageId }).updateOne({ $set: { liker: likers } });
    });

    Users.find().forEach((user) => {
      const uid = user._id;
      const username = user.username;
      notesBulk.find({ sender: username }).update({ $set: { sender: uid } });
      notesBulk.find({ receiver: username }).update({ $set: { receiver: uid } });
      imagesBulk.find({ user: username }).update({ $set: { uid } });
      collectionsBulk.find({ user: username }).update({ $set: { uid } });
    });

    const executeUsers = Meteor.wrapAsync(usersBulk.execute, usersBulk);
    const executeNotes = Meteor.wrapAsync(notesBulk.execute, notesBulk);
    const executeImages = Meteor.wrapAsync(imagesBulk.execute, imagesBulk);
    const executeCollections = Meteor.wrapAsync(collectionsBulk.execute, collectionsBulk);

    executeUsers();
    executeNotes();
    executeImages();
    executeCollections();
  },
});

Migrations.add({
  version: 2,
  name: 'Add width & height field and unset download & ratio field in IMAGES collection',
  up: () => {
    const domain = Meteor.settings.public.imageDomain;
    const imagesBulk = Images.rawCollection().initializeUnorderedBulkOp();
    Images.find().forEach((image) => {
      const url = encodeURI(`${domain}/${image.user}/${image.collection}/${image.name}.${image.type}?imageInfo`);
      try {
        const imageStat = HTTP.call('GET', url);
        imagesBulk.find({ _id: image._id })
        .updateOne({
          $unset: { download: 1, ratio: 1 },
          $set: { dimension: [imageStat.data.width, imageStat.data.height] },
        });
      } catch (err) {
        console.log(err); // eslint-disable-line no-console
        throw new Meteor.Error(err);
      }
    });
    const executeImages = Meteor.wrapAsync(imagesBulk.execute, imagesBulk);
    executeImages();
  },
  down: () => {
    const imagesBulk = Images.rawCollection().initializeUnorderedBulkOp();
    Images.find().forEach((image) => {
      const ratio = (image.dimension[0] / image.dimension[1]);
      imagesBulk.find({ _id: image._id }).updateOne({
        $unset: { dimension: 1 },
        $set: { download: 0, ratio: Math.round(ratio * 100) / 100 },
      });
    });
    const executeImages = Meteor.wrapAsync(imagesBulk.execute, imagesBulk);
    executeImages();
  },
});
