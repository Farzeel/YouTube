import { verify } from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/user.model";

const VerifyJWT = asyncHandler(async (req, res, next)=>{

    const token = req.cookie?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
        throw new ApiError(401 , "UnAuthorized Request")
    }

    const decodeToken  = verify(token,ACCESS_TOKEN_SECRET)

    const user = await User.findById(decodeToken._id).select("-password -refreshToken")

    if (!user) {
        throw new ApiError(401,"Invalid AccessToken")
    }

    req.user = user
    next()


})

export {VerifyJWT}