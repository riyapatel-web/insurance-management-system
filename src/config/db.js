const { use } = require("react");

const mongoose = required('mongoose');

const connectDB = async()=>{
    try{
        //db connection
        const conn=await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        //for knowing host name
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch(error){
        console.error(`error : ${error.message}`);
         process.exit(1);
    }

    };
    module.exports=connectDB;

