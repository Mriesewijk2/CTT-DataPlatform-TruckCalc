import { Meteor } from 'meteor/meteor';
import { truckPlanning, averageTravelTimes, customerGeolocations } from '../../lib/collections.js';
import { moment } from 'meteor/momentjs:moment';

if (Meteor.isServer) {
  // wait for collection to be loaded
  var planning = truckPlanning;
  Meteor.methods({
    'set.plannedtrue' (id) {
      truckPlanning.update(id, {$set: {Planned: true}});
    },
    'set.plannedfalse' (id) {
      truckPlanning.update(id, {$set: {Planned: false}});
    },
    'set.departedtrue' (id) {
      truckPlanning.update(id, {$set: {Departed: true}});
    },
    'set.departedfalse' (id) {
      truckPlanning.update(id, {$set: {Departed: false}});
    },
    'truckPlanning.calculate' (id) {
      var truckPlanning = planning.findOne({'_id': id});
      var concatenatedCode = truckPlanning.From.concat(truckPlanning.LoadDisch);
      var averageTime = averageTravelTimes.findOne({concatenatedCode: concatenatedCode});
      var departObject = customerGeolocations.findOne({Code: truckPlanning.From});
      var destinationObject = customerGeolocations.findOne({Code: truckPlanning.LoadDisch});
      if (!averageTime || moment(averageTime.editedAt).diff(moment(), 'days') > 7) {
        if (departObject && destinationObject) {
          Meteor.call('average.insert', departObject, destinationObject);
          // wait for findOne to return
          var count = 0;
          while (!averageTime && count < 5) {
            averageTime = averageTravelTimes.findOne({concatenatedCode: concatenatedCode});
            count++;
            if (count === 5) {
              return;
            }
          }
        }
      // } else if (!averageTime.averageCalculatedTravelTime) {
      //   if (departObject && destinationObject) {
      //     Meteor.call('average.insert', departObject, destinationObject);
      //     count = 0;
      //     while (!averageTime.averageCalculatedTravelTime) {
      //       averageTime = averageTravelTimes.findOne({concatenatedCode: concatenatedCode});
      //       count++;
      //       if (count === 5) {
      //         return;
      //       }
      //     }
      //   }
      }

      var arrivalDateTime = arrivalTimeTransform(truckPlanning.PlannedArrivalTime, truckPlanning.PlannedDate);
      // multiply by 1.2 for truck travel time
      if (averageTime) {
        var googleTruckTravelTime = averageTime.googleTravelTime * 1.2;
        var neededDepartTimeGoogle = arrivalDateTime.subtract(googleTruckTravelTime, 'minutes').format();
        // if (averageTime.averageCalculatedTravelTime) {
        //   arrivalDateTime = arrivalTimeTransform(truckPlanning.PlannedArrivalTime, truckPlanning.PlannedDate);
        //   var neededDepartTimeData = arrivalDateTime.subtract(averageTime.averageCalculatedTravelTime, 'minutes').format();
        // }
        planning.update(truckPlanning._id, {$set: {NeededDepartTimeGoogle: neededDepartTimeGoogle, Distance: averageTime.googleDistance}});
      } else {
        planning.update(truckPlanning._id, {$set: {NeededDepartTimeGoogle: 'Could not be calculated', Distance: 'could not be calculated'}});
      }
    }
  });

  // time is an INT in the database and has to be transformed to a datetime combined with the date in order to be usefull.
function arrivalTimeTransform (arrivalTimeInt, arrivalDate) {
  var time = arrivalTimeInt.toString();
  var newTime;
  if (time.length === 3) {
    newTime = time.substr(0, 1) + ':' + time.substr(1);
  } else {
    newTime = time.substr(0, 2) + ':' + time.substr(2);
  }
  var newDateTime = moment((arrivalDate + ' ' + newTime), 'DD-MM-YYYY HH:mm');
  return newDateTime;
}
}
