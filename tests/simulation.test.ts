/**
 * Simulation & Judge Tests — Verify self-observation loop
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationEngine, simulationEngine } from '../src/mas/simulation';
import { PRESENTATION_SCENARIOS, EDGE_CASE_SCENARIOS, getAllScenarios } from '../src/mas/simulation/scenarios';
import { JudgeTeam, judgeTeam } from '../src/mas/judge';
import { buildDefaultMAS } from '../src/meta/mas-builder';
import { MASRuntime } from '../src/mas/runtime';
import { memoryStore } from '../src/mas/memory';
import type { LLMClient } from '../src/mas/agents/executor';

// Mock LLM for testing
function createTestLLMClient(): LLMClient {
  return {
    async chat(messages, tools) {
      const lastUser = messages.filter(m => m.role === 'user').pop();
      const content = lastUser?.content || '';

      if (typeof content === 'string') {
        if (content.toLowerCase().includes('human') || content.toLowerCase().includes('manager') || content.toLowerCase().includes('real person')) {
          return { content: 'I am escalating this to our team.' };
        }
        if (content.toLowerCase().includes('order')) {
          return { content: 'I can help with your order status. Let me look that up.' };
        }
        if (content.toLowerCase().includes('subscription') || content.toLowerCase().includes('cancel')) {
          return { content: 'I can help you cancel your subscription.' };
        }
        if (content.toLowerCase().includes('refund')) {
          return { content: 'I will process your refund request.' };
        }
      }

      return { content: 'How can I help you today?' };
    }
  };
}

describe('Simulation Engine', () => {
  beforeEach(() => {
    memoryStore.clear();
  });

  it('should register scenarios', () => {
    const engine = new SimulationEngine();

    for (const scenario of PRESENTATION_SCENARIOS.slice(0, 3)) {
      engine.registerScenario(scenario);
    }

    const scenarios = engine.getScenarios();
    expect(scenarios.length).toBe(3);
  });

  it('should have presentation scenarios defined', () => {
    expect(PRESENTATION_SCENARIOS.length).toBeGreaterThan(5);
    expect(EDGE_CASE_SCENARIOS.length).toBeGreaterThan(0);
  });

  it('should get all scenarios', () => {
    const all = getAllScenarios();
    expect(all.length).toBe(PRESENTATION_SCENARIOS.length + EDGE_CASE_SCENARIOS.length);
  });

  it('should run simulation and produce timeline', async () => {
    const engine = new SimulationEngine();
    const scenario = PRESENTATION_SCENARIOS[0]; // Order status
    engine.registerScenario(scenario);

    const { config } = buildDefaultMAS('test-brand');
    const runtime = new MASRuntime(config, createTestLLMClient());

    const executor = async (sessionId: string, message: string) => {
      // Use real runtime or mock
      const sid = runtime.startSession({
        customerEmail: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        shopifyCustomerId: 'cust_test'
      });
      return runtime.handleMessage(sid, message);
    };

    const timeline = await engine.runSimulation(scenario.id, executor);

    expect(timeline).toBeDefined();
    expect(timeline.scenarioId).toBe(scenario.id);
    expect(timeline.events.length).toBeGreaterThan(0);
    expect(timeline.finalState).toBeDefined();
  });

  it('should export dashboard data', () => {
    const engine = new SimulationEngine();
    for (const scenario of PRESENTATION_SCENARIOS) {
      engine.registerScenario(scenario);
    }

    const data = engine.exportDashboardData();

    expect(data.summary).toBeDefined();
    expect(data.summary.totalScenarios).toBe(PRESENTATION_SCENARIOS.length);
    expect(data.timestamp).toBeDefined();
  });
});

describe('Judge Team', () => {
  it('should have 5 judges', () => {
    const team = new JudgeTeam();
    const report = team.exportReport();

    expect(report.judges.length).toBe(5);
    expect(report.judges.map(j => j.role)).toContain('accuracy');
    expect(report.judges.map(j => j.role)).toContain('safety');
  });

  it('should start a judge session', () => {
    const session = judgeTeam.startSession();

    expect(session.id).toMatch(/^judge_/);
    expect(session.status).toBe('active');
  });

  it('should run integration checks', () => {
    const checks = judgeTeam.runIntegrationChecks();

    expect(checks.length).toBeGreaterThan(0);
    expect(checks.every(c => ['pass', 'fail', 'warn'].includes(c.status))).toBe(true);
  });

  it('should export report', () => {
    const report = judgeTeam.exportReport();

    expect(report.sessionId).toBeDefined();
    expect(report.timestamp).toBeDefined();
    expect(report.judges).toBeDefined();
  });
});

describe('Scenario Coverage', () => {
  it('should cover order management scenarios', () => {
    const orderScenarios = PRESENTATION_SCENARIOS.filter(s =>
      s.name.toLowerCase().includes('order')
    );
    expect(orderScenarios.length).toBeGreaterThanOrEqual(2);
  });

  it('should cover subscription scenarios', () => {
    const subScenarios = PRESENTATION_SCENARIOS.filter(s =>
      s.name.toLowerCase().includes('subscription')
    );
    expect(subScenarios.length).toBeGreaterThanOrEqual(2);
  });

  it('should cover escalation scenarios', () => {
    const escScenarios = PRESENTATION_SCENARIOS.filter(s =>
      s.expectedOutcome.escalated === true
    );
    expect(escScenarios.length).toBeGreaterThanOrEqual(3);
  });

  it('should cover multi-turn conversations', () => {
    const multiTurn = PRESENTATION_SCENARIOS.filter(s =>
      s.inputs.length >= 3
    );
    expect(multiTurn.length).toBeGreaterThanOrEqual(1);
  });

  it('should have edge cases', () => {
    expect(EDGE_CASE_SCENARIOS.length).toBeGreaterThanOrEqual(3);

    const edgeTypes = EDGE_CASE_SCENARIOS.map(s => s.name);
    expect(edgeTypes.some(t => t.includes('Empty'))).toBe(true);
  });
});

describe('Training Signal Generation', () => {
  it('should generate training signals from failed scenarios', async () => {
    const engine = new SimulationEngine();
    const session = judgeTeam.startSession();

    // Register a scenario that will fail
    const failingScenario = {
      id: 'FAIL-001',
      name: 'Intentionally Failing',
      description: 'This should fail',
      inputs: [
        { step: 1, customerMessage: 'Test message', expectedIntent: 'TEST' }
      ],
      expectedOutcome: {
        escalated: true, // Will fail because mock doesn't escalate this
        agentSequence: [],
        finalMessageContains: ['specific-word-not-in-response']
      },
      status: 'pending' as const
    };

    engine.registerScenario(failingScenario);

    const executor = async (sessionId: string, message: string) => {
      return { message: 'Generic response', escalated: false };
    };

    await engine.runSimulation(failingScenario.id, executor);

    const scenarios = engine.getScenarios();
    const failed = scenarios.find(s => s.id === 'FAIL-001');

    expect(failed?.status).toBe('failed');
  });
});

describe('Integration Flow', () => {
  it('should complete full judge flow', async () => {
    const engine = new SimulationEngine();

    // Register scenarios
    for (const scenario of PRESENTATION_SCENARIOS.slice(0, 2)) {
      engine.registerScenario({ ...scenario, status: 'pending' });
    }

    const { config } = buildDefaultMAS('test-brand');
    const runtime = new MASRuntime(config, createTestLLMClient());

    const executor = async (sessionId: string, message: string) => {
      const sid = runtime.startSession({
        customerEmail: 'flow@test.com',
        firstName: 'Flow',
        lastName: 'Test',
        shopifyCustomerId: 'cust_flow'
      });
      return runtime.handleMessage(sid, message);
    };

    // Run simulations
    for (const scenario of engine.getScenarios()) {
      await engine.runSimulation(scenario.id, executor);
    }

    // Judge
    const session = judgeTeam.startSession();
    judgeTeam.runIntegrationChecks();

    // Note: judgeAllScenarios uses the global simulationEngine
    // For this test, we verify the flow works
    expect(session.status).toBe('active');

    const report = judgeTeam.exportReport();
    expect(report.integrationChecks.length).toBeGreaterThan(0);
  });
});
