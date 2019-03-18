//set up mongoose
var mongoose = require('mongoose');
//create schema
var Schema = mongoose.Schema;

var urlSchema = new Schema({
  original_url: String,
  short_url: Number, 
  new_url: String
});

var UrlModel = mongoose.model('UrlModel', urlSchema);

module.exports = UrlModel;