import { averageTravelTimes, CWReturnVehicles, truckPlanning } from '../../lib/collections.js';
import { Meteor } from 'meteor/meteor';

if (Meteor.isServer) {
  averageTravelTimeCalculate = function (departCode, destinationCode) {
    var truckPlannings = getTruckPlannings(departCode, destinationCode).fetch();
    console.log('trigger');
    console.log(truckPlannings.length);
    for(i = 0; i < truckPlannings.length; i++){
      var truck = truckPlannings[i].Truck;
      var vehicle = getCWVehicleID(truck);
      if(vehicle){
        console.log(vehicle);
      }

    }
    return;
  };

  function getCWVehicleID (license) {
    try {
      return CWReturnVehicles.findOne({ License: license }).CWVehicleID;
    } catch (e) {
      return;
    }
  }

  function getTruckPlannings (departCode, destinationCode) {
    return truckPlanning.find({ From: departCode, LoadDisch: destinationCode });
  }
}
