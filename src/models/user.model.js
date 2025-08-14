import mongoose from 'mongoose';
import bcrypt from 'bcrypt'; // Assuming you use bcrypt for password hashing
import jwt from 'jsonwebtoken'; // Assuming you use jwt for tokens

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        trim: true,
        index: true,
    },
    avatar: {
        type: String, // cloudinary url
        required: true,
    },
    coverImage: {
        type: String, // cloudinary url
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    refreshToken: {
        type: String,
    },
}, {
    // This is the crucial correction:
    // The 'collection' option should only contain the collection name itself.
    // Mongoose will automatically combine this with the database name from your connection string.
    collection: 'users', // Correct: Specifies the collection name as 'users'
    timestamps: true
});

// Pre-save hook to hash the password before saving a new user or updating the password
userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }
    // Hash the password with a salt round of 10
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to compare the provided password with the hashed password in the database
userSchema.methods.isPasswordCorrect = async function (password) {
    // Use bcrypt to compare the plain text password with the hashed password
    return await bcrypt.compare(password, this.password);
};

// Method to generate an Access Token for the user
userSchema.methods.generateAccessToken = function () {
    // Sign the JWT with user details, secret, and expiry
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET, // Secret key from environment variables
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY, // Expiry from environment variables
        }
    );
};

// Method to generate a Refresh Token for the user
userSchema.methods.generateRefreshToken = function () {
    // Sign the JWT with user ID, secret, and expiry
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET, // Secret key from environment variables
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY, // Expiry from environment variables
        }
    );
};

// Export the User model
export const User = mongoose.model('User', userSchema);
