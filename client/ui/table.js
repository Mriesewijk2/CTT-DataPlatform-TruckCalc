import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { averageTravelTimes, customerGeolocations, truckPlanning } from '../../lib/collections.js';

if (Meteor.isClient) {
  // JS code for the table
  Template.body.helpers({
    settings: function () {
      var collection = averageTravelTimes.find({});
      // var averagesGeolocations = addGeoLocations(collection);
      return {
        collection: collection,
        rowsPerPage: 100,
        showFilter: true,
        fields: [
          { key: 'concatenatedCode', label: 'concatenatedCode' },
          { key: 'departCode', label: 'Depart Code' },
          { key: 'destinationCode', label: 'destinationCode' },
          { key: 'averageTravelTime', label: 'averageTravelTime' },
          { key: 'createdAt', label: 'createdAt' },
          { key: 'editedAt', label: 'editedAt' }
        ]
      };
    }
  });

// add a geolocation to the traveltime entry ( connecting customerabreviation to geolocation
// in a different collection)
  function addGeoLocations (collection) {
    var array = collection.fetch();
    var result = [];
      for (var i = 0; i < array.length; i++) {
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
