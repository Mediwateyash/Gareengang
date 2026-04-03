const mongoose = require('mongoose');

const inputConfigSchema = new mongoose.Schema({
    fieldName: { type: String, required: true },
    type: { type: String, enum: ['text', 'textarea', 'file', 'email', 'number'], required: true },
    required: { type: Boolean, default: true },
    placeholder: { type: String, default: '' }
}, { _id: false });

const secretCodeSchema = new mongoose.Schema({
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CodeWorkspace',
        required: true
    },
    codeString: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        uppercase: true
    },
    type: {
        type: String,
        enum: ['general', 'single_use'],
        default: 'general'
    },
    flowMode: {
        type: String,
        enum: ['pre_approved', 'verification'],
        default: 'verification'
    },
    preApprovedPhones: { 
        type: [String], 
        default: [] 
    },
    askName: { type: Boolean, default: false },
    askEmail: { type: Boolean, default: false },
    maxUses: { // If general, can limit total uses. If 0, unlimited.
        type: Number,
        default: 0
    },
    currentUses: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'disabled'],
        default: 'active'
    },
    
    // User Journey Config
    instructionTitle: {
        type: String,
        default: 'Complete the Task'
    },
    instructionText: {
        type: String,
        default: 'Please provide the requested information below.'
    },
    instructionConfig: [inputConfigSchema],
    
    // The Success Animation End Result
    successMessage: {
        type: String,
        default: 'Access Granted. Welcome to the Secret Group.'
    },
    rejectMessage: {
        type: String,
        default: 'Your access request has been denied by the administrator.'
    },

    // Scheduled Reveal
    revealType: { // 'none', 'link', 'text'
        type: String,
        enum: ['none', 'link', 'text'],
        default: 'none'
    },
    revealData: { // Text message or URL link
        type: String,
        default: ''
    },
    revealTime: { // Count down to this exact Date
        type: Date,
        default: null
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SecretCode', secretCodeSchema);
