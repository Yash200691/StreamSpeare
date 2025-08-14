import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    const pageNumber=parseInt(page)
    const limitNumber=parseInt(limit)

    const matchStage={};
    matchStage.isPublished=true;
    if(query){
        matchStage.$or=[
            {title:{$regex:query,$options:'i'}},
            {description:{$regex:query,$options:'i'}}
        ]
    }
    if(userId){
        if(!mongoose.Types.ObjectId.isValid(userId)){
            throw new ApiError(400,"invalid userId format")
        }
        matchStage.owner=new mongoose.ObjectId(userId)
    }
    let sortStage={created:-1}

    if(sortBy){
        const sortOrder=(sortType==='asc'||sortType==='1'?1:-1)
        sortStage={}
        sortStage[sortBy]=sortOrder
    }

    const videos=await Video.aggregate([
        {
            $match:matchStage
        },
        {
            $lookup:{
                from:'users',
                localField:'owner',
                foreignField:'_id',
                as:'owner',
                pipeline:[
                   {
                    $project:{
                        username:1,
                        fullName:1,
                        avatar:1,
                        _id:1
                    }
                   }
                ]
            }
        },
        {
            $unwind:'$owner'
        },
        {
            $sort:sortStage
        },
         // Stage 5: Skip documents for pagination
        {
            $skip: (pageNumber - 1) * limitNumber
        },
        {
            $limit:limitNumber
        },
        {
            
                 $project: {
                _id: 1,
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                createdAt: 1,
                updatedAt: 1,
                owner: { // Reshape owner details for cleaner output
                    _id: "$ownerDetails._id",
                    username: "$ownerDetails.username",
                    fullName: "$ownerDetails.fullName",
                    avatar: "$ownerDetails.avatar"
                }
            
            }
        }
    ])
        if (!videos || videos.length === 0) {
        return res
            .status(200)
            .json(new ApiResponse(200, [], "No videos found matching the criteria."));
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,videos,"videos fetched successfully")
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    
    // Get the authenticated user from JWT middleware
    const userId = req.user?._id
    
    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    // Debug logging
    console.log("=== DEBUG INFO ===");
    console.log("req.files:", req.files);
    console.log("req.body:", req.body);
    console.log("userId:", userId);
    console.log("================");

    // Get file paths - use correct field names
    const localVideoPath = req.files?.videoFile?.[0]?.path
    const localthumbnailPath = req.files?.thumbnail?.[0]?.path
    
    // Check if files are missing (fixed logic)
    if (!localVideoPath) {
        throw new ApiError(400, 'Video file is required')
    }
    if (!localthumbnailPath) {
        throw new ApiError(400, 'Thumbnail file is required')
    }

    // Validate required fields
    if (!title || title.trim() === '') {
        throw new ApiError(400, 'Title is required')
    }

    try {
        // Upload files to Cloudinary
        const videoFile = await uploadCloudinary(localVideoPath)
        const thumbnail = await uploadCloudinary(localthumbnailPath)

        if (!videoFile) {
            throw new ApiError(500, 'Failed to upload video file')
        }
        if (!thumbnail) {
            throw new ApiError(500, 'Failed to upload thumbnail')
        }

        // Get user details
        const user = await User.findById(userId)
        if (!user) {
            throw new ApiError(404, 'User not found')
        }

        // Create video document
        const video = await Video.create({
            videoFile: videoFile.url,
            thumbnail: thumbnail.url,
            title: title.trim(),
            description: description?.trim() || '',
            duration: videoFile.duration || 0,
            owner: userId, // Store user ID, not username
            isPublished: true
        })

        if (!video) {
            throw new ApiError(500, "Failed to create video")
        }

        return res
            .status(201)
            .json(
                new ApiResponse(201, video, "Video uploaded successfully")
            )
    } catch (error) {
        console.error("Upload error:", error)
        throw new ApiError(500, error.message || "Failed to upload video")
    }
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video=await Video.findById(videoId)

    if(!video){
        throw new ApiError(400,"video with this id does not exist")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"video fetched successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const {title,description}=req.body
    const localthumbnailPath=req.file?.path
    if(!localthumbnailPath){
        throw new ApiError(401,"thumbnail path not found")
    }
    const thumbnail=await uploadCloudinary(localthumbnailPath) // Fixed function name
    const updatedVideo=await Video.findByIdAndUpdate(videoId,{
        $set:{
            title:title,
            description:description,
            thumbnail:thumbnail.url
        }
    },{new:true})

       if(!updatedVideo){
            throw new ApiError(404,"failed to update video");
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200,updatedVideo,"you have successfully updated the video")
        )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    await Video.findByIdAndDelete(videoId);

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
      if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video ID format");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to toggle this video's status");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !video.isPublished
            }
        },
        { new: true } 
    );

    if (!updatedVideo) {
        throw new ApiError(500, "Failed to toggle video publish status");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedVideo,
                "Video publish status toggled successfully"
            )
        );
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}