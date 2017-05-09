import { averageTravelTimes, CWReturnVehicles, truckPlanning, CWReturnVehiclePosition, customerGeolocations } from '../../lib/collections.js';
import { moment } from 'meteor/momentjs:moment';
import { Meteor } from 'meteor/meteor';

if (Meteor.isServer) {
  averageTravelTimeCalculate = function (departCode, destinationCode) {
    var truckPlannings = getTruckPlannings(departCode, destinationCode).fetch();
    var totalTime = 0;
    var count = 0;
    var i;
    var j;
    var foundtrucksAndDestination = 0;
    console.log('truckplanning length: ', truckPlannings.length);
    for (i = 0; i < truckPlannings.length; i++) {
      // get the CWVehicleID from the specific id in the truckplanning
      var vehicleID = getCWVehicleID(truckPlannings[i].Truck);
      // get the customerGeolocations record for a specific destinationCode
      var destination = getDestination(destinationCode);
      if (vehicleID && destination) {
        foundtrucksAndDestination++;
        console.log('foundtrucksAndDestination: ', foundtrucksAndDestination);
        // gets the departDateTime from the truckplanning, converted to a standard Datetime
        var departDateTime = transformDateTime(truckPlannings[i].DepartTime, truckPlannings[i].DepartGate);
        if(truckPlannings[i].ReturnTime && truckPlannings[i].ReturnGate) {
          // gets the returnDateTime from the truckplanning, converted to a standard Datetime
          var returnDateTime = transformDateTime(truckPlannings[i].ReturnTime, truckPlannings[i].ReturnGate);
        }
        // gets the CW vehiclePositions in an array
        var vehiclePositions = getCWVehiclePostion(vehicleID, departDateTime, returnDateTime).fetch();
        //console.log('vehiclePositions', vehiclePositions.length);
        for ( j = 0; j < vehiclePositions.length; j++) {
    			 if (inRange(vehiclePositions[j].Longitude, vehiclePositions[j].Latitude, destination.Longitude, destination.Latitude)) {
            // if ((convertNumberToCoordinateDouble(destination.Longitude) - 0.0004 < vehiclePositions[j].Longitude < convertNumberToCoordinateDouble(destination.Longitude) + 0.0004)
            //       && (convertNumberToCoordinateDouble(destination.Latitude) - 0.0004 < vehiclePositions[j].Latitude < convertNumberToCoordinateDouble(destination.Latitude) + 0.0004));
            var time = moment.duration(moment(vehiclePositions[j].ReceivedTime).diff(departDateTime)).asMinutes();
            if(time > 5 && time < 600){
              totalTime += time;
              count++;
            }
            console.log('totalTime: ', totalTime);
            console.log('count: ', count);
            break;
    			}
    		}
      }
    }
    console.log('Done: ', totalTime / count);
    return totalTime / count;
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

  function transformDateTime(numberTime, date) {
    var time = numberTime.toString();
    //console.log(typeof date, " ", date);
    var newTime;
    if(time.length == 3){
      newTime = time.substr(0,1) + ":" + time.substr(1);
    } else {
      newTime = time.substr(0,2) + ":" + time.substr(2);
    }
    newDateTime = moment(date + " " + newTime);
    return newDateTime;
  }

  // get the truck Plannings from the Modality data
  function getTruckPlannings (departCode, destinationCode, returnCode) {
    //console.log('depart ', departCode);
    //console.log('LoadDisch ', destinationCode);
    return truckPlanning.find({ From: departCode, LoadDisch: destinationCode, DepartGate: /.*2017.*/ });
  }

  // get the vehicle positions of the truck driving the order
  function getCWVehiclePostion (CWVehicleID, departTime, returnTime) {
    if(returnTime) {
      return CWReturnVehiclePosition.find({ CWVehicleID: CWVehicleID, ReceivedTime: {$gt: departTime.format(), $lt: returnTime.format()} }, { $orderby: { ReceivedTime: 1 } });
    } else {
      return CWReturnVehiclePosition.find({ CWVehicleID: CWVehicleID, ReceivedTime: {$gt: departTime.format()}}, {$orderby: { ReceivedTime: 1 }});
    }
  }

  // get the destination from the customerGeolocations collection
  function getDestination (destinationCode) {
    return customerGeolocations.findOne({ Code: destinationCode });
  }

  // genakt van http://www.movable-type.co.uk/scripts/latlong.html
  function inRange (lonpos, latpos, lonclient, latclient) {
    var correctLonPos = convertNumberToCoordinateDouble(lonpos);
    var correctLatPos = convertNumberToCoordinateDouble(latpos);
    //console.log('lonpos ', correctLonPos);
    //console.log('latpos ', correctLatPos);
    //console.log('lonclient ', lonclient);
    //console.log('latclient ', latclient);
    var R = 6371e3; // metres
    var φ1 = toRad(latpos);
    var φ2 = toRad(latclient);
    var Δφ = toRad((latclient - latpos));
    var Δλ = toRad((lonclient - lonpos));

    var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    var d = (R * c)/100000;
    //console.log('D: ', d);
    return d < 300;
  }

  function toRad (pos) {
    /** Converts numeric degrees to radians */
    return pos * Math.PI / 180;
  }

  function convertNumberToCoordinateDouble (pos) {
    var posString = pos.toString();
    var i;
    for( i = 0; i < 3; i++){
      if( (posString.length - i) == 5){
        newposString = posString.substr(0, i) + '.' + posString.substr(i);
      }
    }
    return parseFloat(newposString);
  }
}
