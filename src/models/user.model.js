import mongoose , {Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema  = new Schema({
userName:{
    type: String,
    required:true,
    lowercase:true,
    index : true,
    unique:true
    

},
email:{
    type: String,
    required:true,
    lowercase:true,
    unique:true
},
fullName:{
    type: String,
    required:true,
    index:true
},
avatar:{
    type:String,
    required:true
},
coverImage:{
    type:String,

},
refreshToken:{
    type:String
},
password:{
    type:String,
    required:[true, "password is required"]
},
watchHistory:[
    {
    type:Schema.Types.ObjectId,
    ref:"Video"
    }
],

},

{
    timestamps:true
}
)

userSchema.pre("save",async function(next){
if (!this.isModified("password")) {
    return next()
}
this.password =  bcrypt.hash(this.password, 10)
next()
})

userSchema.methods.isPasswordCorrect = async function(password){
   return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id : this._id,
            email:this.email,
            fullName:this.fullName,
            userName:this.userName
        },
        process.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id : this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}



export const User = mongoose.model("User",userSchema)