const express = require('express');
const router = express.Router();
const CodeWorkspace = require('../models/CodeWorkspace');
const SecretCode = require('../models/SecretCode');
const CodeSubmission = require('../models/CodeSubmission');

// -----------------------------------------
// PUBLIC ROUTES
// -----------------------------------------

router.post('/verify', async (req, res) => {
    try {
        const { code, phone } = req.body;
        if (!code || !phone) return res.status(400).json({ valid: false, message: 'Code and phone number required.' });

        const secret = await SecretCode.findOne({ codeString: code.toUpperCase(), status: 'active' }).populate('workspaceId');
        if (!secret) return res.status(404).json({ valid: false, message: 'Invalid or expired code.' });
        if (!secret.workspaceId.isActive) return res.status(403).json({ valid: false, message: 'This workspace is currently inactive.' });

        // Logic check: Is it pre-approved?
        if (secret.flowMode === 'pre_approved') {
            if (!secret.preApprovedPhones.includes(phone)) {
                return res.status(403).json({ valid: false, message: 'You are not eligible for this access.' });
            }
        }

        // Re-Entry Check: Has this phone previously redeemed this code?
        let existing = await CodeSubmission.findOne({ codeId: secret._id, phone });
        if (existing) {
             return res.json({ 
                 valid: true, 
                 reEntry: true, 
                 status: existing.status, 
                 submissionId: existing._id,
                 flowMode: existing.flowMode
             });
        }

        // Usage limit check ONLY upon first entry
        if (secret.maxUses > 0 && secret.currentUses >= secret.maxUses) {
            return res.status(403).json({ valid: false, message: 'Code usage limit reached.' });
        }

        // Fresh user - return task instructions config
        res.json({ 
            valid: true, 
            reEntry: false, 
            codeId: secret._id, 
            workspaceId: secret.workspaceId._id,
            flowMode: secret.flowMode,
            askName: secret.askName,
            askEmail: secret.askEmail,
            instructionConfig: secret.instructionConfig,
            instructionTitle: secret.instructionTitle,
            instructionText: secret.instructionText
        });
    } catch (error) { 
        console.error(error);
        res.status(500).json({ valid: false, message: 'Server error verifying code.' }); 
    }
});

// Primary Submission combining Identity & Task
router.post('/redeem', async (req, res) => {
    try {
        const { codeId, workspaceId, phone, name, email, taskData } = req.body;

        let existing = await CodeSubmission.findOne({ codeId, phone });
        if (existing) {
            return res.status(400).json({ success: false, message: 'You have already redeemed this code.' });
        }

        const secret = await SecretCode.findById(codeId);
        if (!secret) return res.status(404).json({ message: 'Code missing.' });

        if (secret.maxUses > 0 && secret.currentUses >= secret.maxUses) {
            return res.status(403).json({ message: 'Usage limit reached during redemption.' });
        }

        // Increment usage
        secret.currentUses += 1;
        if (secret.maxUses > 0 && secret.currentUses >= secret.maxUses) {
            secret.status = 'expired';
        }
        await secret.save();

        const status = secret.flowMode === 'pre_approved' ? 'completed' : 'pending';

        const sub = await CodeSubmission.create({
            workspaceId,
            codeId,
            phone,
            name: name || '',
            email: email || '',
            taskData,
            status,
            flowMode: secret.flowMode
        });

        res.json({ success: true, submissionId: sub._id, status, flowMode: secret.flowMode });
    } catch (error) {
        // Handle unique compound index error
        if (error.code === 11000) return res.status(400).json({ message: "Duplicate submission detected."});
        res.status(500).json({ message: 'Failed to redeem.', error: error.message });
    }
});

router.get('/status/:id', async (req, res) => {
    try {
        const submission = await CodeSubmission.findById(req.params.id).populate('codeId');
        if (!submission) return res.status(404).json({ message: 'Submission not found' });
        
        // Return rejection message if rejected
        if (submission.status === 'rejected') {
            return res.json({ status: submission.status, adminRemark: submission.adminRemark || submission.codeId.rejectMessage });
        }

        // If completed, return success data
        if (submission.status === 'completed') {
            return res.json({ 
                status: submission.status, 
                successMessage: submission.codeId.successMessage,
                revealType: submission.codeId.revealType,
                revealData: submission.codeId.revealData,
                revealTime: submission.codeId.revealTime
            });
        }

        res.json({ status: submission.status, adminRemark: submission.adminRemark });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching status' });
    }
});


// -----------------------------------------
// ADMIN ROUTES
// -----------------------------------------

// Workspaces
router.get('/workspaces', async (req, res) => {
    try {
        const spaces = await CodeWorkspace.find().sort({ createdAt: -1 });
        res.json(spaces);
    } catch (error) { res.status(500).json({ message: error.message }); }
});
router.post('/workspaces', async (req, res) => {
    try {
        const space = await CodeWorkspace.create(req.body);
        res.status(201).json(space);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// Codes
router.get('/codes/:workspaceId', async (req, res) => {
    try {
        const codes = await SecretCode.find({ workspaceId: req.params.workspaceId }).sort({ createdAt: -1 });
        res.json(codes);
    } catch (error) { res.status(500).json({ message: error.message }); }
});
router.post('/codes', async (req, res) => {
    try {
        const payload = { ...req.body };
        // Parse preApprovedPhones string into array if it's sent as string
        if (payload.preApprovedPhones && typeof payload.preApprovedPhones === 'string') {
            payload.preApprovedPhones = payload.preApprovedPhones.split(',').map(phone => phone.trim()).filter(Boolean);
        }
        const code = await SecretCode.create(payload);
        res.status(201).json(code);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// Submissions
router.get('/submissions', async (req, res) => {
    try {
        const { status, search, workspaceId } = req.query;
        let query = {};
        if (status && status !== 'all') query.status = status;
        if (workspaceId && workspaceId !== 'all') query.workspaceId = workspaceId;
        if (search) {
            query.phone = { $regex: search, $options: 'i' };
        }
        
        const subs = await CodeSubmission.find(query).populate('codeId workspaceId').sort({ createdAt: -1 });
        res.json(subs);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

router.put('/submissions/:id/status', async (req, res) => {
    try {
        const { status, adminRemark } = req.body;
        const sub = await CodeSubmission.findById(req.params.id);
        if (!sub) return res.status(404).json({ message: 'Not found' });
        
        sub.status = status;
        if (adminRemark) sub.adminRemark = adminRemark;
        
        await sub.save();
        res.json(sub);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;
