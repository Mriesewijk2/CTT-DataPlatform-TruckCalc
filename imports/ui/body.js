import { Template } from 'meteor/templating';
import { TruckOrders } from '../api/truckOrders.js';

import './body.html';
import './table.js';

Template.addTruckOrderForm.events({
  'submit form': function (event) {
    event.preventDefault();
    var ordernumbervar = event.target.ordernumber.value;
    console.log(ordernumbervar);
    TruckOrders.insert({
      t_number: ordernumbervar,
      arrival_time: 1100
    });
    event.target.ordernumber.value = '';
  }
});
