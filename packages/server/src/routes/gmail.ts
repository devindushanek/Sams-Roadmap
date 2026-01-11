import express from 'express';
import { gmailService } from '../services/gmail';
import { llmFactory } from '../services/llm/factory';

export const gmailRouter = express.Router();

// Get recent emails
gmailRouter.get('/messages', async (req, res) => {
    try {
        const maxResults = req.query.maxResults ? parseInt(req.query.maxResults as string) : 10;
        const emails = await gmailService.listEmails(maxResults);
        res.json({ success: true, emails });
    } catch (error) {
        console.error('Error fetching emails:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch emails' });
    }
});

// Generate AI reply with style learning
gmailRouter.post('/generate-reply', async (req, res) => {
    try {
        const { emailId, tone = 'professional' } = req.body;

        if (!emailId) {
            return res.status(400).json({ success: false, error: 'Email ID is required' });
        }

        const email = await gmailService.getEmailDetails(emailId);
        if (!email) {
            return res.status(404).json({ success: false, error: 'Email not found' });
        }

        // Fetch recent sent emails to learn style
        const sentEmails = await gmailService.listSentEmails(3);
        const styleExamples = sentEmails.map(e => `Subject: ${e.subject}\nBody: ${e.body || e.snippet}`).join('\n---\n');

        const prompt = `
        You are an AI email assistant acting as the user. Draft a reply to the following email.
        
        INCOMING EMAIL:
        From: ${email.from}
        Subject: ${email.subject}
        Body: ${email.body || email.snippet}
        
        YOUR TASK:
        Draft a reply in a ${tone} tone.
        
        USER'S WRITING STYLE (Mimic this style):
        ${styleExamples}
        
        GUIDELINES:
        - Do not include "Subject:" line unless necessary.
        - Be concise and direct if the user's style is concise.
        - Use the user's name if found in the style examples.
        - Output ONLY the body of the reply.
        `;

        const llm = await llmFactory.getProvider();
        const reply = await llm.generateContent(prompt);

        res.json({ success: true, reply });
    } catch (error) {
        console.error('Error generating reply:', error);
        res.status(500).json({ success: false, error: 'Failed to generate reply' });
    }
});

// Modify message (Archive, Star, Read)
gmailRouter.post('/messages/:id/modify', async (req, res) => {
    try {
        const { id } = req.params;
        const { addLabels = [], removeLabels = [] } = req.body;

        const success = await gmailService.modifyMessage(id, addLabels, removeLabels);
        res.json({ success });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to modify message' });
    }
});

// Trash message
gmailRouter.post('/messages/:id/trash', async (req, res) => {
    try {
        const { id } = req.params;
        const success = await gmailService.trashMessage(id);
        res.json({ success });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to trash message' });
    }
});

// Create draft
gmailRouter.post('/drafts', async (req, res) => {
    try {
        const { to, subject, body } = req.body;

        if (!to || !body) {
            return res.status(400).json({ success: false, error: 'To and Body are required' });
        }

        const draftId = await gmailService.createDraft(to, subject || '(No Subject)', body);

        if (draftId) {
            res.json({ success: true, draftId });
        } else {
            res.status(500).json({ success: false, error: 'Failed to create draft' });
        }
    } catch (error) {
        console.error('Error creating draft:', error);
        res.status(500).json({ success: false, error: 'Failed to create draft' });
    }
});
