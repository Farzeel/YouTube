import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { fileUploadOnCloudinary } from "../utils/cloudinary.js"
import fs from "fs"

const registerUser = asyncHandler(async (req,res)=>{
   
    const {userName,email,password,fullName } = req.body

    if([userName,email,password,fullName].some(field =>field?.trim()==="")){
       throw new ApiError(400,"All fields are Required")
    }

    const existedUser = await User.findOne({$or:[{email},{userName}]})

    if (existedUser) {
    

        if ( Array.isArray(req.files.avatar)) {
            fs.unlinkSync(req.files.avatar[0].path);
        }
        if ( Array.isArray(req.files.coverImage) ) {
            fs.unlinkSync(req.files.coverImage[0].path);
        }
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

const generateAccessTokenAndRefreshToken  = async (userId)=>{

try {

    const user = await User.findById(user._id)

    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken

    await user.save()

    return {accessToken,refreshToken}

    
} catch (error) {
    throw new ApiError(500, "something went wrong while generating access and refreh Token")
}

}


const loginUser = asyncHandler(async (req,res)=>{

// get Details from user
// check for validation || filed should not be empty
// check username or email exists
// compare the password
// genertae access Token and referesh Token 
// send Cookie 

const {userName, email, password} = req.body

if (!userName || !email || !password) {
    throw new ApiError(400, "input field cannot be empty")
}

const userExist = await User.findOne({$or:[{userName},{email}]})

if (!userExist) {
    throw new ApiError(422, "Invalid Credentials")
}

const PasswordIsCorrect = await userExist.isPasswordCorrect(password)

if (!PasswordIsCorrect) {
    throw new ApiError(422 , "Invalid Credentials. Please try again")
}

const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(userExist._id)

const loggedInUser = await User.findById(userExist._id).select("-password -refreshToken")

const option = {
    htppOnly:true,
    secure:true
}

return res.status(200)
.cookie("accessToken",accessToken, option)
.cookie("refreshtoken", refreshToken, option)
.json(new ApiResponse(200, loggedInUser, "user loggedIn Successfully "))


})

const logoutUser = asyncHandler(async (req, res)=>{
await User.findByIdAndUpdate(
    req.user._id , 
    {$set:{refreshToken: undefined}}
)

const option = {
    htppOnly:true,
    secure:true
}

return res.status(200)
.clearCookie("accessToken",option)
.clearCookie("refreshToken",option)
.json(200, {}, "User LoggedOut ")
})

export{registerUser, loginUser , logoutUser}