import mongoose, {isValidObjectId} from "mongoose"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Like } from "../models/like.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {userId}=req.user._id;
    //TODO: toggle like on video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    const existingLike=await Like.findOne({videoId:videoId,likedBy:userId});
    if(existingLike){
        await Like.findOneAndDelete({videoId:videoId,likedBy:userId});
        return res
        .status(200)
        .json(
            new ApiResponse(200,{},"video disliked successfully")
        )
    }
    const like=await Like.create({videoId:videoId,likedBy:userId});

    return res
    .status(200)
    .json(
        new ApiResponse(200,like,"video liked successfully")
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const userId=req.user._id;
    //TODO: toggle like on comment

    const existingLike=await Like.findOne({comment:commentId,likedBy:userId});
    if(existingLike){
        await Like.findOneAndDelete({comment:commentId,likedBy:userId});
        return res
        .status(200)
        .json(
            new ApiResponse(200,{},"Comment DisLiked Successfully")
        )
    }
    const like=await Like.create({comment:commentId,likedBy:userId});

    return res
    .status(200)
    .json(
        new ApiResponse(200,like,"Comment Liked Successfully")
    )

})

const toggleTweetLike = asyncHandler(async (req, res) => {
const {tweetId} = req.params
    const userId=req.user._id;
    //TODO: toggle like on comment

    const existingLike=await Like.findOne({tweet:tweetId,likedBy:userId});
    if(existingLike){
        await Like.findOneAndDelete({tweet:tweetId,likedBy:userId});
        return res
        .status(200)
        .json(
            new ApiResponse(200,{},"Tweet DisLiked Successfully")
        )
    }
    const like=await Like.create({tweet:tweetId,likedBy:userId});

    return res
    .status(200)
    .json(
        new ApiResponse(200,like,"Tweet Liked Successfully")
    )
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId=req.user._id;
    if(!userId){
        throw new ApiError(400,"User doesn't exist");
    }

    const likedVideos=await Like.aggregate([
        {
            $match:{
                likedBy:new mongoose.Types.ObjectId(userId),
                video:{$exists:true}
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"videoDetails",
            }
        },
        {
            $unwind:"$videoDetails"
        },
        {
            $lookup:{
                from:"users",
                localField:"videoDetails.owner",
                foreignField:"_id",
                as:"ownerDetails"
            }
        },
        {
            $unwind:"$ownerDetails"
        },
        {
            $project:{
                _id: "$videoDetails._id",
                title: "$videoDetails.title",
                thumbnail: "$videoDetails.thumbnail",
                duration: "$videoDetails.duration",
                views: "$videoDetails.views",
                createdAt: "$videoDetails.createdAt",
                ownerDetails: {
                    _id: "$ownerDetails._id",
                    username: "$ownerDetails.username",
                    avatar: "$ownerDetails.avatar"
                }
            }
        }
    ])
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}