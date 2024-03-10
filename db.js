//mongoose is a package use to connect wih mongodb
const mongoose=require('mongoose');

const mongoURL='mongodb://localhost:27017/iNotebook' //url string to connect to db

const connectToMongo=()=>{
  mongoose.connect(mongoURL)
}


module.exports=connectToMongo;
