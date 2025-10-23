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
        isMain: { type: Boolean, default: false },
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }], // Simple array of user IDs who liked this photo
        likeCount: {
            type: Number,
            default: 0
        }
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
        required: false,
        default: null,
        validate: {
            validator: function (value) {
                // Allow null, undefined, or empty string
                if (!value || value === '') return true;
                // Otherwise, must be one of the valid values
                return ['1st', '2nd', '3rd', 'Final'].includes(value);
            },
            message: 'Year must be one of: 1st, 2nd, 3rd, Final'
        }
    },
    branch: {
        type: String,
        required: false,
        trim: true,
        maxlength: [100, 'Branch name cannot exceed 100 characters']
    },
    gender: {
        type: String,
        required: false,
        default: null,
        validate: {
            validator: function (value) {
                // Allow null, undefined, or empty string
                if (!value || value === '') return true;
                // Otherwise, must be one of the valid values
                return ['Male', 'Female', 'Non-binary', 'Other'].includes(value);
            },
            message: 'Gender must be one of: Male, Female, Non-binary, Other'
        }
    },
    interests: [{
        type: String,
        maxlength: 50
    }],
    lookingFor: {
        type: String,
        required: false,
        default: 'Not sure',
        validate: {
            validator: function (value) {
                // Allow null, undefined, or empty string
                if (!value || value === '') return true;
                // Otherwise, must be one of the valid values
                return ['Relationship', 'Friendship', 'Casual', 'Not sure'].includes(value);
            },
            message: 'LookingFor must be one of: Relationship, Friendship, Casual, Not sure'
        }
    },
    preference: {
        type: String,
        required: false,
        default: null,
        validate: {
            validator: function (value) {
                // Allow null, undefined, or empty string
                if (!value || value === '') return true;
                // Otherwise, must be one of the valid values
                return ['Male', 'Female', 'Both'].includes(value);
            },
            message: 'Preference must be one of: Male, Female, Both'
        }
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