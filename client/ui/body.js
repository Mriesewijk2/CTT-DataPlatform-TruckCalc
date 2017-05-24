import { Template } from 'meteor/templating';
import { moment } from 'meteor/momentjs:moment';
import { $ } from 'meteor/jquery';
import { Meteor } from 'meteor/meteor';
import { customerGeolocations } from '../../lib/collections.js';
import { ReactiveDict } from 'meteor/reactive-dict';

import './body.html';
import './table.js';
import '../subscriptions.js';

if (Meteor.isClient) {
  Template.body.onCreated(function bodyOnCreated () {
    this.state = new ReactiveDict();
  });
  Template.departedTmpl.events({
    'click .toggle-checked' () {
      console.log('trigger', this._id);
      Meteor.call('set.done', this._id);
      console.log('trigger2', this._id);
    }
  });
}
