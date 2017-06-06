import { customerGeolocations } from '../../lib/collections.js';
import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

import './apiKeys.js';

if (Meteor.isServer) {
  getGoogleTravelTime = function (origin, destination) {
    if (origin && destination) {
      var originGeolocations = origin.Latitude + ',' + origin.Longitude;
      var destinationGeolocations = destination.Latitude + ',' + destination.Longitude;
    } else {
      return 'No origin or destination found';
    }
    var key = getKey();
    var reply = HTTP.get('https://maps.googleapis.com/maps/api/distancematrix/json?',
    					{params: {'origins': originGeolocations, 'destinations': destinationGeolocations, 'key': key}});
    var result = reply;
    if (result.STATUS === 'INVALID_REQUEST') {
      return 'Je shit klopt niet.';
    } else if (result.STATUS === 'MAX_ELEMENTS_EXCEEDED') {
      return 'Deze error kan niet voorkomen. Als dat wel zo is zit je in één of andere abstracte dimensie zonder tijd ofzo.';
    } else if (result.STATUS === 'OVER_QUERY_LIMIT') {
      return 'Je hebt wel weer genoeg gequeried voor vandaag, of niet dan?';
    } else if (result.STATUS === 'REQUEST_DENIED') {
      return 'Google wil nie helpuh :(';
    } else if (result.STATUS === 'UNKNOWN_ERROR') {
    'Server error. We proberen het gewoon nog een keer. Hoppaaaa';
      return getGoogleTravelTime(origin, destination);
    } else if (result.data.status === 'NOT_FOUND') {
      return 'Geef even normale locaties op.';
    } else if (result.data.status === 'ZERO_RESULTS') {
      return 'Er bestaat klaarblijkelijk geen route tussen die locaties. De locaties kloppen wel hoor, schat.';
    } else if (result.data.status === 'MAX_ROUTE_LENGTH_EXCEEDED') {
      return 'Ik trek die route niet joh; veels te lang!';
    } else {
      return result.data.rows[0].elements[0].duration.value / 60;
    }
  };
}
