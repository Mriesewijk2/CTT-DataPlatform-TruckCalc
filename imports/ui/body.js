import { Template } from 'meteor/templating';
import { TruckOrders } from '../api/truckOrders.js';

import './body.html';

Template.body.helpers({
  settings: function () {
    var collection = TruckOrders.find({ arrival_time: { $exists: true, $ne: null}});
    return {
      collection: collection,
      rowsPerPage: 10,
      showFilter: true,
      fields: ['t_number', 'arrival_time', 'number']
    };
  }
});
