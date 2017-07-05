import { Template } from 'meteor/templating';
import { moment } from 'meteor/momentjs:moment';
import { $ } from 'meteor/jquery';
import { Meteor } from 'meteor/meteor';
import { customerGeolocations , truckPlanning } from '../../lib/collections.js';
import { ReactiveDict } from 'meteor/reactive-dict';

//import {ReactiveTabs} from 'meteor/templates:tabs';

import './body.html';
import './table.js';
import '../subscriptions.js';
import '../main.css';

if (Meteor.isClient) {
  Template.body.onCreated(function bodyOnCreated () {
    this.state = new ReactiveDict();
  });

  Template.datepicker.events({
    'click #plannedtrue' () {
      console.log('plannedtrue id' ,this._id);
      Meteor.call('set.plannedtrue', this._id);

    }
  });

  Template.plannedTmpl.events({
    'click #plannedfalse' () {
      Meteor.call('set.plannedfalse', this._id);
      Bert.alert( 'Planning canceled!', 'success' );
    },
    'click #departedtrue' () {
      Meteor.call('set.departedtrue', this._id);
      Bert.alert( 'Truck departed!', 'success' );
    }

  });

  Template.departedTmpl.events({
    'click #departedfalse' () {
      Meteor.call('set.departedfalse', this._id);
      Bert.alert( 'Departure canceled!', 'success' );
    }
  });



  Template.datepicker.onRendered( () => {
  $( '.datetimepicker' ).datetimepicker({
    timeZone: 'America',
    useCurrent: true
  });
});


Template.datepicker.events({
  'submit form' ( event, template ) {
    event.preventDefault();
    //alert('clicked')
    var id = this._id;
    console.log('datepickerid',id);

    let picker   = Template.instance().$( '.datetimepicker' ),
        dateTime = picker.data( 'DateTimePicker' ).date();
        console.log(dateTime);

    if ( dateTime ) {
      let appointment = dateTime.format();
      console.log(appointment);

      Meteor.call( 'addAppointment', id, appointment, ( error, response ) => {
        if ( error ) {
          Bert.alert( error.reason, 'danger' );
        }
        else {
          picker.val( '' );
          Bert.alert( 'Order planned!', 'success' );
        }
      });
    }

    else {
      var planneddep = truckPlanning.findOne({_id: id}, {fields: {'NeededDepartTimeGoogle': 1}}).NeededDepartTimeGoogle;
      //Bert.alert( 'Make sure to pick an appointment time!', 'danger' );
      Meteor.call( 'addAppointment', id, planneddep, ( error, response ) => {
        if ( error ) {
          Bert.alert( error.reason, 'danger' );
        }
        else {
          picker.val( '' );
          Bert.alert( 'Order planned!', 'success' );
        }
      });
    }
  }
});


Template.datepicker2.events({
  'submit form' ( event, template ) {
    event.preventDefault();
    //alert('clicked')
    var id = this._id;
    console.log('datepickerid',id);

    let picker   = Template.instance().$( '.datetimepicker' ),
        dateTime = picker.data( 'DateTimePicker' ).date();
        console.log(dateTime);

    if ( dateTime ) {
      let appointment = dateTime.format();
      console.log(appointment);

      Meteor.call( 'addAppointment', id, appointment, ( error, response ) => {
        if ( error ) {
          Bert.alert( error.reason, 'danger' );
        }
        else {
          picker.val( '' );
          Bert.alert( 'Planning changed!', 'success' );
        }
      });
    }

    else {
      Bert.alert( 'Make sure to pick a departure time!', 'danger' );
    }
  }
});



  /*Template.datepicker.helpers({
    var id = this._id;
    //show_date: function(){
    //  return Session.get("selected");
    //}
  });

  */

  Template.inputtmpl.events({
    'submit .usrinput'(event) {
      // Prevent default browser form submit
      event.preventDefault();
      // Get value from form element
    const target = event.target;
    const text = target.text.value;
    // Insert a task into the collection
    Meteor.call('set.input', this._id, text);
    // Clear form
    target.text.value = '';
    }
  });

  ReactiveTabs.createInterface({
  template: 'basicTabs',
  onChange: function (slug, template) {
    // This callback runs every time a tab changes.
    // The `template` instance is unique per {{#basicTabs}} block.
  }
});

  Template.tabtemplate.helpers({
  tabs: function () {
    // Every tab object MUST have a name and a slug!
    return [
      { name: 'Upcoming', slug: 'Upcoming' },
      { name: 'Planned', slug: 'Planned' },
      { name: 'Departed', slug: 'Departed'}
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
