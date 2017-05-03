import { averageTravelTimes, CWReturnVehicles, truckPlanning, CWReturnVehiclePosition } from '../../lib/collections.js';
import { Meteor } from 'meteor/meteor';

if (Meteor.isServer) {
  averageTravelTimeCalculate = function (departCode, destinationCode) {
    var truckPlannings = getTruckPlannings(departCode, destinationCode).fetch();
    console.log('trigger');
    console.log(truckPlannings.length);
    var totalTime;
    var count;
    for (i = 0; i < truckPlannings.length; i++) {
      var vehicleID = getCWVehicleID(truckPlannings[i].Truck);
      var vehiclePositions = getCWVehiclePostion(vehicleID, truckPlannings[i].DepartTime, truckPlannings[i].ReturnTime );
      for ( j = 0; j < vehiclePositions.length; j++) {
  			if (inRange(vehiclePositions[j].Longitude, vehiclePositions[j].Latitude, end.lon, end.lat)){
  				totalTime += vehiclePositions[j].ReceivedTime - vehiclePositions[0].ReceivedTime;
          count++;
  			}
  		}
  	return -1337;
    }
    return;
  };

  // get the CarrierWeb vehicle id from the license entered in Modality
  function getCWVehicleID (license) {
    var cwVehicle = CWReturnVehicles.findOne({ License: license });
    if (cwVehicle) {
      return cwVehicle.CWVehicleID;
    } else {
      return;
    }
  }

  // get the truck Plannings from the 
  function getTruckPlannings (departCode, destinationCode, returnCode) {
    return truckPlanning.find({ From: departCode, LoadDisch: destinationCode });
  }

  function getCWVehiclePostion (CWVehicleID, departTime, returnTime) {
    return CWVehiclePositions.find({CWVehicleID: CWVehicleID, ReceivedTime: {$gt: departTime-2, $lt: returnTime+2} }).fetch();
  }

  // genakt van http://www.movable-type.co.uk/scripts/latlong.html
  function inRange (lonpos, latpos, lonclient, latclient) {
  	var R = 6371e3; // metres
  	var φ1 = latpos.toRadians();
  	var φ2 = latclient.toRadians();
  	var Δφ = (latclient-latpos).toRadians();
  	var Δλ = (lonclient-lonpos).toRadians();

  	var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
  	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  	var d = R * c;
  	return d < 100;
  }
}
