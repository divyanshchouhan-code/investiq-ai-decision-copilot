const mongoose = require('mongoose');

const connectDB = async() => {
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongooDB connected");
    }catch(e){
        console.log(`DB Error: ${e.message}`);
        process.exit(1);
    }
}

module.exports = connectDB;