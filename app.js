// spin up on the express app which will handle requests 
const express = require('express');
const app = express();
const morgan = require('morgan'); // login package for node.js
const bodyParser = require('body-parser'); // for json

const mongoose = require('mongoose')

const productRoutes = require('./api/routes/products');
const ordersRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/users');

mongoose.connect( 'mongodb+srv://marysnikk:' + process.env.MONGO_ATLAS_PW + '@cluster0.e9bpw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
);

mongoose.Promise = global.Promise;

app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'))
// which kind of body would you like to parse
// true = for extended bodies? ; false - for a simply body, just urledincoded data
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// no sent a response, just adjust it
// the second * - for everyone, we can also change that only one line will be allow to go through it
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*' )
  // all these headers can be appended in incoming request
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  // browser always will send OPTIONS request first when we use put/post request
  if(req.method === "OPTIONS"){
    res.header('Access-Controll-Allow-Methods', 'PUT', 'POST', 'PATCH', 'DELETE', 'GET');
    return res.status(200).json({})
    // after getting here we don't need our routes so we return it here
  }

  // if we don't return option request: go here next
  next(); 
})


// routes which should handle requests
// anything which starts from /products will be send to the productRoutes file
app.use('/products', productRoutes);
app.use('/orders', ordersRoutes);
app.use('/users', userRoutes);

// if no /products/orders request, then we got something strange and it will run automatically for everything
app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});
// NEXT SO WE GET THIS MIDDLEWARE EITHER
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;