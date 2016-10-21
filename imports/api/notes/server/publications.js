/* eslint prefer-arrow-callback: 0 */
import { Meteor } from 'meteor/meteor';
import { Notes } from '../note.js';

Meteor.publish('Notes.ownNotes', function ownNotes() {
  return Notes.find({
    receiver: this.userId,
  });
});
