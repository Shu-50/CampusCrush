const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    college: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    photos: [{
        url: String,
        publicId: String,
        isMain: { type: Boolean, default: false }
    }],
    bio: {
        type: String,
        default: '',
        maxlength: 500
    },
    age: {
        type: Number,
        min: 18,
        max: 30
    },
    year: {
        type: String,
        enum: ['1st', '2nd', '3rd', 'Final'],
        default: null
    },
    branch: {
        type: String,
        enum: [
            'CSE',      // Computer Science Engineering
            'IT',       // Information Technology
            'SE',       // Software Engineering
            'EE',       // Electrical Engineering
            'ECE',      // Electronics & Communication Engineering
            'ENTC',     // Electronics & Telecommunication
            'ME',       // Mechanical Engineering
            'CE',       // Civil Engineering
            'CHE',      // Chemical Engineering
            'BME',      // Biomedical Engineering
            'AE',       // Aerospace Engineering
            'AIDS',     // Artificial Intelligence & Data Science
            'ML',       // Machine Learning
            'AI',       // Artificial Intelligence
            'DS',       // Data Science
            'CYBER',    // Cyber Security
            'IOT',      // Internet of Things
            'ROBOTICS', // Robotics Engineering
            'AUTO',     // Automobile Engineering
            'PROD',     // Production Engineering
            'TEXTILE',  // Textile Engineering
            'FOOD',     // Food Technology
            'BIOTECH',  // Biotechnology
            'MBA',      // Master of Business Administration
            'BBA',      // Bachelor of Business Administration
            'MKTG',     // Marketing
            'FIN',      // Finance
            'ACC',      // Accounting
            'ECON',     // Economics
            'PSYCH',    // Psychology
            'BIO',      // Biology
            'CHEM',     // Chemistry
            'PHY',      // Physics
            'MATH',     // Mathematics
            'STAT',     // Statistics
            'ENG',      // English
            'HIST',     // History
            'POLSCI',   // Political Science
            'SOC',      // Sociology
            'PHIL',     // Philosophy
            'ART',      // Art & Design
            'MUSIC',    // Music
            'THEATER',  // Theater
            'COMM',     // Communications
            'JOURN',    // Journalism
            'MED',      // Medicine
            'MBBS',     // Bachelor of Medicine
            'NURS',     // Nursing
            'PHARMC',   // Pharmacy
            'LAW',      // Law
            'EDU',      // Education
            'ARCH',     // Architecture
            'OTHER'     // Other
        ],
        default: null
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Non-binary', 'Other'],
        default: null
    },
    interests: [{
        type: String,
        maxlength: 50
    }],
    lookingFor: {
        type: String,
        enum: ['Relationship', 'Friendship', 'Casual', 'Not sure'],
        default: 'Not sure'
    }
}, {
    timestamps: true
});

// Index for faster queries
userSchema.index({ email: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);