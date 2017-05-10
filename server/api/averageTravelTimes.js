import { Meteor } from 'meteor/meteor';
import { moment } from 'meteor/momentjs:moment';
import { averageTravelTimes } from '../../lib/collections.js';

import '../calculations/averageTravelTimeCalculator.js';
import '../calculations/googleCalculate.js';

if (Meteor.isServer) {
  Meteor.methods({
    'average.insert' (departCode, destinationCode) {
      var concatenatedCode = departCode.concat(destinationCode);
      var exists = averageTravelTimes.findOne({concatenatedCode: concatenatedCode});
      console.log('destinationCode: ', destinationCode);
      console.log('departCode: ', departCode);
      var googleTime = getGoogleTravelTime(departCode, destinationCode);
      console.log(googleTime);
      if (exists) {
        // still need a check on how long ago the time was calculated
        // var calculatedTravelTime = averageTravelTimeCalculate(departCode, destinationCode);
        console.log('destinationCode: ', destinationCode);
        console.log('departCode: ', departCode);
        averageTravelTimes.update(exists._id, {$set: {averageTravelTime: calculatedTravelTime, editedAt: moment(new Date()).format()}});
      } else {
        // var calculatedTravelTime = averageTravelTimeCalculate(departCode, destinationCode);
        averageTravelTimes.insert({
          concatenatedCode: concatenatedCode,
          departCode: departCode,
          destinationCode: destinationCode,
          averageCalculatedTravelTime: 12,
          googleTravelTime: googleTime,
          createdAt: moment(new Date()).format(),
          editedAt: moment(new Date()).format()
        });
      }
    }
  });
}
