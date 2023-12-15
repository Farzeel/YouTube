import  jwt  from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

const VerifyJWT = asyncHandler(async (req, res, next)=>{

    const token = req.cookie?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
        throw new ApiError(401 , "UnAuthorized Request")
    }

    const decodeToken  = jwt.verify(token,ACCESS_TOKEN_SECRET)

    const user = await User.findById(decodeToken._id).select("-password -refreshToken")

    if (!user) {
        throw new ApiError(401,"Invalid AccessToken")
    }

    req.user = user
    next()


})

export {VerifyJWT}