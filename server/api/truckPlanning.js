import { Meteor } from 'meteor/meteor';
import { truckPlanning, averageTravelTimes, customerGeolocations } from '../../lib/collections.js';
import { moment } from 'meteor/momentjs:moment';

if (Meteor.isServer) {
  // wait for collectiosn to be loaded
  var planning = truckPlanning;
  Meteor.methods({
    'truckPlanning.calculate' (id) {
      var truckPlanning = planning.findOne({'_id': id});
      var concatenatedCode = truckPlanning.From.concat(truckPlanning.LoadDisch);
      var averageTime = averageTravelTimes.findOne({concatenatedCode: concatenatedCode});
      if(!averageTime) {
        var departObject = customerGeolocations.findOne({Code: truckPlanning.From});
        var destinationObject = customerGeolocations.findOne({Code: truckPlanning.LoadDisch});
        if (departObject && destinationObject) {
          Meteor.call('average.insert', departObject, destinationObject);
          averageTime = averageTravelTimes.findOne({concatenatedCode: concatenatedCode});
        } else {
          return;
        }
      }
      var arrivalDateTime = arrivalTimeTransform(truckPlanning.PlannedArrivalTime, truckPlanning.PlannedDate);
      // multiply by 1.2 for truck travel time
      var googleTruckTravelTime = averageTime.googleTravelTime * 1.2;
      var neededDepartTimeGoogle = arrivalDateTime.subtract(googleTruckTravelTime, 'minutes').format();
      var neededDepartTimeData = arrivalDateTime.subtract(averageTime.averageCalculatedTravelTime, 'minutes').format();
      planning.update(truckPlanning._id, {$set: {NeededDepartTimeData: neededDepartTimeData, NeededDepartTimeGoogle: neededDepartTimeGoogle}});
    }
  });

  function arrivalTimeTransform (arrivalTimeInt, arrivalDate) {
    var time = arrivalTimeInt.toString();
    var newTime;
    if(time.length === 3) {
      newTime = time.substr(0, 1) + ':' + time.substr(1);
    } else {
      newTime = time.substr(0, 2) + ':' + time.substr(2);
    }
    newDateTime = moment(arrivalDate + ' ' + newTime);
    return newDateTime;
  }
}
