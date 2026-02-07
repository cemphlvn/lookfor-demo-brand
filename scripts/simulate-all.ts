/**
 * Run all simulations and output results
 */

import { simulationEngine } from '../src/mas/simulation';
import { getAllScenarios } from '../src/mas/simulation/scenarios';
import { judgeTeam } from '../src/mas/judge';
import { buildDefaultMAS } from '../src/meta/mas-builder';
import { MASRuntime } from '../src/mas/runtime';
import { memoryStore } from '../src/mas/memory';
import type { LLMClient } from '../src/mas/agents/executor';

// Mock client for CI
function createMockClient(): LLMClient {
  return {
    async chat(messages) {
      const last = messages.filter(m => m.role === 'user').pop();
      const content = String(last?.content || '');
      if (content.includes('human') || content.includes('manager') || content.includes('real person')) {
        return { content: 'I am escalating this to our team.' };
      }
      if (content.includes('order')) {
        return { content: 'I can help with your order status.' };
      }
      if (content.includes('subscription') || content.includes('cancel')) {
        return { content: 'I can help you with your subscription.' };
      }
      return { content: 'How can I help you today?' };
    }
  };
}

async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║  Self-Simulation Loop                       ║');
  console.log('╚════════════════════════════════════════════╝');

  // Initialize
  memoryStore.clear();
  const scenarios = getAllScenarios();
  scenarios.forEach(s => simulationEngine.registerScenario({ ...s, status: 'pending' }));

  console.log(`\n→ Registered ${scenarios.length} scenarios`);

  // Create runtime
  const { config } = buildDefaultMAS('simulation');
  const runtime = new MASRuntime(config, createMockClient());

  const executor = async (sid: string, msg: string) => {
    const sessionId = runtime.startSession({
      customerEmail: 'sim@test.com',
      firstName: 'Sim',
      lastName: 'Test',
      shopifyCustomerId: 'sim_test'
    });
    return runtime.handleMessage(sessionId, msg);
  };

  // Run simulations
  console.log('\n→ Running simulations...\n');
  const results: { id: string; status: string; score: number }[] = [];

  for (const scenario of simulationEngine.getScenarios()) {
    try {
      const timeline = await simulationEngine.runSimulation(scenario.id, executor);
      results.push({ id: scenario.id, status: scenario.status, score: timeline.finalState.qualityScore });
    } catch (e) {
      results.push({ id: scenario.id, status: 'error', score: 0 });
    }
  }

  // Print results
  console.log('\n═══════════════════════════════════════════');
  console.log('SIMULATION RESULTS');
  console.log('═══════════════════════════════════════════\n');

  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;

  for (const r of results) {
    const icon = r.status === 'passed' ? '✓' : r.status === 'failed' ? '✗' : '?';
    console.log(`  ${icon} ${r.id}: ${r.status} (score: ${r.score})`);
  }

  console.log(`\n  Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);

  // Judge
  console.log('\n→ Running judge session...');
  const session = judgeTeam.startSession();
  judgeTeam.runIntegrationChecks();
  judgeTeam.judgeAllScenarios(session.id);
  const verdict = judgeTeam.reachConsensus(session.id);

  console.log('\n═══════════════════════════════════════════');
  console.log('JUDGE VERDICT');
  console.log('═══════════════════════════════════════════\n');
  console.log(`  Recommendation: ${verdict.recommendation}`);
  console.log(`  Overall Score: ${verdict.overallScore}`);
  console.log(`  Pass Rate: ${verdict.passRate.toFixed(1)}%`);

  if (verdict.criticalIssues.length > 0) {
    console.log('\n  Critical Issues:');
    verdict.criticalIssues.forEach(i => console.log(`    - ${i.description}`));
  }

  if (verdict.improvementAreas.length > 0) {
    console.log('\n  Improvement Areas:');
    verdict.improvementAreas.forEach(a => console.log(`    - ${a.area}: ${a.currentScore} → ${a.targetScore}`));
  }

  console.log('\n═══════════════════════════════════════════\n');

  // Exit code
  process.exit(verdict.recommendation === 'BLOCK' ? 1 : 0);
}

main().catch(console.error);
