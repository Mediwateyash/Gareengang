const mongoose = require('mongoose');

const codeSubmissionSchema = new mongoose.Schema({
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CodeWorkspace',
        required: true
    },
    codeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SecretCode',
        required: true
    },
    
    // Basic Verification
    phone: { type: String, required: true },
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    
    flowMode: {
        type: String, // 'pre_approved' or 'verification'
        required: true
    },

    // State machine
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed'],
        default: 'pending' // pending -> (approved/rejected) -> completed (when task finished)
    },
    
    adminRemark: {
        type: String, // Custom message set during approval/rejection
        default: ''
    },

    // Stores dynamic form key-value pairs configured in SecretCode.instructionConfig
    // Example: { "Screenshot": "CloudinaryURL", "Why you want in": "Because I'm awesome" }
    taskData: { 
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

codeSubmissionSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Enforce one submission per code per phone
codeSubmissionSchema.index({ codeId: 1, phone: 1 }, { unique: true });

module.exports = mongoose.model('CodeSubmission', codeSubmissionSchema);
