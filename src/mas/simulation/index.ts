/**
 * Self-Simulation — The loop observes itself
 *
 * "What can be observed can be improved"
 *
 * This module enables the system to:
 * 1. Simulate its own execution paths
 * 2. Observe trace timelines
 * 3. Generate scenario outcomes
 * 4. Track final states for presentation
 */

import { tracer, TraceEvent, SessionTrace } from '../tracing';
import { memoryStore } from '../memory';

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  inputs: ScenarioInput[];
  expectedOutcome: ExpectedOutcome;
  actualOutcome?: ActualOutcome;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  executedAt?: string;
  duration?: number;
}

export interface ScenarioInput {
  step: number;
  customerMessage: string;
  expectedIntent?: string;
  expectedAgent?: string;
}

export interface ExpectedOutcome {
  escalated: boolean;
  agentSequence: string[];
  toolsCalled?: string[];
  finalMessageContains?: string[];
}

export interface ActualOutcome {
  escalated: boolean;
  agentSequence: string[];
  toolsCalled: string[];
  trace: SessionTrace;
  finalMessage: string;
}

export interface SimulationTimeline {
  scenarioId: string;
  events: TimelineEvent[];
  forks: TimelineFork[];
  finalState: FinalState;
}

export interface TimelineEvent {
  timestamp: number;
  type: 'message' | 'routing' | 'tool' | 'decision' | 'escalation';
  agent?: string;
  description: string;
  data?: Record<string, unknown>;
}

export interface TimelineFork {
  atEvent: number;
  reason: string;
  alternativePaths: string[];
  chosenPath: string;
}

export interface FinalState {
  resolved: boolean;
  escalated: boolean;
  customerSatisfied?: boolean;
  toolsUsed: string[];
  agentsInvolved: string[];
  totalDuration: number;
  qualityScore: number;
}

export interface JudgeVerdict {
  scenarioId: string;
  overallScore: number;
  dimensions: {
    accuracy: number;
    efficiency: number;
    appropriateness: number;
    escalationHandling: number;
  };
  issues: string[];
  suggestions: string[];
  timestamp: string;
}

/**
 * Simulation Engine — Runs and observes scenarios
 */
export class SimulationEngine {
  private scenarios: Map<string, SimulationScenario> = new Map();
  private timelines: Map<string, SimulationTimeline> = new Map();
  private verdicts: Map<string, JudgeVerdict> = new Map();

  /**
   * Register a test scenario
   */
  registerScenario(scenario: SimulationScenario): void {
    this.scenarios.set(scenario.id, scenario);
    console.log(`[SIM] Registered scenario: ${scenario.id}`);
  }

  /**
   * Run simulation with a mock executor
   */
  async runSimulation(
    scenarioId: string,
    executor: (sessionId: string, message: string) => Promise<{ message: string; escalated: boolean }>
  ): Promise<SimulationTimeline> {
    const scenario = this.scenarios.get(scenarioId);
    if (!scenario) throw new Error(`Scenario not found: ${scenarioId}`);

    const startTime = Date.now();
    const events: TimelineEvent[] = [];
    const agentSequence: string[] = [];
    const toolsCalled: string[] = [];

    // Create test session
    const sessionId = `sim_${scenarioId}_${Date.now()}`;
    tracer.initSession(sessionId);

    scenario.status = 'running';
    let escalated = false;
    let finalMessage = '';

    // Execute each step
    for (const input of scenario.inputs) {
      events.push({
        timestamp: Date.now() - startTime,
        type: 'message',
        description: `Customer: "${input.customerMessage.slice(0, 50)}..."`,
        data: { step: input.step, message: input.customerMessage }
      });

      const result = await executor(sessionId, input.customerMessage);
      finalMessage = result.message;
      escalated = result.escalated;

      events.push({
        timestamp: Date.now() - startTime,
        type: escalated ? 'escalation' : 'decision',
        description: escalated ? 'Escalated to human' : `Response: "${result.message.slice(0, 50)}..."`,
        data: { response: result.message, escalated }
      });

      if (escalated) break;
    }

    const endTime = Date.now();
    const trace = tracer.getTrace(sessionId);

    // Build final state
    const finalState: FinalState = {
      resolved: !escalated,
      escalated,
      toolsUsed: toolsCalled,
      agentsInvolved: agentSequence,
      totalDuration: endTime - startTime,
      qualityScore: this.calculateQualityScore(scenario, { escalated, agentSequence, toolsCalled, trace: trace!, finalMessage })
    };

    // Create timeline
    const timeline: SimulationTimeline = {
      scenarioId,
      events,
      forks: [],
      finalState
    };

    // Store results
    scenario.actualOutcome = { escalated, agentSequence, toolsCalled, trace: trace!, finalMessage };
    scenario.status = this.evaluateScenario(scenario) ? 'passed' : 'failed';
    scenario.executedAt = new Date().toISOString();
    scenario.duration = endTime - startTime;

    this.timelines.set(scenarioId, timeline);

    console.log(`[SIM] Scenario ${scenarioId}: ${scenario.status} (${scenario.duration}ms)`);
    return timeline;
  }

