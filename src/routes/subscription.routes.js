import { Router } from 'express';
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from '../controllers/subscription.controller.js';

import { verifyJwt } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(verifyJwt);

// Route to get a list of a user's subscriptions.
// This route now correctly handles the GET request to /api/v1/subscriptions.
router.route('/').get(getSubscribedChannels);

// A single route for toggling a subscription using both POST and DELETE methods.
router.route('/c/:channelId').post(toggleSubscription).delete(toggleSubscription);

// Route to get a channel's subscriber list.
// The URL path should be changed to use `channelId` to avoid confusion.
router.route('/u/:channelId').get(getUserChannelSubscribers);


export default router;