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
        // checks when the averagetime was last edited.
        if (moment().subtract(moment(exists.editedAt), 'days') > 7) {
          // the algorithm will not be used atm due to inaccuracies and
          // var calculatedTravelTime = averageTravelTimeCalculate(departCode, destinationCode);
          var google = getGoogleCalculation(departObject, destinationObject);
          averageTravelTimes.update(exists._id, {$set: {googleTravelTime: google.duration, googleDistance: (google.distance / 1000), editedAt: moment(new Date()).format()}});
        }
      } else {
        var google = getGoogleCalculation(departObject, destinationObject);
        // var calculatedTravelTime = averageTravelTimeCalculate(departObject, destinationObject);
        averageTravelTimes.insert({
          concatenatedCode: concatenatedCode,
          departCode: departCode,
          destinationCode: destinationCode,
          googleTravelTime: google.duration,
          googleDistance: (google.distance / 1000),
          createdAt: moment(new Date()).format(),
          editedAt: moment(new Date()).format()
        });
      }
    }
  });
}
