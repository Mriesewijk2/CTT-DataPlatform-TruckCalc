import { Meteor } from 'meteor/meteor';
import { truckPlanning } from '../../lib/collections.js';

if (Meteor.isServer) {
  Meteor.methods({
    'truckPlanning.calculate' (id) {
      var truckPlanning = truckPlanning.findOne({'_id': id});
      console.log(truckPlanning);
    }
  });
}
