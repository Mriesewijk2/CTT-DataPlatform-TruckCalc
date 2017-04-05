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
        { key: 'booking', label: 'Booking Nr.'},
        { key: 'container', label: 'Container Nr.'},
        { key: 'needed_depart_time', label: 'Departure Time'},
        { key: 'arrival_time', label: 'Arrival Time'},
        { key: 'city', label: 'From'},
        { key: 'load_disc', label: 'Destination'}

        ]
    };
  }
});
