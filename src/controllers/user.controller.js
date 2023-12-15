import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { fileUploadOnCloudinary } from "../utils/cloudinary.js"

const registerUser = asyncHandler(async (req,res)=>{
    // Take Details from user
    // Validate the details
    // check user already exists or not via username or email
    // check for images , check for avatar
    // upload images on cloudinary , check for avatar again
    // create user object and save on database
    // remove password and refresh token field from response
    // check for user creation
    // send response to user
    



    const {userName,email,password,fullName } = req.body

    if([userName,email,password,fullName].some(field =>field?.trim()==="")){
       throw new ApiError(400,"All fields are Required")
    }

    const existedUser = await User.findOne({$or:[{email},{userName}]})

    if (existedUser) {
        throw new ApiError(409,"user with this email or username already exist. please try with other email or username")
    }
    
    const avatarLocalPath = req.files?.avatar[0]?.path
    let coverImageLocalPath ;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0)
    {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar is Required")
    }

    const avatar = await fileUploadOnCloudinary(avatarLocalPath)
    const coverImage = await fileUploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400 , "Avatar is required")
    }

    const user  = await User.create({
        userName,
        fullName,
        email,
        password,
        avatar:avatar.url,
        coverImage:coverImage?.url || ""

    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500,"SomeThing went wrong while regestring the user please try again after few seconds")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"user Registered Successfully")
    )
   
})

export{registerUser}