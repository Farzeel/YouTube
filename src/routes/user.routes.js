import {Router} from "express"
import{loginUser, registerUser} from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { VerifyJWT } from "../middlewares/auth.middleware.js"

const route = Router()

route.route("/register").post(upload.fields([

{
    name:"avatar", 
    maxCount:1
},

{
    name:"coverImage" , 
    maxCount:1
}

]), registerUser)

route.route("/login",).post(loginUser)

// SECURED ROUTES
route.route("/logout",).post(VerifyJWT ,  loginUser)


export default route