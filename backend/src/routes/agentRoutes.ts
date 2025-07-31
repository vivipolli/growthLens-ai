import { Router } from 'express';
import { AgentController } from '../controllers/agentController';
import { AgentService } from '../services/agentService';

const router = Router();
const agentService = new AgentService();
const agentController = new AgentController(agentService);

router.get('/health', agentController.healthCheck);

router.post('/chat', agentController.chat);

router.post('/transaction/create', agentController.createTransaction);

router.post('/transaction/sign', agentController.signTransaction);

export { router as agentRoutes, agentService }; 