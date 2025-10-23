const mongoose = require('mongoose');

const confessionSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        maxlength: 1000
    },
    category: {
        type: String,
        required: true,
        enum: ['love', 'breakup', 'secret', 'funny', 'crush'],
        default: 'secret'
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    college: {
        type: String,
        required: true
    },
    isAnonymous: {
        type: Boolean,
        default: true
    },

    reactions: {
        heart: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        laugh: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        fire: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        sad: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }]
    },
    reactionCounts: {
        heart: { type: Number, default: 0 },
        laugh: { type: Number, default: 0 },
        fire: { type: Number, default: 0 },
        sad: { type: Number, default: 0 }
    },
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        content: {
            type: String,
            required: true,
            maxlength: 500
        },
        isAnonymous: {
            type: Boolean,
            default: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    commentCount: {
        type: Number,
        default: 0
    },
    isReported: {
        type: Boolean,
        default: false
    },
    reports: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reason: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Index for efficient queries
confessionSchema.index({ college: 1, createdAt: -1 });
confessionSchema.index({ category: 1, createdAt: -1 });


module.exports = mongoose.model('Confession', confessionSchema);