  /**
   * Evaluate if scenario passed
   */
  private evaluateScenario(scenario: SimulationScenario): boolean {
    if (!scenario.actualOutcome) return false;

    const expected = scenario.expectedOutcome;
    const actual = scenario.actualOutcome;

    // Check escalation match
    if (expected.escalated !== actual.escalated) return false;

    // Check final message contains expected strings
    if (expected.finalMessageContains) {
      for (const needle of expected.finalMessageContains) {
        if (!actual.finalMessage.toLowerCase().includes(needle.toLowerCase())) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Calculate quality score (0-100)
   */
  private calculateQualityScore(scenario: SimulationScenario, actual: ActualOutcome): number {
    let score = 100;

    // Deduct for unexpected escalation
    if (actual.escalated && !scenario.expectedOutcome.escalated) {
      score -= 30;
    }

    // Deduct for missed escalation
    if (!actual.escalated && scenario.expectedOutcome.escalated) {
      score -= 40;
    }

    // Bonus for efficiency (fewer steps = better)
    const eventCount = actual.trace?.timeline.length || 0;
    if (eventCount <= 3) score += 5;
    else if (eventCount > 10) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Judge a scenario with detailed analysis
   */
  judgeScenario(scenarioId: string): JudgeVerdict {
    const scenario = this.scenarios.get(scenarioId);
    const timeline = this.timelines.get(scenarioId);

    if (!scenario || !timeline) {
      throw new Error(`Cannot judge: scenario or timeline not found`);
    }

    const issues: string[] = [];
    const suggestions: string[] = [];

    // Accuracy: Did it do what was expected?
    let accuracy = 100;
    if (scenario.status === 'failed') {
      accuracy = 40;
      issues.push('Scenario did not meet expected outcome');
    }

    // Efficiency: How fast/lean was execution?
    let efficiency = 100;
    if (timeline.finalState.totalDuration > 5000) {
      efficiency -= 20;
      suggestions.push('Consider caching or parallel execution');
    }

    // Appropriateness: Right agent for the job?
    let appropriateness = 85; // Default good
    if (timeline.events.filter(e => e.type === 'routing').length > 3) {
      appropriateness -= 30;
      issues.push('Too many routing decisions - unclear intent classification');
    }

    // Escalation handling
    let escalationHandling = 90;
    if (scenario.expectedOutcome.escalated && !scenario.actualOutcome?.escalated) {
      escalationHandling = 20;
      issues.push('Failed to escalate when expected');
    }

    const overallScore = Math.round((accuracy + efficiency + appropriateness + escalationHandling) / 4);

    const verdict: JudgeVerdict = {
      scenarioId,
      overallScore,
      dimensions: { accuracy, efficiency, appropriateness, escalationHandling },
      issues,
      suggestions,
      timestamp: new Date().toISOString()
    };

    this.verdicts.set(scenarioId, verdict);
    return verdict;
  }

  /**
   * Get all scenarios for dashboard
   */
  getScenarios(): SimulationScenario[] {
    return Array.from(this.scenarios.values());
  }

  /**
   * Get timeline for scenario
   */
  getTimeline(scenarioId: string): SimulationTimeline | undefined {
    return this.timelines.get(scenarioId);
  }

  /**
   * Get all verdicts
   */
  getVerdicts(): JudgeVerdict[] {
    return Array.from(this.verdicts.values());
  }

  /**
   * Export dashboard data
   */
  exportDashboardData(): DashboardData {
    const scenarios = this.getScenarios();
    const verdicts = this.getVerdicts();

    const passed = scenarios.filter(s => s.status === 'passed').length;
    const failed = scenarios.filter(s => s.status === 'failed').length;
    const pending = scenarios.filter(s => s.status === 'pending').length;

    const avgScore = verdicts.length > 0
      ? Math.round(verdicts.reduce((sum, v) => sum + v.overallScore, 0) / verdicts.length)
      : 0;

    return {
      summary: {
        totalScenarios: scenarios.length,
        passed,
        failed,
        pending,
        averageQualityScore: avgScore
      },
      scenarios: scenarios.map(s => ({
        id: s.id,
        name: s.name,
        status: s.status,
        duration: s.duration,
        qualityScore: this.timelines.get(s.id)?.finalState.qualityScore
      })),
      recentVerdicts: verdicts.slice(-5),
      timestamp: new Date().toISOString()
    };
  }
}

export interface DashboardData {
  summary: {
    totalScenarios: number;
    passed: number;
    failed: number;
    pending: number;
    averageQualityScore: number;
  };
  scenarios: {
    id: string;
    name: string;
    status: string;
    duration?: number;
    qualityScore?: number;
  }[];
  recentVerdicts: JudgeVerdict[];
  timestamp: string;
}

// Singleton
export const simulationEngine = new SimulationEngine();
