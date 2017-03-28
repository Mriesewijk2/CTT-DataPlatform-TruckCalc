import { Template } from 'meteor/templating';
import { TruckOrders } from '../api/truckOrders.js';

import './body.html';

Template.body.helpers({
  truckOrders () {
    return TruckOrders.find({ arrival_time: { $exists: true, $ne: null}});
  }
});
