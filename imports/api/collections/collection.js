import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

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
  name: { type: String, label: '相册名', max: 10 },
  uid: { type: String, regEx: SimpleSchema.RegEx.Id },
  user: { type: String, label: '用户名', max: 10 },
  cover: { type: String, label: '封面图片', optional: true },
  private: { type: Boolean, defaultValue: false, optional: true },
  createdAt: { type: Date, defaultValue: new Date(), optional: true },
  updatedAt: { type: Date, defaultValue: new Date(), optional: true },
});

Collections.attachSchema(Collections.schema);

// Deny all client-side updates since we will be using methods to manage this collection
Collections.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});
