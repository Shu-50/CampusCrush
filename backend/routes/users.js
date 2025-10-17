const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const User = require('../models/User');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Simple auth middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campus-crush-secret');
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        req.user = { userId: decoded.userId };
        req.currentUser = user;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    college: user.college,
                    photos: user.photos || [],
                    bio: user.bio || '',
                    age: user.age || null,
                    year: user.year || null,
                    branch: user.branch || null,
                    gender: user.gender || null,
                    interests: user.interests || [],
                    lookingFor: user.lookingFor || 'Not sure'
                }
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, bio, age, year, branch, gender, interests, lookingFor } = req.body;

        // Validate age
        if (age && (age < 18 || age > 30)) {
            return res.status(400).json({
                success: false,
                message: 'Age must be between 18 and 30'
            });
        }

        // Validate bio length
        if (bio && bio.length > 500) {
            return res.status(400).json({
                success: false,
                message: 'Bio must be less than 500 characters'
            });
        }

        // Validate interests
        if (interests && interests.length > 10) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 10 interests allowed'
            });
        }

        const updates = {};
        if (name !== undefined) updates.name = name.trim();
        if (bio !== undefined) updates.bio = bio.trim();
        if (age !== undefined) updates.age = age;
        if (year !== undefined) updates.year = year;
        if (branch !== undefined) updates.branch = branch;
        if (gender !== undefined) updates.gender = gender;
        if (interests !== undefined) updates.interests = interests;
        if (lookingFor !== undefined) updates.lookingFor = lookingFor;

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            updates,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    college: user.college,
                    photos: user.photos || [],
                    bio: user.bio || '',
                    age: user.age || null,
                    year: user.year || null,
                    branch: user.branch || null,
                    gender: user.gender || null,
                    interests: user.interests || [],
                    lookingFor: user.lookingFor || 'Not sure'
                }
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid data provided',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Upload photo with Cloudinary
router.post('/upload-photo', auth, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        const user = await User.findById(req.user.userId);

        if (!user.photos) {
            user.photos = [];
        }

        // Check photo limit
        if (user.photos.length >= 6) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 6 photos allowed'
            });
        }

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: 'image',
                    folder: 'campus-crush/users',
                    transformation: [
                        { width: 800, height: 800, crop: 'fill', quality: 'auto' }
                    ]
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            ).end(req.file.buffer);
        });

        // Add photo to user
        const isFirstPhoto = user.photos.length === 0;
        user.photos.push({
            url: result.secure_url,
            publicId: result.public_id,
            isMain: isFirstPhoto
        });

        await user.save();

        res.json({
            success: true,
            message: 'Photo uploaded successfully',
            data: {
                photo: {
                    url: result.secure_url,
                    publicId: result.public_id,
                    isMain: isFirstPhoto
                }
            }
        });
    } catch (error) {
        console.error('Upload photo error:', error);
        res.status(500).json({
            success: false,
            message: 'Photo upload failed: ' + error.message
        });
    }
});

