import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const channelId=req.user._id
    if(!channelId){
        throw new ApiError(400,"invalid channel Id")
    }

    const channelStats=await Video.aggregate([
        {
            $match:new mongoose.Types.ObjectId(channelId)
        },
        {
            $lookup:{
                from:'likes',
                localField:'_id',
                foreignField:'video',
                as:"likes"
            }
        },
        {
            $group:{
                _id:null,
                totalVideos:{$sum:1},
                totalLikes:{$sum:{$size:'likes'}},
                totalViews:{$sum:'views'}
            }
        },

    ])

    const subscribersStats=await Subscription.aggregate([
        {
            $match:{
                channel:new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group:{
                _id:null,
                    totalSubscribers:{$sum:1}
            }
        }
    ])

    const stats={
        totalVideos:channelStats[0]?.totalVideos,
        totalLikes:channelStats[0]?.totalLikes,
        totalViews:channelStats[0]?.totalViews,
        totalSubscribers:subscribersStats[0]?.totalSubscribers
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,stats,"channel stats fetched successfully")
    )

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const channelId=req.user._id

    if(!channelId){
        throw new ApiError(400,"channel not found with this name")
    }
    const {page=1,limit=10,sortBy="createdAt",sortType='desc',search=''}=req.params

    const matchConditions={
        owner:new mongoose.Types.ObjectId(channelId)
    }
    if(search?.trim()){
        matchConditions.$or=[
            {title:{$regex:search.trim(),$options:"i"}},
            {description:{$regex:search.trim(),$options:'i'}}
        ]
    }  
    const sortOptions={}
    sortOptions[sortBy]=sortType=="desc"?-1:1
    const skip = (parseInt(page) - 1) * parseInt(limit)  

    const videos=await Video.aggregate([
        {
            $match:matchConditions
        },
        {
            $lookup:{
                from:'likes',
                localField:'_id',
                foreignField:'video',
                as:'likes'
            }
        },
        {
            $lookup:{
                from:"comments",
                localField:'_id',
                foreignField:'video',
                as:'comments'
            }
        },
        {
            $addFields:{
                likesCount:{$size:"$likes"},
                commentsCount:{$size:'comments'}
            }
        },
        {
            $project:{
                likes:0,
                comments:0
            }
        },
       {
        $sort:sortOptions
       },
        {
            $facet: {
            videos: [
                 { $skip: skip },
                     { $limit: parseInt(limit) }
             ],
             totalCount: [
         { $count: "count" }
              ]
            }
          }
    ])
      // Extract results
        const channelVideos = videos[0]?.videos || [];
        const totalVideos = videos[0]?.totalCount[0]?.count || 0;

        // Calculate pagination info
        const totalPages = Math.ceil(totalVideos / parseInt(limit));
        const hasNextPage = parseInt(page) < totalPages;
        const hasPrevPage = parseInt(page) > 1;

        const paginationInfo = {
            currentPage: parseInt(page),
            totalPages,
            totalVideos,
            hasNextPage,
            hasPrevPage,
            limit: parseInt(limit)
        };

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        videos: channelVideos,
                        pagination: paginationInfo
                    },
                    "Channel videos fetched successfully"
                )
            );
})

const getPublicChannelVideos = asyncHandler(async (req, res) => {
    // Get videos for ANY channel by channelId (public view)
    
    try {
        const { channelId } = req.params;

        if (!channelId) {
            throw new ApiError(400, "Channel ID is required");
        }

        if (!mongoose.Types.ObjectId.isValid(channelId)) {
            throw new ApiError(400, "Invalid channel ID format");
        }

        const channelExists = await User.findById(channelId);
        if (!channelExists) {
            throw new ApiError(404, "Channel not found");
        }

        const { 
            page = 1, 
            limit = 10, 
            sortBy = "createdAt", 
            sortType = "desc",
            search = ""
        } = req.query;

        const matchConditions = {
            owner: new mongoose.Types.ObjectId(channelId),
            isPublished: true // Only published videos for public view
        };

        if (search?.trim()) {
            matchConditions.$or = [
                { title: { $regex: search.trim(), $options: "i" } },
                { description: { $regex: search.trim(), $options: "i" } }
            ];
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortType === "desc" ? -1 : 1;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const videos = await Video.aggregate([
            { $match: matchConditions },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "video",
                    as: "likes"
                }
            },
            {
                $lookup: {
                    from: "comments", 
                    localField: "_id",
                    foreignField: "video",
                    as: "comments"
                }
            },
            {
                $addFields: {
                    likesCount: { $size: "$likes" },
                    commentsCount: { $size: "$comments" },
                    // Check if current user (if logged in) has liked this video
                    isLikedByCurrentUser: {
                        $in: [
                            new mongoose.Types.ObjectId(req.user?._id || null),
                            "$likes.likedBy"
                        ]
                    }
                }
            },
            {
                $project: {
                    title: 1,
                    description: 1,
                    thumbnail: 1,
                    videoFile: 1,
                    duration: 1,
                    views: 1,
                    createdAt: 1,
                    likesCount: 1,
                    commentsCount: 1,
                    isLikedByCurrentUser: 1,
                    owner: 1
                }
            },
            { $sort: sortOptions },
            {
                $facet: {
                    videos: [
                        { $skip: skip },
                        { $limit: parseInt(limit) }
                    ],
                    totalCount: [
                        { $count: "count" }
                    ]
                }
            }
        ]);

        const channelVideos = videos[0]?.videos || [];
        const totalVideos = videos[0]?.totalCount[0]?.count || 0;
        const totalPages = Math.ceil(totalVideos / parseInt(limit));

        const paginationInfo = {
            currentPage: parseInt(page),
            totalPages,
            totalVideos,
            hasNextPage: parseInt(page) < totalPages,
            hasPrevPage: parseInt(page) > 1,
            limit: parseInt(limit)
        };

        // Get channel info
        const channelInfo = await User.findById(channelId).select("username fullName avatar coverImage");

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        channelInfo,
                        videos: channelVideos,
                        pagination: paginationInfo
                    },
                    `${channelInfo?.username || 'Channel'} videos fetched successfully`
                )
            );

    } catch (error) {
        throw new ApiError(500, error?.message || "Error while fetching public channel videos");
    }
});

export {
    getChannelStats, 
    getChannelVideos,
    getPublicChannelVideos
    }