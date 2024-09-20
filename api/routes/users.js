const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const User = require('../models/user');

router.post('/signup', (req, res, next) => { 
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({
         message: 'Mail exists'
        });
      } else {
        //the idea is we add a random string to a password and after that we will hash it
        bcrypt.hash(req.body.password, 10, (err, hash ) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
      } else {
        const user = User({
          _id: new mongoose.Types.ObjectId(),
          email: req.body.email,
          password: hash
        });
        user
        .save()
        .then(result => {
            console.log(result)
            res.status(201).json({
              message: 'User created'
            });
          })
          .catch(err => {
            console.log(err);
            res.status(500).json({
              error: err,
            })
          });
        }
      });
     }
  })
})

router.post('/login', (req, res, next) => {
  User.find({ email: req.body.email })
  .exec()
  //users will be an array. if user < 1 -> no such user, for security we send just error
  .then(user => {
    if(user.length < 1){
      return res.status(401).json({
        message: 'Auth failed'
      });
    }
    bcrypt.compare(req.body.password, user[0].password, (err, result) => {
      if(err){
        return res.status(401).json({
          message: 'Auth failed'
        });
      }
      if (result) {
        const token = jwt.sign(
          {
            email: user[0].email,
            userId: user[0]._id
          }, 
            process.env.JWT_KEY,
          {
            expiresIn: "1h" 
          },
        );
        return res.status(200).json({
          message: 'Auth successful',
          token: token 
        });
      }
      res.status(401).json({
        message: 'Auth failed'
      })
    })
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      message: err,
    })
  })

})




router.delete('/:userId', (req, res, next) => {
  const id = req.params.userId;
  User.deleteOne({_id: id })
    .exec()
    .then(result => 
      res.status(200).json({
        message: 'User deleted',
        request: {
          type: 'DELETE',
          url: 'http://localhost:3000/users',
          body: { email: 'String', password: 'String'}
        }
      })
    )
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error:err
      });
    });
})




module.exports = router;