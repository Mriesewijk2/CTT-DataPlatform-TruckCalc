import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

Template.body.onCreated(function bodyOnCreated () {
  Meteor.subscribe('averageTravelTimes');
  Meteor.subscribe('customerGeolocations');
});
