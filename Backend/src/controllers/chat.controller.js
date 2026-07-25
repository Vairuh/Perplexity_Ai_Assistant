import { generateResponse, generateChatTitle } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";

export async function sendMessage(req, res) {
    try {
        const { message, chatId, chat: chatFromBody } = req.body;
        const resolvedChatId = chatId || chatFromBody;

        let title = null;
        let chat = null;

        if (!resolvedChatId) {
            title = await generateChatTitle(message);
            chat = await chatModel.create({
                user: req.user.id,
                title,
            });
        } else {
            chat = await chatModel.findById(resolvedChatId);
            if (!chat) return res.status(404).json({ error: 'Chat not found' });
        }

        const messageDoc = await messageModel.create({
            chat: chat._id,
            content: message,
            role: 'user',
        });

        const messages = await messageModel.find({ chat: chat._id });
        const result = await generateResponse(messages);

        await messageModel.create({
            chat: chat._id,
            content: result,
            role: 'assistant',
        });

        res.json({ ai: result, title, chat, message: messageDoc });
    } catch (error) {
        console.error('sendMessage error:', error);
        return res.status(500).json({ error: error.message || 'Failed to send message' });
    }
}

export async function getChats(req, res) {
    const user = req.user

    const chats = await chatModel.find({ user: user.id })

    res.status(200).json({
        message: "Chats retrieved successfully",
        chats
    })
}

export async function getMessages(req, res) {
    try {
        const { chatId } = req.params;

        const chat = await chatModel.findOne({
            _id: chatId,
            user: req.user.id
        });

        if (!chat) {
            return res.status(404).json({ error: "Chat not found" });
        }

        const messages = await messageModel.find({ chat: chat._id });

        return res.status(200).json({
            message: "Messages retrieved successfully",
            messages
        });
    } catch (error) {
        console.error('getMessages error:', error);
        return res.status(500).json({ error: 'Failed to load messages' });
    }
}

export async function deleteChat(req, res) {
    try {
        const { chatId } = req.params;

        const chat = await chatModel.findOneAndDelete({
            _id: chatId,
            user: req.user.id
        });

        if (!chat) {
            return res.status(404).json({ error: "Chat not found" });
        }

        await messageModel.deleteMany({ chat: chatId });

        return res.status(200).json({
            message: "Chat deleted successfully"
        });
    } catch (error) {
        console.error('deleteChat error:', error);
        return res.status(500).json({ error: 'Failed to delete chat' });
    }
}
