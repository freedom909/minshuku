// gateway/routers/accountRouter.js
import express from 'express';

export default function accountRouterFactory(container) {
  const accountService = container.resolve('accountService');
  const router = express.Router();
  // List all users
  router.get('/users', async (req, res) => {
    const users = await accountService.listAllUsers();
    res.json(users);
  });

  // Approve pending host
  router.post('/host/approve', async (req, res) => {
    const { userId, adminId } = req.body;
    const result = await accountService.approveHost(userId, adminId);
    res.json(result);
  });

  // Lock / unlock user
  router.post('/user/lock', async (req, res) => {
    const { userId, adminId } = req.body;
    const result = await accountService.lockUser(userId, adminId);
    res.json(result);
  });

  router.post('/user/unlock', async (req, res) => {
    const { userId, adminId } = req.body;
    const result = await adminService.unlockUser(userId, adminId);
    res.json(result);
  });

  // Issue admin token
  router.post('/token/issue', async (req, res) => {
    const { adminId } = req.body;
    const token = await accountService.issueAdminToken(adminId);
    res.json(token);
  });

  // Audit logs
  router.get('/audit', async (req, res) => {
    const logs = await accountService.auditLogs();
    res.json(logs);
  });

  return router;
};
