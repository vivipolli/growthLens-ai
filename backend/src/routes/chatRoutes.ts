import { Router } from 'express';
import { ChatController } from '../controllers/chatController';

export const createChatRoutes = (chatController: ChatController) => {
    const router = Router();

    // Send a chat message
    router.post('/send', chatController.sendMessage);

    // Send a system message
    router.post('/system', chatController.sendSystemMessage);

    // Get chat service status
    router.get('/status', chatController.getChatStatus);

    return router;
}; 