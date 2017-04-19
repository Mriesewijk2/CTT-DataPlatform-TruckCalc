import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { averageTravelTimes } from '../../lib/collections.js';

if (Meteor.isClient) {
  // JS code for the table
  Template.body.helpers({
    settings: function () {
      var collection = averageTravelTimes.find({});
      return {
        collection: collection,
        rowsPerPage: 100,
        showFilter: true,
        fields: [
          { key: 'customerAbrv', label: 'Customer Abrv'},
          { key: 'averageTravelTime', label: 'average Travel Time'},
          { key: 'createdAt', label: 'createdAt'},
          { key: 'editedAt', label: 'editedAt'}
        ]
      };
    }
  });
}
