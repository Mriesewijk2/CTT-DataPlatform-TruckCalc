import { CWReturnVehicles, truckPlanning, CWReturnVehiclePosition, customerGeolocations } from '../../lib/collections.js';
import { moment } from 'meteor/momentjs:moment';
import { Meteor } from 'meteor/meteor';

if (Meteor.isServer) {
  averageTravelTimeCalculate = function (departObject, destinationObject) {
    var departCode = departObject.Code;
    var destinationCode = destinationObject.Code;
    console.log('destination: ', destinationCode);
    var truckPlannings = getTruckPlannings(departCode, destinationCode).fetch();
    var totalTime = 0;
    var count = 0;
    var i;
    var j;
    var k;
    var t;
    console.log('truckplanning found: ', truckPlannings.length);
    for (i = 0; i < truckPlannings.length; i++) {
      // get the CWVehicleID from the specific id in the truckplanning
      var vehicleID = getCWVehicleID(truckPlannings[i].Truck);
      // get the customerGeolocations record for a specific destinationCode
      var destination = getLocation(destinationCode);
      if (vehicleID && destination) {
        // gets the departDateTime from the truckplanning, converted to a standard Datetime
        var departDateTime = transformDateTime(truckPlannings[i].DepartTime, truckPlannings[i].DepartGate);
        if(truckPlannings[i].ReturnTime && truckPlannings[i].ReturnGate) {
          // gets the returnDateTime from the truckplanning, converted to a standard Datetime
          var returnDateTime = transformDateTime(truckPlannings[i].ReturnTime, truckPlannings[i].ReturnGate);
        }
        // gets the CW vehiclePositions in an array
        var vehiclePositions = getCWVehiclePostion(vehicleID, departDateTime, returnDateTime).fetch();
        console.log('departDateTime: ', departDateTime.format());
        console.log('vehicleID: ', vehicleID);
        console.log(departDateTime.format('DD/MM/YYYY hh:mm'));
        var depart = getLocation(departCode);
        if (vehiclePositions && depart && destination) {
          console.log('vehiclePositions amount: ', vehiclePositions.length);
          if (vehiclePositions.length > 0) {
            for(t = 0; t <= 5; t++){
              console.log('Datetime Positions: ', vehiclePositions[t].ReceivedTime);
              console.log('lat/long', vehiclePositions[t].Longitude, '/', vehiclePositions[t].Latitude);
            }
            if (inRange(vehiclePositions[0].Longitude, vehiclePositions[0].Latitude, depart.Longitude, depart.Latitude, 100)) {
              console.log('start found');
              console.log('vehicleID: ', vehicleID);
              departed:
              for (j = 0; j <= vehiclePositions.length; j++) {
                if(!inRange(vehiclePositions[j].Longitude, vehiclePositions[j].Latitude, depart.Longitude, depart.Latitude, 100)) {
                  var departedTime = vehiclePositions[j].ReceivedTime;
                  console.log('j: ', j);
                  console.log('Departed: ', departedTime);
                  arrived:
                  for (k = j; k <= vehiclePositions.length; k++) {
              			 if (inRange(vehiclePositions[k].Longitude, vehiclePositions[k].Latitude, destination.Longitude, destination.Latitude, 100)) {
                      var time = moment.duration(moment(vehiclePositions[k].ReceivedTime).diff(moment(departedTime))).asMinutes();
                      console.log('time: ', time);
                      if (time > 5 && time < 600) {
                        totalTime += time;
                        count++;
                      }
                      break departed;
              			}
                  }
                }
              }
        		}
          }
        }
      }
    }
    return totalTime / count;
  };

  // get the CarrierWeb vehicle Id from the license entered in Modality
  function getCWVehicleID (license) {
    var cwVehicle = CWReturnVehicles.findOne({ License: license });
    var licensestring;
    if (cwVehicle) {
      return cwVehicle.CWVehicleID;
    } else {
      // xx-xx-xx
      licensestring = license.substr(0, 2) + '-' + license.substr(2, 4) + '-' + license.substr(4);
      cwVehicle = CWReturnVehicles.findOne({ License: licensestring });
      if (cwVehicle) {
        return cwVehicle.CWVehicleID;
      }

      // xx-xxx-x
      licensestring = license.substr(0, 2) + '-' + license.substr(2, 5) + '-' + license.substr(5);
      cwVehicle = CWReturnVehicles.findOne({ License: licensestring });
      if (cwVehicle) {
        return cwVehicle.CWVehicleID;
      }

      // x-xxx-xx
      licensestring = license.substr(0, 1) + '-' + license.substr(1, 4) + '-' + license.substr(4);
      cwVehicle = CWReturnVehicles.findOne({ License: licensestring });
      if (cwVehicle) {
        return cwVehicle.CWVehicleID;
      }

      // xxx-xx-x
      licensestring = license.substr(0, 3) + '-' + license.substr(3, 5) + '-' + license.substr(5);
      cwVehicle = CWReturnVehicles.findOne({ License: licensestring });
      if (cwVehicle) {
        return cwVehicle.CWVehicleID;
      }
      return;
    }

  }

  function transformDateTime (numberTime, date) {
    var time = numberTime.toString();
    //console.log(typeof date, ' ', date);
    var newTime;
    if (time.length === 3) {
      newTime = time.substr(0, 1) + ':' + time.substr(1);
    } else {
      newTime = time.substr(0, 2) + ':' + time.substr(2);
    }
    // console.log('date: ', date);
    // console.log('newTime: ', newTime);
    var newDateTime = moment((date + ' ' + newTime), 'DD-MM-YYYY HH:mm  ');
    // console.log('newDateTime:', newDateTime.format());
    return newDateTime;
  }

  // get the truck Plannings from the Modality data
  function getTruckPlannings (departCode, destinationCode, returnCode) {
    return truckPlanning.find({ From: departCode, LoadDisch: destinationCode, DepartGate: /.*2017.*/ });
  }

  // get the vehicle positions of the truck driving the order
  function getCWVehiclePostion (vehicleID, departTime, returnTime) {
    if(returnTime) {
      return CWReturnVehiclePosition.find({ CWVehicleID: vehicleID, ReceivedTime: {$gt: departTime.format(), $lt: returnTime.format()} }, { $orderby: { ReceivedTime: 1 } });
    } else {
      return CWReturnVehiclePosition.find({ CWVehicleID: vehicleID, ReceivedTime: {$gt: departTime.format()}}, {$orderby: { ReceivedTime: 1 }});
    }
  }

  // get the destination from the customerGeolocations collection
  function getLocation (destinationCode) {
    return customerGeolocations.findOne({ Code: destinationCode });
  }

  // genakt van http://www.movable-type.co.uk/scripts/latlong.html
  function inRange (lonpos, latpos, lonclient, latclient, range) {
    var correctLonPos = convertNumberToCoordinateDouble(lonpos);
    var correctLatPos = convertNumberToCoordinateDouble(latpos);
    var R = 6371e3; // metres
    var φ1 = toRad(correctLatPos);
    var φ2 = toRad(latclient);
    var Δφ = toRad((latclient - correctLatPos));
    var Δλ = toRad((lonclient - correctLonPos));

    var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    var d = (R * c);
    return d < range;
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
       var newposString = posString.substr(0, i) + '.' + posString.substr(i);
      }
    }
    return parseFloat(newposString);
  }
}
