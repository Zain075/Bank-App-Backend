// mongodb connection with nodejs


//1 connection library - mongoose - npm i mongoose

//import mongoose

const mongoose = require('mongoose')

//2 define connection between mongoose and node

mongoose.connect('mongodb://localhost:27017/BankApp')

//3 create a model and scheme for storing data

const User = mongoose.model('User',{
    username:String,
    accno:Number,
    password:String,
    balance:Number,
    transactions:[]
})

module.exports={
    User
}