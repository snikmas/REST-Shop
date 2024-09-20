const mongoose = require('mongoose');
// unique doesnt check for any validation for purpose
// just optimizes
const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    //emain regex google it
    match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
  },
  password: { type: String, required: true }

});

module.exports = mongoose.model('User', userSchema);