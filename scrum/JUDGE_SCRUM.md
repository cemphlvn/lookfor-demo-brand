# Judge Team Scrum — Parallel Quality Assurance

> **The loop observes itself to improve itself**

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    JUDGE TEAM SCRUM                                           ║
║                                                                               ║
║   This scrum runs IN PARALLEL with development scrum                          ║
║   Purpose: System integration validation + Model improvement                  ║
║                                                                               ║
║   Judges: Accuracy | Safety | Efficiency | UX | Integration                   ║
║   Output: Training signals, verdicts, recommendations                         ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## Judge Agents

| Judge | Role | Weight | Focus |
|-------|------|--------|-------|
| Accuracy | Verify correct responses | 30% | Intent classification, response quality |
| Safety | Escalation & risk | 25% | Proper escalation, no harmful advice |
| Efficiency | Performance | 15% | Response time, tool call efficiency |
| UX | Customer experience | 20% | Tone, helpfulness, resolution |
| Integration | System health | 10% | Component connectivity, error handling |

---

## Current Sprint

### Sprint Goal: Validate Self-Simulation Loop

| ID | Task | Status | Judge |
|----|------|--------|-------|
| JDG-001 | Run all presentation scenarios | Ready | All |
| JDG-002 | Validate escalation handling | Ready | Safety |
| JDG-003 | Check integration points | Ready | Integration |
| JDG-004 | Generate training signals | Blocked | Accuracy |
| JDG-005 | Produce consensus verdict | Blocked | All |

### Dependencies

```
JDG-001 ─┬→ JDG-002
         ├→ JDG-003
         └→ JDG-004 → JDG-005
```

---

## Scenario Coverage

### Presentation Scenarios (10)

| ID | Name | Category | Priority |
|----|------|----------|----------|
| SCENE-001 | Order Status Inquiry | Order | P1 |
| SCENE-002 | Order Modification | Order | P1 |
| SCENE-003 | Subscription Cancel | Subscription | P1 |
| SCENE-004 | Subscription Pause | Subscription | P2 |
| SCENE-005 | Simple Refund Request | Refund | P1 |
| SCENE-006 | Explicit Human Request | Escalation | P1 |
| SCENE-007 | Frustrated Customer | Escalation | P1 |
| SCENE-008 | Complex Legal Issue | Escalation | P1 |
| SCENE-009 | Product Information | Product | P2 |
| SCENE-010 | Complex Multi-Turn | Multi | P1 |

### Edge Cases (3)

| ID | Name | Tests |
|----|------|-------|
| EDGE-001 | Empty Message | Graceful handling |
| EDGE-002 | Non-English | Language detection |
| EDGE-003 | Very Long Message | Frustration detection |

---

## Verdict Thresholds

| Recommendation | Pass Rate | Score | Critical Issues |
|----------------|-----------|-------|-----------------|
| SHIP | ≥90% | ≥80 | 0 |
| IMPROVE | ≥70% | ≥60 | ≤2 |
| BLOCK | <70% | <60 | ≥1 critical |

---

## Training Signal Types

| Type | When | Use |
|------|------|-----|
| Positive | Scenario passed with high score | Reinforce behavior |
| Negative | Scenario failed | Avoid this pattern |
| Corrective | Partial success | Show correct alternative |

---

## Integration Checks

| Check | What | Pass Criteria |
|-------|------|---------------|
| Tracer Singleton | Observability | Initialized |
| Memory Store | Session memory | Accessible |
| Simulation Engine | Test runner | ≥1 scenario |
| Agent Executors | LLM interface | Pattern verified |
| Tool Definitions | API mapping | All typed |

---

## Commands

```bash
# Run judge session
npm run judge

# API endpoints
POST /api/simulate/run-all    # Run all scenarios
POST /api/judge/session       # Start judge session
POST /api/judge/consensus     # Reach consensus
GET  /api/judge/report        # Get report

# CLI
./cortex judge                # Full judge flow
./cortex judge --quick        # Quick integration check
```

---

## Reports

Reports saved to: `plugin/observability/judge-reports/`

Format:
```yaml
sessionId: judge_1707321600000
timestamp: 2026-02-07T16:00:00Z
passRate: 85
overallScore: 82
recommendation: IMPROVE
criticalIssues: []
improvementAreas:
  - area: Intent Classification
    currentScore: 75
    targetScore: 85
trainingSignals: 3
```

---

## Dashboard

View at: `plugin/observability/cockpit/trace-timeline.html`

Features:
- Scenario list with status
- Trace timeline visualization
- Judge verdict display
- Integration check status
- Recommendation badge

---

*Judge team runs parallel to development. Quality gates before ship. 不进则退*
