const mongoose = require('mongoose')

//we want to connect this schema with product model
const orderSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1} 
});

// when we call Order => it will be mean ordreSchema
module.exports = mongoose.model('Order', orderSchema)