import { Mongo } from 'meteor/mongo';

export const averageTravelTimes = new Mongo.Collection('averageTravelTimes');
export const customerGeolocations = new Mongo.Collection('customerGeolocations');
export const CWReturnVehicles = new Mongo.Collection('CWReturnVehicles');
export const CWReturnVehiclePosition = new Mongo.Collection('CWReturnVehiclePosition');
export const truckPlanning = new Mongo.Collection('truckPlanning');
