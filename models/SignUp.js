const mongoose=require('mongoose');
const AuthSchema=new mongoose.Schema({

        name:String,
        email: String,
        password: String
    
} ,{timestamps:true} )


const SignUP=mongoose.model('AugthData',AuthSchema)
module.exports=SignUP