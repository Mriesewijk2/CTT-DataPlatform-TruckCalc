import { Meteor } from 'meteor/meteor';
import { averageTravelTimes } from '../lib/collections.js';

if (Meteor.isServer) {
  Meteor.publish('averageTravelTimes', function () {
    return averageTravelTimes.find();
  });
}
