import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {userId}=req.params
    const {comment}=req.body

    if(!comment||userId){
        throw new ApiError(400,"comment is not passed or user is not logged in")
    }
    const tweet=await Tweet.create({
        comment:comment,
        owner:userId
    })
    if(!tweet){
        throw new ApiError(400,"failed to send a tweet")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,tweet,"tweet has been uploaded successfully")
    )

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId}=req.params
    if(!userId){
        throw new ApiError(400,"user is not loggedin")
    }
    const tweets=await Tweet.findOne({
        owner:userId
    })
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,tweets,"User tweets fetched successfully")
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId}=req.params
    const {content}=req.body

    if(!content){
        throw new ApiError(400,"content needed")
    }
    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID format");
    }
    const updateTweet=await Tweet.findOneAndUpdate({
        _id:tweetId,
        owner:req.user._id
    },
{
    $set:{
        content:content
    }
},{new:true})
if(!updateTweet){
    throw new ApiError(500,"failed to update the tweet")
}

return res
.status(200)
.json(
    new ApiResponse(200,updateTweet,"Tweet updated successfully")
)

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId}=req.params
    if(!tweetId){
        throw new ApiError(400,"failed to fetch tweetId")
    }
    const tweet=await Tweet.findOneAndDelete({
        _id:tweetId,
        owner:req.user._id
    })
    if(tweet){
        throw new ApiError(500,"failed to delete tweet")
    }

    return req
    .status(200)
    .json(
        new ApiResponse(200,null,"tweet deleted successfully")
    )

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}