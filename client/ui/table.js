import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { averageTravelTimes, customerGeolocations } from '../../lib/collections.js';

if (Meteor.isClient) {
  // JS code for the table
  Template.body.helpers({
    settings: function () {
      var collection = averageTravelTimes.find({});
      var averagesGeolocations = addGeoLocations(collection);
      return {
        collection: averagesGeolocations,
        rowsPerPage: 100,
        showFilter: true,
        fields: [
          { key: 'customerAbrv', label: 'Customer Abrv'},
          { key: 'averageTravelTime', label: 'average Travel Time'},
          { key: 'createdAt', label: 'createdAt'},
          { key: 'editedAt', label: 'editedAt'},
          { key: 'latitude', label: 'latitude'},
          { key: 'longitude', label: 'longitude'}
        ]
      };
    }
  });

// add a geolocation to the traveltime entry ( connecting customerabreviation to geolocation
// in a different collection)
  function addGeoLocations (collection) {
    var array = collection.fetch();
    var result = [];
    var i = 0;
      for (i = 0; i < array.length; i++) {
        var customer = array[i];
        var geolocation = customerGeolocations.findOne({ Code: customer.customerAbrv });
        if(geolocation) {
          result.push({
            customerAbrv: customer.customerAbrv,
            averageTravelTime: customer.averageTravelTime,
            createdAt: customer.createdAt,
            editedAt: customer.editedAt,
            latitude: geolocation['Latitude'],
            longitude: geolocation['Longitude']
          });
        }
      }
      return result;
  }
}
