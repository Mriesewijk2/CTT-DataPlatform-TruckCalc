import { Template } from 'meteor/templating';
import { TruckOrders } from '../api/truckOrders.js';

// JS code for the table
Template.body.helpers({
  settings: function () {
    var collection = TruckOrders.find({arrival_time: { $exists: true, $ne: null}});
    return {
      collection: collection,
      rowsPerPage: 100,
      showFilter: true,
      fields: [
        'booking',
        'container',
        'needed_depart_time',
        'arrival_time',
        'load_disc',
        'city']
    };
  }
});