// Delete photo
router.delete('/photo/:publicId', auth, async (req, res) => {
    try {
        const { publicId } = req.params;
        const user = await User.findById(req.user.userId);

        const photoIndex = user.photos.findIndex(photo => photo.publicId === publicId);
        if (photoIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Photo not found'
            });
        }

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(publicId);

        // Remove from user photos
        user.photos.splice(photoIndex, 1);

        // If deleted photo was main and there are other photos, make first photo main
        if (user.photos.length > 0 && !user.photos.some(photo => photo.isMain)) {
            user.photos[0].isMain = true;
        }

        await user.save();

        res.json({
            success: true,
            message: 'Photo deleted successfully'
        });
    } catch (error) {
        console.error('Delete photo error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Discover users (simplified)
router.get('/discover', auth, async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const currentUser = await User.findById(req.user.userId);

        // Get other users from the same college
        const users = await User.find({
            _id: { $ne: req.user.userId },
            college: currentUser.college
        })
            .select('name photos bio age year branch college')
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: {
                users: users.map(user => ({
                    id: user._id,
                    name: user.name,
                    photos: user.photos || [],
                    bio: user.bio || '',
                    age: user.age || null,
                    year: user.year || null,
                    branch: user.branch || null,
                    college: user.college
                }))
            }
        });
    } catch (error) {
        console.error('Discover users error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get profile options (for dropdowns)
router.get('/profile-options', (req, res) => {
    res.json({
        success: true,
        data: {
            years: ['1st', '2nd', '3rd', 'Final'],
            branches: [
                { code: 'CSE', name: 'Computer Science Engineering' },
                { code: 'IT', name: 'Information Technology' },
                { code: 'SE', name: 'Software Engineering' },
                { code: 'EE', name: 'Electrical Engineering' },
                { code: 'ECE', name: 'Electronics & Communication' },
                { code: 'ENTC', name: 'Electronics & Telecommunication' },
                { code: 'ME', name: 'Mechanical Engineering' },
                { code: 'CE', name: 'Civil Engineering' },
                { code: 'CHE', name: 'Chemical Engineering' },
                { code: 'BME', name: 'Biomedical Engineering' },
                { code: 'AE', name: 'Aerospace Engineering' },
                { code: 'AIDS', name: 'AI & Data Science' },
                { code: 'ML', name: 'Machine Learning' },
                { code: 'AI', name: 'Artificial Intelligence' },
                { code: 'DS', name: 'Data Science' },
                { code: 'CYBER', name: 'Cyber Security' },
                { code: 'IOT', name: 'Internet of Things' },
                { code: 'ROBOTICS', name: 'Robotics Engineering' },
                { code: 'AUTO', name: 'Automobile Engineering' },
                { code: 'PROD', name: 'Production Engineering' },
                { code: 'TEXTILE', name: 'Textile Engineering' },
                { code: 'FOOD', name: 'Food Technology' },
                { code: 'BIOTECH', name: 'Biotechnology' },
                { code: 'MBA', name: 'Master of Business Administration' },
                { code: 'BBA', name: 'Bachelor of Business Administration' },
                { code: 'MKTG', name: 'Marketing' },
                { code: 'FIN', name: 'Finance' },
                { code: 'ACC', name: 'Accounting' },
                { code: 'ECON', name: 'Economics' },
                { code: 'PSYCH', name: 'Psychology' },
                { code: 'BIO', name: 'Biology' },
                { code: 'CHEM', name: 'Chemistry' },
                { code: 'PHY', name: 'Physics' },
                { code: 'MATH', name: 'Mathematics' },
                { code: 'STAT', name: 'Statistics' },
                { code: 'ENG', name: 'English' },
                { code: 'HIST', name: 'History' },
                { code: 'POLSCI', name: 'Political Science' },
                { code: 'SOC', name: 'Sociology' },
                { code: 'PHIL', name: 'Philosophy' },
                { code: 'ART', name: 'Art & Design' },
                { code: 'MUSIC', name: 'Music' },
                { code: 'THEATER', name: 'Theater' },
                { code: 'COMM', name: 'Communications' },
                { code: 'JOURN', name: 'Journalism' },
                { code: 'MED', name: 'Medicine' },
                { code: 'MBBS', name: 'Bachelor of Medicine' },
                { code: 'NURS', name: 'Nursing' },
                { code: 'PHARMC', name: 'Pharmacy' },
                { code: 'LAW', name: 'Law' },
                { code: 'EDU', name: 'Education' },
                { code: 'ARCH', name: 'Architecture' },
                { code: 'OTHER', name: 'Other' }
            ],
            genders: ['Male', 'Female', 'Non-binary', 'Other'],
            lookingFor: ['Relationship', 'Friendship', 'Casual', 'Not sure'],
            ageRange: { min: 18, max: 30 }
        }
    });
});

module.exports = router;