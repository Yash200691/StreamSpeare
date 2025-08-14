import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const userId=req.user._id;

    if(!channelId){
        throw new ApiError(400,"channel does not exist with this id");
    }
    const isSubscribe=await Subscription.findOne({channel:channelId,subscriber:userId});

    if(isSubscribe){
        await Subscription.deleteOne({channel:channelId,subscriber:userId});

        return res
        .status(200)
        .json(
            new ApiResponse(200,{},"Channel unsubscribed successfully")
        )
    }

    const subscribe=await Subscription.create({channel:channelId,subscriber:userId});

    return res
    .status(200)
    .json(
        new ApiResponse(200,subscribe,"channel subscribed successfully")
    )

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!channelId){
        throw new ApiError(400,"cannot find the channel")
    }
    const subscribers=await Subscription.find({channel:channelId}).populate("subscriber","username fullName avatar email")

    return res
    .status(200)
    .json(
        new ApiResponse(200,subscribers,"channel subscribers fetched successfully")
    )

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    // We are getting the subscriberId from the JWT token, not from the URL params.
    const subscriberId = req.user._id; 

    if(!subscriberId){
        throw new ApiError(400,"invalid subscriber Id")
    }
    const channels=await Subscription.find({subscriber:subscriberId}).populate("channel","username fullName avatar email")
    return res
    .status(200)
    .json(
        new ApiResponse(200,channels,"subscribed channels fetched successfully")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}