#!/bin/bash
# CI/CD Judge Gate — Run simulation loop and get verdict

set -e

API_URL="${API_URL:-http://localhost:3001}"

echo "╔════════════════════════════════════════════╗"
echo "║  CI/CD Judge Gate                           ║"
echo "╚════════════════════════════════════════════╝"

# 1. Initialize scenarios
echo "→ Initializing scenarios..."
curl -s -X POST "$API_URL/simulate/init" | jq .

# 2. Run all scenarios
echo "→ Running simulations..."
RESULT=$(curl -s -X POST "$API_URL/simulate/run-all")
echo "$RESULT" | jq '.results[] | "\(.id): \(.status) (\(.score // "N/A"))"'

# 3. Start judge session
echo "→ Starting judge session..."
curl -s -X POST "$API_URL/judge/session" | jq .sessionId

# 4. Run integration checks
echo "→ Running integration checks..."
curl -s -X POST "$API_URL/judge/integration" | jq '.checks[] | "\(.name): \(.status)"'

# 5. Reach consensus
echo "→ Reaching consensus..."
VERDICT=$(curl -s -X POST "$API_URL/judge/consensus")
echo "$VERDICT" | jq '.verdict | { recommendation, overallScore, passRate }'

# 6. Check gate
echo "→ Checking CI/CD gate..."
GATE=$(curl -s "$API_URL/judge/gate")
REC=$(echo "$GATE" | jq -r '.recommendation')
SCORE=$(echo "$GATE" | jq -r '.score')

echo ""
echo "════════════════════════════════════════════"
if [ "$REC" == "SHIP" ]; then
  echo "✓ GATE: PASS (Score: $SCORE)"
  exit 0
elif [ "$REC" == "IMPROVE" ]; then
  echo "⚠ GATE: WARN (Score: $SCORE)"
  echo "  Improvements needed but not blocking"
  exit 0
else
  echo "✗ GATE: FAIL (Score: $SCORE)"
  echo "  Recommendation: $REC"
  exit 1
fi
