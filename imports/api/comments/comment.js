import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

class CommentCollection extends Mongo.Collection {
  insert(comment, cb) {
    const result = super.insert(comment, cb);
    return result;
  }
  remove(selector, cb) {
    const result = super.remove(selector, cb);
    return result;
  }
}

export const Comments = new CommentCollection('comments');

Comments.schema = new SimpleSchema({
  user: { type: String, label: '发布评论者', max: 20, denyUpdate: true },
  discussion_id: { type: String, label: '评论目标Id', regEx: SimpleSchema.RegEx.Id, denyUpdate: true },
  parent_id: { type: String, label: '上级评论Id', regEx: SimpleSchema.RegEx.Id, denyUpdate: true, optional: true },
  type: { type: String, label: '评论类型', denyUpdate: true, defaultValue: 'image', optional: true },
  content: { type: String, label: '评论内容', max: 56 },
  createdAt: { type: Date, denyUpdate: true },
});

Comments.attachSchema(Comments.schema);

Comments.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});
