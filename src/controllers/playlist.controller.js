import mongoose, {isValidObjectId} from "mongoose"
import {PlayList} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    const playlist= await PlayList.create({
        name,
        description,
        videos:[],
        owner: req.user._id
    })
    if (!playlist) {
        throw new ApiError(400, "Failed to create playlist")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, "Playlist created successfully", playlist))
    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if(!userId){
        throw new ApiError(400,"incorrect userId")
    }
    const playlists=await PlayList.findOne({owner:userId})
    if(!playlists){
        throw new ApiError(400,"no playlist found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,playlists,"playlist found successfully")
    )
    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!playlistId){
        throw new ApiError(400,"playlistId required")
    }

    const playlist=await PlayList.findById(playlistId)
    if(!playlist){
        throw new ApiResponse(200,null,"Their is no playlist made by the user")
    }

    return res
    .status(200)
    .json(
        200,
        playlist,
        "playlist fetched successfully"
    )
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
     if(!playlistId||!videoId){
        throw new ApiError(400,"playlistId and VideoId both are required")
    }
    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"Video required to upload")
    }
    const playlist=await PlayList.findByIdAndUpdate(playlistId,{
        $set:{
            videos:[{video}]
        }
    })

    if(!playlist){
        throw new ApiError(400,"playlist not found")
    }

    return res
    .status(200)
    .json(200,"video add successfully")
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    const playlist=await PlayList.findById(playlistId)

    if(!playlist){
        throw new ApiError(500,"playlist not found")
    }
    const videoObjectId=new mongoose.ObjectId(videoId);
    const updatedPlaylist=await PlayList.findByIdAndUpdate(playlistId,
        {
            $pull:{
                videos:videoObjectId
            }
        },
        {new:true}
    )

    if(!updatedPlaylist){
        throw new ApiError(200,"failed to remove from the playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,updatePlaylist,"video removed from the playlist successfully")
    )

        // TODO: remove video from playlist
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    await PlayList.findByIdAndDelete(playlistId)

    return res
    .status(200)
    .json(
        new ApiResponse(200,"playlist deleted successfully")
    )
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body

    const updatedPlaylist=await PlayList.findByIdAndUpdate(playlistId,{
        name,
        description
    })
    if(!updatedPlaylist){
        throw new ApiError(400,"playlist updation failed")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Playlist updated successfully")
    )
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}