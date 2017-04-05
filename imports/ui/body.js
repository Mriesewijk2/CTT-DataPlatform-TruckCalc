import { Template } from 'meteor/templating';
import { TruckOrders } from '../api/truckOrders.js';
import { moment } from 'meteor/momentjs:moment';

import './body.html';
import './table.js';
import './truckOrderForm.html';

Template.addTruckOrderForm.onRendered(function () {
  this.$('.datetimepicker').datetimepicker({
    format: 'HH:mm DD-MM-YYYY'
  });
});

Template.addTruckOrderForm.events({
  'submit form': function (event) {
    event.preventDefault();
    var target = event.target;
    //  moment does not work correctly with date from datetimepicker, therefore the new Date
    var arrivalTime = moment(new Date(target.arrival_time.value)).format();
    TruckOrders.insert({
      booking: target.ordernumber.value,
      container: target.containernumber.value,
      arrival_time: arrivalTime,
      needed_depart_time: departTimeCalc(arrivalTime),
      load_disc: target.destination.value,
      from: target.destination.value
    });
    event.target.reset();
  }
});

function departTimeCalc (arrivalTime) {
  return moment(arrivalTime).subtract(2, 'hours').format();
}
