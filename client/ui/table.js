import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { moment } from 'meteor/momentjs:moment';
import { averageTravelTimes, truckPlanning } from '../../lib/collections.js'

if (Meteor.isClient) {
  // JS code for the table
  Template.tabtemplate.helpers({
    Upcoming: function () {
      var collection = truckPlanning.find({departed: {$ne: true}, From: {$ne: ''}, LoadDisch: {$ne: ''}, PlannedDate: {$ne: ''}, PlannedArrivalTime: {$ne: ''}},
      { fields: {'_id': 1, 'From': 1, 'LoadDisch': 1, 'NeededDepartTimeGoogle': 1, 'PlannedArrivalTime': 1, 'PlannedDate': 1, 'To': 1, 'departed': 1}, limit: 100, sort: {'PlannedDate': -1} });
      var tableData = getTableData(collection);
      var currentTime = moment();
      return {
        collection: tableData,
        rowsPerPage: 20,
        showFilter: true,
        rowClass: function (item) {
          var css = 'success';
          var departTime = moment(item.time);
          var diff = departTime.diff(currentTime, 'minutes');
          if (diff < 10) {
            css = 'danger';
          } else if (diff < 5) {
            css = 'error';
          }
          return css;
        },
        fields: [
          { key: 'From', label: 'From' },
          { key: 'LoadDisch', label: 'To' },
          { key: 'PlannedDepartTimeGoogle', label: 'Planned Depart Time Google', sortOrder: 0, sortDirection: 'ascending' },
          { key: 'PlannedArrivalTime', label: 'Planned Arrival Time' },
          { key: 'Planned', label: 'Planned', tmpl: Template.departedTmpl}
        ]
      };
    },
    Planned: function () {
      var collection = truckPlanning.find({departed: true, From: {$ne: ''}, LoadDisch: {$ne: ''}, PlannedDate: {$ne: ''}, PlannedArrivalTime: {$ne: ''}},
      { fields: {'_id': 1, 'From': 1, 'LoadDisch': 1, 'NeededDepartTimeGoogle': 1, 'PlannedArrivalTime': 1, 'PlannedDate': 1, 'To': 1, 'departed': 1}, limit: 100, sort: {'PlannedDate': -1} });
      var tableData = getTableData(collection);
      return {
        collection: tableData,
        rowsPerPage: 20,
        showFilter: true,
        fields: [
          { key: 'From', label: 'From' },
          { key: 'LoadDisch', label: 'To' },
          { key: 'PlannedDepartTimeGoogle', label: 'Planned Depart Time Google', sortOrder: 0, sortDirection: 'ascending' },
          { key: 'PlannedArrivalTime', label: 'Planned Arrival Time' }
        ]
      };
    }
  });

  function getTableData (collection) {
    var array = collection.fetch();
    var result = [];
      for (var i = 0; i < array.length; i++) {
        var order = array[i];
          var concatenatedCode = order.From.concat(order.LoadDisch);
          var neededDepartTimeGoogle = order.NeededDepartTimeGoogle;
          // combine the time and date to a datetime
          var plannedArrivalTime = arrivalTimeTransform(order.PlannedArrivalTime, order.PlannedDate).format();
          if(!neededDepartTimeGoogle) {
            Meteor.call('truckPlanning.calculate', order._id);
            // refresh the neededDepartTimeGoogle data
            neededDepartTimeGoogle = truckPlanning.findOne({_id: order._id}, {fields: {'NeededDepartTimeGoogle': 1}}).NeededDepartTimeGoogle;
          }
            result.push({
              _id : order._id,
              concatenatedCode: concatenatedCode,
              From: order.From,
              LoadDisch: order.LoadDisch,
              time: neededDepartTimeGoogle,
              PlannedDepartTimeGoogle: moment(neededDepartTimeGoogle).format('DD/MM/YYYY hh:mm'),
              PlannedArrivalTime: moment(plannedArrivalTime).format('DD/MM/YYYY hh:mm'),
              To: order.To,
              Planned: order.departed
            });
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
    var newDateTime = moment((arrivalDate + ' ' + newTime), 'DD-MM-YYYY HH:mm');
    return newDateTime;
  }
}
