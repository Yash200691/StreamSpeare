import multer from 'multer'
import path from 'path'
import fs from 'fs'

// Ensure temp directory exists
const tempDir = './public/temp'
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
        // Generate unique filename to avoid conflicts
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const extension = path.extname(file.originalname)
        const baseName = path.basename(file.originalname, extension)
        cb(null, baseName + '-' + uniqueSuffix + extension)
    }
})

// Add file filter for security
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'videoFile') {
        // Accept video files
        if (file.mimetype.startsWith('video/')) {
            cb(null, true)
        } else {
            cb(new Error('Only video files are allowed for videoFile field'), false)
        }
    } else if (file.fieldname === 'thumbnail') {
        // Accept image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true)
        } else {
            cb(new Error('Only image files are allowed for thumbnail field'), false)
        }
    } else {
        cb(new Error('Unexpected field name'), false)
    }
}

export const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB limit
        files: 2 // Maximum 2 files
    }
})