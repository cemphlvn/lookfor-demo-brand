/**
 * Simulation & Judge API — CI/CD Integration
 */

import express from 'express';
import { simulationEngine } from '../mas/simulation';
import { getAllScenarios } from '../mas/simulation/scenarios';
import { judgeTeam } from '../mas/judge';
import { buildDefaultMAS } from '../meta/mas-builder';
import { MASRuntime } from '../mas/runtime';
import { memoryStore } from '../mas/memory';
import type { LLMClient } from '../mas/agents/executor';

// CI/CD mock client
function createCIMockClient(): LLMClient {
  return {
    async chat(messages) {
      const last = messages.filter(m => m.role === 'user').pop();
      const content = String(last?.content || '');
      if (content.includes('human') || content.includes('manager')) {
        return { content: 'Escalating to team.' };
      }
      return { content: 'I can help with that.' };
    }
  };
}

export function createSimulationRouter(): express.Router {
  const router = express.Router();

  // Initialize scenarios
  router.post('/init', (req, res) => {
    const scenarios = getAllScenarios();
    scenarios.forEach(s => simulationEngine.registerScenario({ ...s, status: 'pending' }));
    res.json({ registered: scenarios.length });
  });

  // Run all scenarios
  router.post('/run-all', async (req, res) => {
    memoryStore.clear();
    const { config } = buildDefaultMAS('ci-test');
    const runtime = new MASRuntime(config, createCIMockClient());

    const executor = async (sid: string, msg: string) => {
      const sessionId = runtime.startSession({
        customerEmail: 'ci@test.com',
        firstName: 'CI',
        lastName: 'Test',
        shopifyCustomerId: 'ci_test'
      });
      return runtime.handleMessage(sessionId, msg);
    };

    const results = [];
    for (const scenario of simulationEngine.getScenarios()) {
      try {
        const timeline = await simulationEngine.runSimulation(scenario.id, executor);
        results.push({ id: scenario.id, status: 'completed', score: timeline.finalState.qualityScore });
      } catch (e) {
        results.push({ id: scenario.id, status: 'error', error: String(e) });
      }
    }

    res.json({ results, total: results.length });
  });

  // Get dashboard data
  router.get('/dashboard', (req, res) => {
    res.json(simulationEngine.exportDashboardData());
  });

  // Get timeline for scenario
  router.get('/timeline/:id', (req, res) => {
    const timeline = simulationEngine.getTimeline(req.params.id);
    if (!timeline) return res.status(404).json({ error: 'Not found' });
    res.json(timeline);
  });

  return router;
}

export function createJudgeRouter(): express.Router {
  const router = express.Router();

  // Start session
  router.post('/session', (req, res) => {
    const session = judgeTeam.startSession();
    res.json(session);
  });

  // Run integration checks
  router.post('/integration', (req, res) => {
    const checks = judgeTeam.runIntegrationChecks();
    res.json({ checks, passed: checks.filter(c => c.status === 'pass').length });
  });

  // Judge all and reach consensus
  router.post('/consensus', (req, res) => {
    const session = judgeTeam.getLatestSession();
    if (!session) return res.status(400).json({ error: 'No active session' });

    judgeTeam.judgeAllScenarios(session.id);
    const verdict = judgeTeam.reachConsensus(session.id);
    res.json(verdict);
  });

  // Get report
  router.get('/report', (req, res) => {
    res.json(judgeTeam.exportReport());
  });

  // CI/CD gate check
  router.get('/gate', (req, res) => {
    const report = judgeTeam.exportReport();
    const pass = report.verdict?.recommendation === 'SHIP';
    res.status(pass ? 200 : 503).json({
      gate: pass ? 'PASS' : 'FAIL',
      recommendation: report.verdict?.recommendation || 'PENDING',
      score: report.verdict?.overallScore || 0
    });
  });

  return router;
}
