import { Template } from 'meteor/templating';
import { moment } from 'meteor/momentjs:moment';
import { $ } from 'meteor/jquery';
import { Meteor } from 'meteor/meteor';
import { customerGeolocations } from '../../lib/collections.js';
import { ReactiveDict } from 'meteor/reactive-dict';
//import {ReactiveTabs} from 'meteor/templates:tabs';

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

  Template.calculateTempl.events({
    'click #calculate': function (e) {
      e.preventDefault();
    }
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
    }
  });

  ReactiveTabs.createInterface({
  template: 'basicTabs',
  onChange: function (slug, template) {
    // This callback runs every time a tab changes.
    // The `template` instance is unique per {{#basicTabs}} block.
    console.log('[tabs] Tab has changed! Current tab:', slug);
    console.log('[tabs] Template instance calling onChange:', template);
  }
});

  Template.tabtemplate.helpers({
  tabs: function () {
    // Every tab object MUST have a name and a slug!
    return [
      { name: 'People', slug: 'people' },
      { name: 'Places', slug: 'places' },
      /*{ name: 'Things', slug: 'things', onRender: function(slug, template) {
        // This callback runs every time this specific tab's content renders.
        // As with `onChange`, the `template` instance is unique per block helper.
        alert("[tabs] Things has been rendered!");
      }}*/
    ];
  },
  activeTab: function () {
    // Use this optional helper to reactively set the active tab.
    // All you have to do is return the slug of the tab.

    // You can set this using an Iron Router param if you want--
    // or a Session variable, or any reactive value from anywhere.

    // If you don't provide an active tab, the first one is selected by default.
    // See the `advanced use` section below to learn about dynamic tabs.
    return Session.get('activeTab'); // Returns "people", "places", or "things".
  }
});
}
