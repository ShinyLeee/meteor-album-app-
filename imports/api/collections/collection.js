import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Images } from '../images/image';

class CollectionCollection extends Mongo.Collection {
  insert(collection, cb) {
    const result = super.insert(collection, cb);
    return result;
  }
  remove(selector, cb) {
    const result = super.remove(selector, cb);
    return result;
  }
}

export const Collections = new CollectionCollection('collections');

Collections.schema = new SimpleSchema({
  name: { type: String, label: '相册名', max: 20 },
  user: { type: String, regEx: SimpleSchema.RegEx.Id },
  cover: { type: String, label: '封面图片' },
  private: { type: Boolean, defaultValue: false, optional: true },
  createdAt: { type: Date, denyUpdate: true },
  updatedAt: { type: Date, optional: true },
});

Collections.attachSchema(Collections.schema);

// Deny all client-side updates since we will be using methods to manage this collection
Collections.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Collections.helpers({
  isLoggedIn() {
    return !!this.userId;
  },
  images() {
    return Images.find(
      { user: this.user, collection: this.name },
      { sort: { createdAt: -1 } }
    );
  },
});

if (Meteor.isTest) {
  import { Factory } from 'meteor/dburles:factory';
  import faker from 'faker';
  import { getRandomInt, limitStrLength } from '/imports/utils/utils.js';

  Factory.define('collection', Collections, {
    name: () => limitStrLength(faker.hacker.noun(), 20),
    user: () => Factory.get('user'),
    cover: () => `/img/pattern/VF_ac${getRandomInt(1, 28)}.jpg`,
    createdAt: () => new Date(),
  });
}
