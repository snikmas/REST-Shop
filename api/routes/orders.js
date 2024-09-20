const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const checkAuth = require('../middleware/check-auth')

const Order = require('../models/order')
const Product = require('../models/product');
// handle incoming get requests to /orders

// in select we write what kind of properties we would like to see
router.get('/', checkAuth, (req, res, next) => {
  Order.find()
    .select('product quantity _id') 
    .populate('product', 'name') // populate a PROPERTY NANE 
    .exec()
    .then(docs => {
      res.status(200).json({
        count: docs.length,
        orders: docs.map(doc => {
          return {
            _id: doc._id,
            product: doc.product,
            quantity: doc.quantity,
            request: {
              type: 'GET',
              url: 'http://localhost:3000/orders/' + doc._id
            }};
        })
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err,
      })
    });
});

router.post('/', checkAuth, (req, res, next) => {
  Product.findById(req.body.productId)
    .then(product => {
      if (!product) {
        return res.status(404).json({
          message: 'Product not found'
        })
      }
      const order = new Order({
        _id: new mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.productId
      });
      return order.save()   
    })
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Orded stored",
        createdOrder: {
          _id: result._id,
          product: result.product,
          quantity: result.quantity
        },
        request: {
          type: "POST",
          url: "http://localhost:3000/orders/" + result._id
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.get('/:orderId', checkAuth, (req, res, next) => {
  const id = req.params.orderId;
  Order.findById(id)
    // my line select
    .select(' _id product quantity')
    .populate('product')
    .exec()
    .then(order => {
      if (!order) {
        return res.status(404).json({
          message: 'Order not found'
        });
      }
      res.status(200).json({
        order: order,
        request: {
          type: 'GET',
          url: 'http://localhost:3000/orders/'
        }
      });
    })
    .catch(err => {
       res.status(500).json({
        error:err
       });
  });
});

router.delete('/:orderId', checkAuth, (req, res, next) => {
  const id = req.params.orderId;

  Order.deleteOne({_id: id})
    .exec()
    .then(result => {
      res.status(200).json({
        message: 'Order deleted',
        request: {
          type: "DELETE",
          url: 'http://localhost:3000/orders',
          body: { productId: 'ID', quantity: 'Number'}
        }
      });
    })
});




module.exports = router;