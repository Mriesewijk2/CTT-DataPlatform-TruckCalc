import { Template } from 'meteor/templating';
import { moment } from 'meteor/momentjs:moment';
import { $ } from 'meteor/jquery';
import { Meteor } from 'meteor/meteor';
import { averageTravelTimes, customerGeolocations } from '../../lib/collections.js';
import { ReactiveDict } from 'meteor/reactive-dict';

import './body.html';
import './table.js';
import './addAverageTimeForm.html';
import '../subscriptions.js';

if (Meteor.isClient) {
  Template.body.onCreated(function bodyOnCreated () {
    this.state = new ReactiveDict();
  });

  Template.body.helpers({
    averages () {
      return averageTravelTimes.find({});
    }
  });

  Template.addAverageTimeForm.onRendered(function () {
    $('#departCode').select2({
      allowClear: true,
      placeholder: 'Select departure location'
    });
    $('#destinationCode').select2({
      allowClear: true,
      placeholder: 'Select destination'
    });
  });

  Template.addAverageTimeForm.helpers({
    locations: function () {
      return customerGeolocations.find({}, {fields: {'Code': 1}});
    }
  });

  Template.addAverageTimeForm.events({
    'submit form': function (event) {
      event.preventDefault();
      var target = event.target;
      Meteor.call('average.insert', target.departCode.value, target.destinationCode.value);
      event.target.reset();
    }
  });
}
