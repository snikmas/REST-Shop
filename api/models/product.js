const mongoose = require('mongoose');

// we define what kind of type should it be: String, objectid etc
const productSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  price: { type: Number, required: true },
  productImage: { type: String  } //required: true
});

// the schema which we want use in this module (Product)
module.exports = mongoose.model('Product', productSchema)