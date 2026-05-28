# StreamSpeare

 A lightweight video-sharing backend (Express + MongoDB) — StreamSpeare.

 ## Overview

 StreamSpeare is an Express.js backend for a video-sharing platform. It provides RESTful API endpoints and server-rendered pages (EJS) for core features such as user authentication, video upload (Cloudinary), comments, likes, playlists, subscriptions, and simple dashboard routes.

 ## Features

 - **Users**: signup, login, profile management
 - **Videos**: upload, list, view, delete (uses Cloudinary for storage)
 - **Comments**: create and list comments on videos
 - **Likes**: like/unlike videos and render liked videos page
 - **Playlists**: create and manage playlists
 - **Subscriptions**: follow/unfollow channels
 - **Dashboard & Pages**: EJS-rendered pages for home, channel, watch, upload and more

 ## Tech Stack

 - Node.js (ES Modules)
 - Express 5
 - MongoDB + Mongoose
 - EJS for server-side views
 - Cloudinary for media upload
 - Multer for multipart/form-data handling

 ## Getting Started

 Prerequisites:

 - Node.js (v18+ recommended)
 - A running MongoDB instance (local or Atlas)
 - Cloudinary account (optional, for uploads)

 Install dependencies:

 ```bash
 npm install
 ```

 Environment:

 Create a `.env` file at the project root (or set env vars in your environment). Example variables used by the app:

 ```
 PORT=3000
 MONGODB_URL=mongodb://localhost:27017
 JWT_SECRET=your_jwt_secret
 CORS_ORIGIN=http://localhost:3000
 CLOUDINARY_CLOUD_NAME=your_cloud_name
 CLOUDINARY_API_KEY=your_api_key
 CLOUDINARY_API_SECRET=your_api_secret
 ```

 Run in development (uses nodemon):

 ```bash
 npm run dev
 ```

 The dev script runs `src/index.js` (see [package.json](package.json#L1)).

 ## Project Structure

 - **src/** - application source
   - **app.js** - Express application and route registration ([src/app.js](src/app.js#L1))
   - **index.js** - entrypoint that connects DB and starts the server ([src/index.js](src/index.js#L1))
   - **db/** - MongoDB connection ([src/db/index.js](src/db/index.js#L1))
   - **controllers/** - route handlers
   - **models/** - Mongoose models
   - **routes/** - Express routes
   - **utils/** - helpers (e.g., Cloudinary integration: [src/utils/cloudinary.js](src/utils/cloudinary.js#L1))
   - **views/** - EJS templates

 ## Notable Implementation Details

 - Database name constant is defined in [src/constants.js](src/constants.js#L1) (currently set to `youtube`).
 - Cloudinary uploads are handled in [src/utils/cloudinary.js](src/utils/cloudinary.js#L1).
 - The app serves server-rendered pages and exposes API routes under `/api/v1/...` (routes are registered inside `src/app.js`).

 ## API Endpoints (high level)

 - `GET /api/v1/healthcheck` - health endpoint
 - `POST /api/v1/users` - user registration (example)
 - `POST /api/v1/tweets`, `POST /api/v1/videos` - content endpoints
 - `GET /api/v1/likes`, `/api/v1/comments`, `/api/v1/playlist`, `/api/v1/subscriptions` - related resources

 Refer to the `src/routes/` folder to inspect concrete route definitions.

 ## Development Notes

 - The project uses ES modules (`type: "module"` in [package.json](package.json#L1)).
 - Dev script uses `nodemon -r dotenv/config --experimental-json-modules src/index.js`.

 ## Contributing

 Contributions are welcome. Suggested workflow:

 1. Fork
 2. Create a feature branch
 3. Submit a PR with tests and description

 ## License

 This project is provided as-is. Check `package.json` for author metadata (author: Yash Shinde).

 ---

 If you'd like, I can also:

 - Extract a more detailed API reference by reading each route file, or
 - Add a sample `.env.example` and Postman collection.
