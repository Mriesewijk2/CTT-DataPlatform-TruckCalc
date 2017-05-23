import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { moment } from 'meteor/momentjs:moment';
import { averageTravelTimes, truckPlanning } from '../../lib/collections.js';

if (Meteor.isClient) {
  // JS code for the table
  Template.body.helpers({
    settings: function () {
      var collection = truckPlanning.find({}, { fields: {'_id': 1, 'From': 1, 'LoadDisch': 1, 'NeededDepartTimeGoogle': 1, 'NeededDepartTimeData': 1, 'PlannedArrivalTime': 1, 'PlannedDate': 1, 'To': 1}, limit: 100, sort: {'PlannedDate': -1} });
      var tableData = getTableData(collection);
      return {
        collection: tableData,
        rowsPerPage: 10,
        showFilter: true,
        rowClass: function(item){
          var css = 'success';
          if (item.LoadDisch === 'VISSAL'){
            css = 'danger';
          }
          return css;
        },
        fields: [
          { key: 'From', label: 'From' },
          { key: 'LoadDisch', label: 'To' },
          { key: 'PlannedDepartTimeGoogle', label: 'Planned Depart Time Google' },
          { key: 'PlannedDepartTimeData', label: 'Planned Depart Time Data' },
          { key: 'PlannedArrivalTime', label: 'Planned Arrival Time' },
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
        if (order.From && order.LoadDisch && order.PlannedArrivalTime) {
          var concatenatedCode = order.From.concat(order.LoadDisch);
          var neededDepartTimeGoogle = order.NeededDepartTimeGoogle;
          var neededDepartTimeData = order.NeededDepartTimeData;
          // combine the time and date to a datetime
          var plannedArrivalTime = arrivalTimeTransform(order.PlannedArrivalTime, order.PlannedDate).format();
          if(!neededDepartTimeGoogle && !neededDepartTimeData) {
            Meteor.call('truckPlanning.calculate', order._id);
            // refresh the neededDepartTimeGoogle data
            neededDepartTimeGoogle = truckPlanning.findOne({_id: order._id}, {fields: {'NeededDepartTimeGoogle': 1}}).NeededDepartTimeGoogle;
            neededDepartTimeData = truckPlanning.findOne({_id: order._id}, {fields: {'NeededDepartTimeData': 1}}).NeededDepartTimeData;
          }
            result.push({
              _id : order._id,
              concatenatedCode: concatenatedCode,
              From: order.From,
              LoadDisch: order.LoadDisch,
              PlannedDepartTimeData: neededDepartTimeData,
              PlannedDepartTimeGoogle: neededDepartTimeGoogle,
              PlannedArrivalTime: plannedArrivalTime,
              To: order.To
            });
        }
      }
      return result;
  }

// time is an INT in the database and has to be transformed to a datetime combined with the date in order to be usefull.
  function arrivalTimeTransform (arrivalTimeInt, arrivalDate) {
    var time = arrivalTimeInt.toString();
    var newTime;
    if(time.length === 3) {
      newTime = time.substr(0, 1) + ':' + time.substr(1);
    } else {
      newTime = time.substr(0, 2) + ':' + time.substr(2);
    }
    var newDateTime = moment(arrivalDate + ' ' + newTime);
    return newDateTime;
  }
}
