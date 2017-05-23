import { Meteor } from 'meteor/meteor';
import { moment } from 'meteor/momentjs:moment';
import { averageTravelTimes } from '../../lib/collections.js';

import '../calculations/averageTravelTimeCalculator.js';
import '../calculations/googleCalculate.js';

if (Meteor.isServer) {
  Meteor.methods({
    'average.insert' (departObject, destinationObject) {
      var departCode = departObject.Code;
      var destinationCode = destinationObject.Code;
      var concatenatedCode = departCode.concat(destinationCode);
      var exists = averageTravelTimes.findOne({concatenatedCode: concatenatedCode});
      if (exists) {
        // still need a check on how long ago the time was calculated
        var calculatedTravelTime = averageTravelTimeCalculate(departCode, destinationCode);
        // var googleTime = getGoogleTravelTime(departObject, destinationObject);
        averageTravelTimes.update(exists._id, {$set: {googleTravelTime: googleTime, editedAt: moment(new Date()).format()}});
      } else {
        var googleTime = getGoogleTravelTime(departObject, destinationObject);
        var calculatedTravelTime = averageTravelTimeCalculate(departObject, destinationObject);
        console.log(calculatedTravelTime);
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
