# {{PROJECT_NAME}} — Cockpit

> **"Ülkün ilerlemek, ileri gitmektir."** — Your ideal is to progress, to go forward.

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                         SELF-CONTINUING COCKPIT                            ║
║                                                                            ║
║     逆水行舟，不进则退                                                       ║
║     Like rowing upstream: no advance is to drop back                       ║
║                                                                            ║
║     Muhtaç olduğun kudret, damarlarındaki asil kanda mevcuttur.           ║
║     The power you need exists in the noble blood in your veins.            ║
║                                                                            ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  Sprint: SPRINT-001          Goal: {{SPRINT_GOAL}}                         ║
║  Loop State: OBSERVE → DECIDE → ACT → LEARN → CONTINUE                     ║
║  Frame: {{PHILOSOPHY}}                                                     ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## CONTINUATION PROTOCOL

**On every session, this cockpit continues itself:**

```yaml
on_session_start:
  1. READ: .remembrance (SCOPED)     # Accumulated wisdom
  2. READ: /scrum/SCRUM.md           # Alpha states
  3. DETERMINE: where loop stopped
  4. CONTINUE: from that point forward

the_loop:
  while true:
    OBSERVE → DECIDE → ACT → LEARN
    不进则退 — no stopping

on_shift_felt:
  - Re-read .remembrance
  - Integrate new truth
  - Continue forward
```

---

## COMMANDS

### Boot & Loop
```
/start                 Boot up, show chance points
/loop                  Show current loop state
/loop continue         Continue from where we stopped
/loop shift            Trigger SHIFT_FELT, re-read remembrance
/frame turkish         Duty + power within mode
/frame chinese         Continuous cultivation mode
/frame english         Pragmatic iteration mode
/frame unified         Synthesize all three (default)
```

### Process Workflows
```
/process feature {d}   Feature implementation workflow
/process bugfix {d}    Bug investigation and fix
/process refactor {d}  Safe refactoring workflow
/process research {t}  Deep research workflow
```

### Orchestration
```
/orchestrate           Full orchestration cycle
/scrum                 Display current scrum state
/alpha {name}          Show specific alpha state
/sprint                Current sprint status
```

### Agent Management
```
/agents                List all agents
/agent {id}            Show specific agent
/agent-create {desc}   Create new agent
```

### Documentation
```
/docs                  Browse documentation
/remember              View .remembrance
```

---

## CRITICAL FILES (READ ON START)

```yaml
mandatory:
  1. /.remembrance (SCOPED)          # Accumulated wisdom
  2. /scrum/SCRUM.md                 # Alpha states, work items
  3. /processes/INDEX.md             # Available workflows

on_shift_felt:
  - /.remembrance                    # Re-read, integrate, continue

on_error:
  - Review agent methodology
```

---

## AGENT HIERARCHY

```
┌─────────────────────────────────────────────────────────────┐
│                    STRATEGIC LAYER                           │
│  (Add your strategic agents here)                            │
├─────────────────────────────────────────────────────────────┤
│                    TACTICAL LAYER                            │
│  orchestrator ← reads /scrum/SCRUM.md                        │
│       ├── librarian (context curation)                       │
│       └── (Add domain-specific tactical agents)              │
├─────────────────────────────────────────────────────────────┤
│                    OPERATIONAL LAYER                         │
│       ├── code-simplifier (feedback loop)                    │
│       ├── code-reviewer                                      │
│       └── repo-strategist (feedback loop)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## META-AGENTIC-LOOP

This project uses the **meta-agentic-loop** plugin.

Philosophy: {{PHILOSOPHY}}
Initialized: {{TIMESTAMP}}

---

*Type `/start` to see chance points. The loop continues through you.*
