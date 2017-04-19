import { Meteor } from 'meteor/meteor';
import { moment } from 'meteor/momentjs:moment';
import { averageTravelTimes } from '../../lib/collections.js';
// export const averageTravelTimes = new Mongo.Collection('averageTravelTimes');

if (Meteor.isServer) {
  Meteor.methods({
    'average.insert' (customer, calculatedTravelTime) {
      console.log(moment(new Date()).format());
      console.log(customer);
      var exists = averageTravelTimes.findOne({customerAbrv: customer});
      if (exists) {
        averageTravelTimes.update(exists._id, {$set: {travelTime: calculatedTravelTime, editedAt: moment(new Date()).format()}});
      } else {
        averageTravelTimes.insert({
          customerAbrv: customer,
          averageTravelTime: calculatedTravelTime,
          createdAt: moment(new Date()).format(),
          editedAt: moment(new Date()).format()
        });
      }
    }
  });
}
