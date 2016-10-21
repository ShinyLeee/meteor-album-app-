import { Meteor } from 'meteor/meteor';

const incompleteCountDenormalizer = {

  afterInsertImage(image) {
    const uid = image.uid;
    Meteor.users.update(uid, {
      $inc: {
        'profile.images': 1,
      },
    });
  },

  afterRemoveImage(selector) {
    console.log(selector);
  },

};

export default incompleteCountDenormalizer;
