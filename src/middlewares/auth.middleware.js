import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJwt = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers?.authorization?.replace('Bearer ', '');
    
        if (!token) {
            throw new ApiError(401, 'Access token is required');
        }
    
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decoded?._id).select('-password -refreshToken')
        if (!user) {
            throw new ApiError(401, 'Invalid Access Token');
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, 'Invalid Access Token');
    }
})

// Optional auth middleware - doesn't throw error if no token
export const optionalAuth = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers?.authorization?.replace('Bearer ', '');
        
        if (token) {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decoded?._id).select('-password -refreshToken')
            req.user = user;
        }
    } catch (error) {
        // Ignore auth errors in optional auth
    }
    next();
})