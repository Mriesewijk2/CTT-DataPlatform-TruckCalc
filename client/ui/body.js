import { Template } from 'meteor/templating';
import { moment } from 'meteor/momentjs:moment';
import { Meteor } from 'meteor/meteor';
import { averageTravelTimes } from '../../lib/collections.js';
import { ReactiveDict } from 'meteor/reactive-dict';

import './body.html';
import './table.js';
import './addAverageTimeForm.html';
import '../subscriptions.js';

if (Meteor.isClient) {
  Template.body.onCreated(function bodyOnCreated () {
    this.state = new ReactiveDict();
    console.log(averageTravelTimes.find({}));
  });

  Template.body.helpers({
    averages () {
      return averageTravelTimes.find({});
    }
  });

  Template.addAverageTimeForm.events({
    'submit form': function (event) {
      event.preventDefault();
      var target = event.target;
      Meteor.call('average.insert', target.customer.value);
      console.log(target.customer.value);
      event.target.reset();
    }
  });
}
