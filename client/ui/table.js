import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { moment } from 'meteor/momentjs:moment';
import { averageTravelTimes, truckPlanning } from '../../lib/collections.js';

if (Meteor.isClient) {
  // JS code for the table
  Template.tabtemplate.helpers({
    Upcoming: function () {
      var collection = truckPlanning.find({Planned: {$ne: true}, From: {$ne: ''}, LoadDisch: {$ne: ''}, PlannedDate: {$ne: ''}, PlannedArrivalTime: {$ne: ''}},
      { fields: {'_id': 1, 'From': 1, 'LoadDisch': 1, 'NeededDepartTimeGoogle': 1, 'PlannedArrivalTime': 1, 'PlannedDate': 1, 'To': 1, 'Planned': 1, 'Distance': 1, 'Input': 1}, limit: 100, sort: {'PlannedDate': -1} });
      var tableData = getTableData(collection, 'Upcoming');
      var currentTime = moment();
      return {
        collection: tableData,
        rowsPerPage: 20,
        showFilter: true,
        rowClass: function (item) {
          var css = 'success';
          var diff = item.Diff;
          if (diff < 60 && diff > 30) {
            css = 'warning';
          } else if (diff < 30) {
            css = 'danger';
          }
          return css;
        },
        fields: [
          { key: 'From', label: 'From' },
          { key: 'LoadDisch', label: 'Via' },
          { key: 'To', label: 'To'},
          { key: 'Distance', label: 'Distance (Km)' },
          { key: 'PlannedDepartTimeGoogle', label: 'Recommended Departure', sortOrder: 0, sortDirection: 'ascending' },
          { key: 'PlannedArrivalTime', label: 'Planned Arrival' },
          { key: 'Tmpl' , label: 'Input', tmpl: Template.datepicker}

        ]
      };
    },
    Planned: function () {
      var collection = truckPlanning.find({Planned: true, Departed: {$ne: true}, From: {$ne: ''}, LoadDisch: {$ne: ''}, PlannedDate: {$ne: ''}, PlannedArrivalTime: {$ne: ''}},
      { fields: {'_id': 1, 'From': 1, 'LoadDisch': 1, 'NeededDepartTimeGoogle': 1, 'PlannedArrivalTime': 1, 'PlannedDate': 1, 'To': 1, 'Departed': 1, 'Distance': 1, 'Input': 1}, limit: 100, sort: {'PlannedDate': -1} });
      var tableData = getTableData(collection, 'PlannedKmCount');
      return {
        collection: tableData,
        rowsPerPage: 20,
        showFilter: true,
        fields: [
          { key: 'From', label: 'From' },
          { key: 'LoadDisch', label: 'Via' },
          { key: 'To', label: 'To'},
          { key: 'Distance', label: 'Distance (Km)' },
          { key: 'Input' , label: 'Planned Departure'},
          { key: 'PlannedArrivalTime', label: 'Planned Arrival' },
          { key: 'Tmpl' , label: 'Change', tmpl: Template.datepicker2},
          { key: 'Departed', label: 'Departed / Cancel', tmpl: Template.plannedTmpl}
        ]
      };
    },

    Departed: function () {
      var collection = truckPlanning.find({Planned: true, Departed: true, From: {$ne: ''}, LoadDisch: {$ne: ''}, PlannedDate: {$ne: ''}, PlannedArrivalTime: {$ne: ''}},
      { fields: {'_id': 1, 'From': 1, 'LoadDisch': 1, 'NeededDepartTimeGoogle': 1, 'PlannedArrivalTime': 1, 'PlannedDate': 1, 'To': 1, 'Departed': 1, 'Distance': 1}, limit: 100, sort: {'PlannedDate': -1} });
      var tableData = getTableData(collection, 'DepartedKmCount');
      return {
        collection: tableData,
        rowsPerPage: 20,
        showFilter: true,
        fields: [
          { key: 'From', label: 'From' },
          { key: 'LoadDisch', label: 'Via' },
          { key: 'To', label: 'To'},
          { key: 'Input' , label: 'Planned Departure'},
          { key: 'PlannedArrivalTime', label: 'Planned Arrival' },
          { key: 'Departed', label: 'Cancel', tmpl: Template.departedTmpl }
        ]
      };
    }
  });

  function getTableData (collection, elementId) {
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
          var inputvar;
          if(order.Input != null){
            inputvar = moment(order.Input).format('DD/MM/YYYY hh:mm');
          }
          var diff = moment(neededDepartTimeGoogle).diff(moment(), 'minutes');
            result.push({
              _id : order._id,
              concatenatedCode: concatenatedCode,
              From: order.From,
              LoadDisch: order.LoadDisch,
              Diff: diff,
              PlannedDepartTimeGoogle: moment(neededDepartTimeGoogle).format('MM-DD HH:mm'),
              PlannedArrivalTime: moment(plannedArrivalTime).format('MM-DD HH:mm'),
              To: order.To,
              Planned: order.Planned,
              Departed: order.Departed,
              Input: moment(order.Input).format('MM-DD HH:mm'),
              //Tmpl:order.Tmlp
              Distance: Math.round(order.Distance)
            });
      }
      fillExtraData(result, elementId);
      return result;
  }

function fillExtraData (collection, elementId) {
  var trucksNeeded = 0;
  var trucksLate = 0;
  var totalKm = 0;
  var i;
  console.log(collection.length);
  for (i = 0; i < collection.length; i++) {
    console.log(collection[i]);
    if(typeof (collection[i].Distance) === 'number') {
      totalKm += collection[i].Distance;
    }
    var diff = collection[i].Diff;
    if (diff < 60 && diff > 0) {
      trucksNeeded++;

    } else if (diff < 0) {
      trucksLate++;
      console.log('trigger');
    }
  }
  var roundedKm = Math.round(totalKm);
  if (elementId === 'Upcoming' && trucksLate > 0) {
    document.getElementById('Calculations').innerHTML = '<div class="col-md-2"><strong>Upcoming km: ' + roundedKm + '</strong></div><div class="col-md-3"><strong> Trucks needed in the upcoming hour: ' + trucksNeeded + '</strong></div><div class="col-md-4 text-danger"><strong> Trucks late: ' + trucksLate + '</strong></div>';
  } else if (elementId === 'Upcoming') {
    document.getElementById('Calculations').innerHTML = '<div class="col-md-2"><strong>Upcoming km: ' + roundedKm + '</strong></div><div class="col-md-3"><strong> Trucks needed in the upcoming hour: ' + trucksNeeded + '</strong></div><div class="col-md-4"><strong> Trucks late: 0</strong></div>';
  } else {
    document.getElementById(elementId).innerHTML = roundedKm;
  }

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
