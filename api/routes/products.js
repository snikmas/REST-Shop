const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');
// inside is multer in configuration: store all files in this place!

const storage = multer.diskStorage({
  // the destination where to storage
  destination: function(req, file, cb) {
    cb(null, './uploads');
  },
  // the name of the file
  filename: function(req, file, cb){
    const date = new Date().toISOString().replace(/:/g, '-')
    cb(null, date + file.originalname); 

    // file.filename or
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false); // without error just no saving
  }
}


// const upload = multer({dest: 'uploads/'}); 
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 
  }, 
  fileFilter: fileFilter,
}); 

// /uploads will try to create in the root folder, which doesnt allow

const Product = require('../models/product') // this is a model

// in get we already have products endpoint
router.get('/', (req, res, next) => {
  // get for all products which we have
  Product.find()
    .select('name price _id productImage')
    .exec() 
    .then(docs => {
      const response = {
        count: docs.length,
        products: docs.map(doc => {
          return {
              name: doc.name,
              price: doc.price,
              productImage: doc.productImage,
              _id: doc._id,
              request: {
                type: 'GET',
                url: 'http://localhost:3000/products/' + doc._id
              }
          }
        })
      };

      res.status(200).json(response);
      // if (docs.length >= 0) {
      //   res.status(200).json(docs);
      // } else {
      //   res.status(404).json({
      //     message:"No entries found"
      //   })
      // } if you want, for length == null
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error:err
      })
    });
});


// 201 status - evetything was successfull
// single means that we have only one file

//NOT EXECUTED, SO WITHOUT()c

// try to remove checkauth or change it place after the endpoint. token should work here
router.post('/', checkAuth, upload.single('productImage'),  (req, res, next) => {
  //want to get a name of the product from the incoming req
  const product = new Product({
    _id: new mongoose.Types.ObjectId, // for db id
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path
  });
  
  // method from mongoose for mongoose models, store it in the db
  product
  .save()
  .then(result => {
    console.log(result);
    res.status(201).json({
      message: "Created product successfully",
      createdProduct: {
        name: result.name,
        price: result.price,
        _id: result._id,
        request:{
          type: 'GET',
          url: "http://localhost:3000/products "
        }
      }
    });
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      error:err
    });
  });
  console.log(req.file);
  
});

router.get('/:productId', (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
    .select('name price _id productImage')
    .exec()
    .then(doc => {
      console.log("From database:", doc);
      if (doc) { 
        //I WROTE THIS RETURN BY MYSELF CUZ WHEN HE SEND STATUS HE DOESNT STOP AND TRYING TO SEND THE NEXT LINE CODE AFTER THIS IF FUNCTION SO WE GET 2 STATUSED WHICH IS NOT ALLOWED
        return res.status(200).json({
          product: doc, 
          request: {
            type: 'GET',
            url: 'http://localhost:3000/products'
          }
        });
      } else {
        return res.status(404).json({
          message: 'No valid entry found for provided ID'
        });
      }
      res.status(200).json(doc);
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({error: err})
    });
    

    // we won't write code after this promise cuz its async and it wont wait for a promise and will run immideately
});


// we don't put return cuz we only get one kind of requests

// we put return only if we also have another response but having 1+ responses IS NOT A GOOD IDEA

// for changing in the postman: we need to write an array
router.patch('/:productId', checkAuth, (req, res, next) => {
  const id = req.params.productId;
  const updateOps = {};

  for(const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  // again: no update but UPDATEONE
  Product.updateOne(
    { _id: id}, 
    { $set: updateOps})
  .exec()
  .then(result => {
    res.status(200).json({
      message: 'Product updated',
      request: {
        type: 'PATCH',
        url:'http://locahost3000/producfts' + id
      }
    });
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      error: err
    });
  });
})

router.delete('/:productId', checkAuth, (req, res, next) => {
  const id = req.params.productId;
  // BEFORE HERE WAS PRODUCT.REMOVE BUT MONGOOSE GIVES ME AN ERROR: PRODUCT.REMOVE IS NOT A FUNCTION SO I CHANGED BY DELETEONE GOOD GOOD GOOD
  Product.deleteOne({_id: id})
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Product deleted",
        request: {
          type: 'DELETE',
          url: "http://localhost:3000/products",
          body: {
            name: 'String', 
            price: 'Number '
          }
        }
      });
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({
        error: err
      });
    }); 

});



module.exports = router;