import { Meteor } from 'meteor/meteor';
import { averageTravelTimes, customerGeolocations, truckPlanning } from '../lib/collections.js';

if (Meteor.isServer) {
  Meteor.publish('averageTravelTimes', function () {
    return averageTravelTimes.find();
  });
  Meteor.publish('customerGeolocations', function () {
    return customerGeolocations.find();
  });
  Meteor.publish('truckPlanning', function () {
    return truckPlanning.find();
  });
}
