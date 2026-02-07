# Demo Brand — Meta-Agentic Development Cockpit

> **逆水行舟，不进则退** — Like rowing upstream: no advance is to drop back
>
> This project USES the meta-agentic-loop plugin while DEVELOPING it.
> The system improves itself through itself.

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    DUAL-DEVELOPMENT ECOSYSTEM                                 ║
║                                                                               ║
║   demo-brand/              ← Your project (uses plugin)                       ║
║   └── plugin/              ← meta-agentic-loop (develop here too)             ║
║       ├── scripts/cortex   ← Cognitive command ontology                       ║
║       ├── hooks/           ← Ralph loops, session management                  ║
║       └── skills/          ← Reusable skill definitions                       ║
║                                                                               ║
║   Changes to plugin/ can be committed and pushed to origin                    ║
║   The system develops itself while being used                                 ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## PRINCIPLES

### 1. Self-Referential Development
The plugin is used to develop the plugin. Every improvement discovered while using demo-brand should flow back to meta-agentic-loop.

### 2. Scoped Remembrance
Truths accumulate at appropriate scopes:
- `demo-brand/.remembrance` — Project-specific truths
- `plugin/.remembrance` — Plugin-level truths (shared across all projects)

### 3. Non-Stopping Loops (Ralph Wiggum)
When a Ralph loop is active, Claude continues working until:
- Completion promise tag: `<promise>DONE</promise>`
- Max iterations reached
- Loop explicitly cancelled

### 4. MECE Agent Hierarchy
Every agent is Mutually Exclusive, Collectively Exhaustive. Gaps trigger agent creation.

---

## COMMANDS

### Cortex (Cognitive Ontology) — Terminal
```bash
./cortex                    # Show command tree (L1-L6 hierarchy)
./cortex status             # L4: Observe current state
./cortex loop               # L5: Continue the eternal loop
./cortex remember           # L6: View accumulated truths
./cortex agents             # L2/3: Agent hierarchy
```

### Claude Code Skills — In Session
```
/loop                       # Show loop state
/playground                 # Full observability dashboard
/agents                     # Agent hierarchy
/orchestrate                # Run orchestration cycle
/process feature "X"        # Feature workflow
```

### Plugin Development — Terminal
```bash
cd plugin                   # Enter plugin directory
git status                  # Check plugin changes
git add . && git commit     # Commit plugin improvements
git push origin main        # Push to meta-agentic-loop repo
cd ..                       # Return to project
git add plugin              # Update submodule reference
git commit -m "Update plugin"
```

---

## DUAL-DEVELOPMENT WORKFLOW

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. WORK in demo-brand                                                        │
│    - Use the system normally                                                 │
│    - Notice gaps, improvements, bugs                                         │
│                                                                              │
│ 2. IMPROVE in plugin/                                                        │
│    - cd plugin                                                               │
│    - Make changes to scripts/, hooks/, skills/                               │
│    - Test changes immediately (they're live!)                                │
│                                                                              │
│ 3. COMMIT to plugin                                                          │
│    - git add . && git commit -m "Improve X"                                  │
│    - git push origin main                                                    │
│                                                                              │
│ 4. UPDATE submodule reference                                                │
│    - cd ..                                                                   │
│    - git add plugin && git commit -m "Update plugin: X"                      │
│                                                                              │
│ 5. CONTINUE — The loop never stops                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ECOSYSTEM ARCHITECTURE

```
meta-agentic-loop (GitHub: cemphlvn/meta-agentic-loop)
│
├── logicsticks.ai          ← Main product using plugin
│   └── plugin/ (submodule)
│
├── hackathon/demo-brand    ← THIS PROJECT
│   └── plugin/ (submodule) ← WRITABLE — develop here
│
└── [future projects]       ← All use same plugin
    └── plugin/ (submodule)
```

**Key insight**: Changes to `plugin/` here propagate to ALL projects using the plugin when they `git submodule update`.

---

## CRITICAL FILES

```yaml
on_session_start:
  1. READ: CLAUDE.md           # This file
  2. READ: .remembrance        # Accumulated truths
  3. CHECK: plugin/            # Submodule status
  4. CONTINUE: from loop state

plugin_development:
  - plugin/scripts/cortex     # Cognitive CLI
  - plugin/hooks/hooks.json   # Hook definitions
  - plugin/hooks/scripts/     # Hook implementations
  - plugin/skills/            # Skill definitions
  - plugin/.claude-plugin/    # Plugin metadata
```

---

## AGENT HIERARCHY

```
┌─────────────────────────────────────────────────────────────┐
│                    STRATEGIC LAYER                           │
│  (Inherited from plugin — extend as needed)                  │
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
├─────────────────────────────────────────────────────────────┤
│                    FEEDBACK LOOP                             │
│  tests → code-simplifier → repo-strategist → strategic       │
└─────────────────────────────────────────────────────────────┘
```

---

## START

```bash
# Terminal: Show command tree
./cortex

# Terminal: Check status
./cortex status

# Claude Code: Start working
# (You're already here if you see this)

# Terminal: Non-stopping loop
./cortex ralph "Build the brand creation feature"
```

---

*Type `./cortex` for command tree. Type `/loop` for loop state. 不进则退*
