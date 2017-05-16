import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { moment } from 'meteor/momentjs:moment';
import { averageTravelTimes, customerGeolocations, truckPlanning } from '../../lib/collections.js';

if (Meteor.isClient) {
  // JS code for the table
  Template.body.helpers({
    settings: function () {
      var collection = truckPlanning.find({}, {fields: {'_id': 1, 'From': 1, 'LoadDisch': 1, 'PlannedDepartTime': 1, 'PlannedArrivalTime': 1, 'To': 1}, limit: 100});
      var tableData = getTableData(collection);
      return {
        collection: tableData,
        rowsPerPage: 10,
        showFilter: true,
        fields: [
          { key: '_id', label: 'id'},
          { key: 'From', label: 'From' },
          { key: 'LoadDisch', label: 'To' },
          { key: 'PlannedDepartTime', label: 'Planned Depart Time' },
          { key: 'PlannedArrivalTime', label: 'Planned Arrival Time' },
          { key: 'To', label: 'Return' },
          { key: 'calculate', label: 'calculate', tmpl: Template.calculateTempl}
        ]
      };
    }
  });

// add a geolocation to the traveltime entry ( connecting customerabreviation to geolocation
// in a different collection)
  function getTableData (collection) {
    var array = collection.fetch();
    var result = [];
      for (var i = 0; i < array.length; i++) {
        var order = array[i];
        if (order.From && order.LoadDisch && order.PlannedDepartTime) {
          var concatenatedCode = order.From.concat(order.LoadDisch);
            result.push({
              _id : order._id,
              concatenatedCode: concatenatedCode,
              From: order.From,
              LoadDisch: order.LoadDisch,
              PlannedDepartTime: order.NeededDepartTime,
              PlannedArrivalTime: order.PlannedDepartTime,
              To: order.To
            });
        }
      }
      return result;
  }
}
