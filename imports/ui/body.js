import { Template } from 'meteor/templating';
import { TruckOrders } from '../api/truckOrders.js';

import './body.html';
import './table.js';
import './truckOrderForm.html';

Template.addTruckOrderForm.events({
  'submit form': function (event) {
    event.preventDefault();
    var target = event.target;
    var arrivalTime = target.ordernumber.value;
    TruckOrders.insert({
      booking: target.ordernumber.value,
      arrival_time: arrivalTime,
      needed_depart_time: departTimeCalc(arrivalTime),
      load_disc: target.destination.value,
      from: target.destination.value
    });
    event.target.ordernumber.value = '';
  }
});

function departTimeCalc (arrivalTime) {
  return 1152;
}
