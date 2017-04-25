import { Meteor } from 'meteor/meteor';
import { averageTravelTimes, customerGeolocations } from '../lib/collections.js';

if (Meteor.isServer) {
  Meteor.publish('averageTravelTimes', function () {
    console.log('published');
    return averageTravelTimes.find();
  });
  Meteor.publish('customerGeolocations', function () {
    return customerGeolocations.find();
  });
}
