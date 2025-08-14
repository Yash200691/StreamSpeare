import { Router } from 'express'
import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
} from '../controllers/video.controller.js'
import { verifyJwt } from '../middlewares/auth.middleware.js'
import { upload } from '../middlewares/multer.middleware.js'

const router = Router()

// Public route for getting all videos (no auth required for viewing)
router.route('/').get(getAllVideos)

// Protected routes
router.use(verifyJwt)

// POST route for uploading videos - this should handle /api/v1/videos
router.route('/').post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },
    ]),
    publishAVideo
)

router.route('/:videoId')
    .get(getVideoById)
    .patch(upload.single('thumbnail'), updateVideo)
    .delete(deleteVideo)

router.route('/toggle/publish/:videoId').patch(togglePublishStatus)

export default router