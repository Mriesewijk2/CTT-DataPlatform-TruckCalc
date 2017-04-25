import { Meteor } from 'meteor/meteor';
import { moment } from 'meteor/momentjs:moment';
import { averageTravelTimes } from '../../lib/collections.js';
// export const averageTravelTimes = new Mongo.Collection('averageTravelTimes');

// import '../calculations/averageTravelTimeCalculator.js';

if (Meteor.isServer) {
  Meteor.methods({
    'average.insert' (customer) {
      console.log(moment(new Date()).format());
      console.log(customer);
      var calculatedTravelTime = averageTravelTimeCalculate();
      var exists = averageTravelTimes.findOne({customerAbrv: customer});
      if (exists) {
        console.log('trigger');
        averageTravelTimes.update(exists._id, {$set: {averageTravelTime: calculatedTravelTime, editedAt: moment(new Date()).format()}});
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

  function averageTravelTimeCalculate () {
    return (Math.floor(Math.random() * 100) + 1);
  };
}
