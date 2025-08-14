import {Router} from 'express'

import {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
} from '../controllers/like.controller.js'
import { verifyJwt } from '../middlewares/auth.middleware.js'

const router=Router()

router.use(verifyJwt)

router.route('/toggle/v/:videoId').post(toggleVideoLike)
router.post('/toggle/c/:commentId', toggleCommentLike) 
router.post('/toggle/t/:tweetId', toggleTweetLike)
router.route('/videos').get(getLikedVideos)

export default router