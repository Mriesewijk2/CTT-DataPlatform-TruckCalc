import { Meteor } from 'meteor/meteor';
import { moment } from 'meteor/momentjs:moment';
import { averageTravelTimes } from '../../lib/collections.js';
// export const averageTravelTimes = new Mongo.Collection('averageTravelTimes');

import '../calculations/averageTravelTimeCalculator.js';

if (Meteor.isServer) {
  Meteor.methods({
    'average.insert' (departCode, destinationCode) {
      var concatenatedCode = departCode.concat(destinationCode);
      var exists = averageTravelTimes.findOne({concatenatedCode: concatenatedCode});
      if (exists) {
        // still need a check on how long ago the time was calculated
        var calculatedTravelTime = averageTravelTimeCalculate(departCode, destinationCode);
        averageTravelTimes.update(exists._id, {$set: {averageTravelTime: calculatedTravelTime, editedAt: moment(new Date()).format()}});
      } else {
        var calculatedTravelTime = averageTravelTimeCalculate(departCode, destinationCode);
        averageTravelTimes.insert({
          concatenatedCode: concatenatedCode,
          departCode: departCode,
          destinationCode: destinationCode,
          averageTravelTime: calculatedTravelTime,
          createdAt: moment(new Date()).format(),
          editedAt: moment(new Date()).format()
        });
      }
    }
  });
}
