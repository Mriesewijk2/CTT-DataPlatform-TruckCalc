import { Template } from 'meteor/templating';

import { TruckOrders } from '../api/truckOrders.js';

import './body.html';


Template.body.helpers({
  tasks () {
    return TruckOrders.find({});
  }
});
