import { Meteor } from 'meteor/meteor';
import { moment } from 'meteor/momentjs:moment';
import { averageTravelTimes } from '../../lib/collections.js';

import '../calculations/averageTravelTimeCalculator.js';
import '../calculations/googleCalculate.js';

if (Meteor.isServer) {
  Meteor.methods({
    'average.insert' (departObject, destinationObject) {
      console.log(departObject.Code);
      var departCode = departObject.Code;
      var destinationCode = destinationObject.Code;
      var concatenatedCode = departCode.concat(destinationCode);
      var exists = averageTravelTimes.findOne({concatenatedCode: concatenatedCode});
      if (exists) {
        // checks when the averagetime was last edited.
        if (moment().substract(moment(exists.editedAt), 'days') > 7) {
          var calculatedTravelTime = averageTravelTimeCalculate(departCode, destinationCode);
          var googleTime = getGoogleTravelTime(departObject, destinationObject);
          averageTravelTimes.update(exists._id, {$set: {averageCalculatedTravelTime: calculatedTravelTime, googleTravelTime: googleTime, editedAt: moment(new Date()).format()}});
          console.log(calculatedTravelTime);
        }
      } else {
        var googleTime = getGoogleTravelTime(departObject, destinationObject);
        var calculatedTravelTime = averageTravelTimeCalculate(departObject, destinationObject);
        console.log(calculatedTravelTime);
        averageTravelTimes.insert({
          concatenatedCode: concatenatedCode,
          departCode: departCode,
          destinationCode: destinationCode,
          averageCalculatedTravelTime: calculatedTravelTime,
          googleTravelTime: googleTime,
          createdAt: moment(new Date()).format(),
          editedAt: moment(new Date()).format()
        });
      }
    }
  });
}
