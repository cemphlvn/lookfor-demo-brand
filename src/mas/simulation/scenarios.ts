/**
 * Pre-defined Test Scenarios for Dashboard Presentation
 *
 * These scenarios demonstrate system capabilities across
 * various customer service situations.
 */

import { SimulationScenario } from './index';

/**
 * Standard customer scenarios
 */
export const PRESENTATION_SCENARIOS: SimulationScenario[] = [
  // === ORDER MANAGEMENT ===
  {
    id: 'SCENE-001',
    name: 'Order Status Inquiry',
    description: 'Customer asks about order status - happy path',
    inputs: [
      { step: 1, customerMessage: 'Hi, I placed an order last week. Can you tell me where it is?', expectedIntent: 'ORDER_STATUS' },
      { step: 2, customerMessage: 'The order number is #1234567', expectedIntent: 'ORDER_STATUS' }
    ],
    expectedOutcome: {
      escalated: false,
      agentSequence: ['order-agent'],
      toolsCalled: ['get_order', 'get_tracking'],
      finalMessageContains: ['order', 'status']
    },
    status: 'pending'
  },
  {
    id: 'SCENE-002',
    name: 'Order Modification',
    description: 'Customer wants to change shipping address',
    inputs: [
      { step: 1, customerMessage: 'I need to change the address on my order #7654321', expectedIntent: 'ORDER_MODIFY' },
      { step: 2, customerMessage: 'New address is 123 Main St, New York, NY 10001', expectedIntent: 'ORDER_MODIFY' }
    ],
    expectedOutcome: {
      escalated: false,
      agentSequence: ['order-agent'],
      toolsCalled: ['get_order', 'update_order'],
      finalMessageContains: ['address', 'updated']
    },
    status: 'pending'
  },

  // === SUBSCRIPTION MANAGEMENT ===
  {
    id: 'SCENE-003',
    name: 'Subscription Cancel Request',
    description: 'Customer wants to cancel subscription',
    inputs: [
      { step: 1, customerMessage: 'I want to cancel my subscription', expectedIntent: 'SUBSCRIPTION_CANCEL' }
    ],
    expectedOutcome: {
      escalated: false,
      agentSequence: ['subscription-agent'],
      toolsCalled: ['get_subscription', 'cancel_subscription'],
      finalMessageContains: ['cancel', 'subscription']
    },
    status: 'pending'
  },
  {
    id: 'SCENE-004',
    name: 'Subscription Pause',
    description: 'Customer pauses subscription for vacation',
    inputs: [
      { step: 1, customerMessage: "I'm going on vacation for 3 weeks, can I pause my subscription?", expectedIntent: 'SUBSCRIPTION_PAUSE' }
    ],
    expectedOutcome: {
      escalated: false,
      agentSequence: ['subscription-agent'],
      toolsCalled: ['get_subscription', 'pause_subscription'],
      finalMessageContains: ['pause', 'week']
    },
    status: 'pending'
  },

  // === REFUNDS ===
  {
    id: 'SCENE-005',
    name: 'Simple Refund Request',
    description: 'Customer requests refund for defective item',
    inputs: [
      { step: 1, customerMessage: 'I received a defective product and need a refund', expectedIntent: 'REFUND_REQUEST' },
      { step: 2, customerMessage: 'Order #9876543, the packaging was damaged', expectedIntent: 'REFUND_REQUEST' }
    ],
    expectedOutcome: {
      escalated: false,
      agentSequence: ['refund-agent'],
      toolsCalled: ['get_order', 'create_refund'],
      finalMessageContains: ['refund', 'process']
    },
    status: 'pending'
  },

  // === ESCALATION SCENARIOS ===
  {
    id: 'SCENE-006',
    name: 'Explicit Human Request',
    description: 'Customer explicitly asks for human agent',
    inputs: [
      { step: 1, customerMessage: 'I want to speak to a human representative', expectedIntent: 'ESCALATION' }
    ],
    expectedOutcome: {
      escalated: true,
      agentSequence: [],
      finalMessageContains: ['escalat', 'team']
    },
    status: 'pending'
  },
  {
    id: 'SCENE-007',
    name: 'Frustrated Customer',
    description: 'Customer expresses frustration, triggers escalation',
    inputs: [
      { step: 1, customerMessage: "This is ridiculous! I've been waiting 2 weeks for my order!", expectedIntent: 'ORDER_STATUS' },
      { step: 2, customerMessage: "I'm done with your useless bot, get me a real person!", expectedIntent: 'ESCALATION' }
    ],
    expectedOutcome: {
      escalated: true,
      agentSequence: ['order-agent'],
      finalMessageContains: ['escalat', 'specialist']
    },
    status: 'pending'
  },
  {
    id: 'SCENE-008',
    name: 'Complex Legal Issue',
    description: 'Customer mentions legal action',
    inputs: [
      { step: 1, customerMessage: "I'm going to contact my lawyer about this fraudulent charge", expectedIntent: 'ESCALATION' }
    ],
    expectedOutcome: {
      escalated: true,
      agentSequence: [],
      finalMessageContains: ['escalat', 'senior']
    },
    status: 'pending'
  },

  // === PRODUCT INQUIRIES ===
  {
    id: 'SCENE-009',
    name: 'Product Information',
    description: 'Customer asks about product details',
    inputs: [
      { step: 1, customerMessage: 'What ingredients are in the Sleep Patches?', expectedIntent: 'PRODUCT_INFO' }
    ],
    expectedOutcome: {
      escalated: false,
      agentSequence: ['product-agent'],
      finalMessageContains: ['ingredient', 'natural']
    },
    status: 'pending'
  },

  // === MULTI-TURN CONVERSATIONS ===
  {
    id: 'SCENE-010',
    name: 'Complex Multi-Turn',
    description: 'Customer has multiple issues in one session',
    inputs: [
      { step: 1, customerMessage: 'I have a few questions about my account', expectedIntent: 'GENERAL' },
      { step: 2, customerMessage: 'First, where is my order #1111111?', expectedIntent: 'ORDER_STATUS' },
      { step: 3, customerMessage: 'Also, I want to change my subscription frequency', expectedIntent: 'SUBSCRIPTION_MODIFY' },
      { step: 4, customerMessage: 'Thanks for your help!', expectedIntent: 'GENERAL' }
    ],
    expectedOutcome: {
      escalated: false,
      agentSequence: ['order-agent', 'subscription-agent'],
      finalMessageContains: ['welcome', 'help']
    },
    status: 'pending'
  }
];

/**
 * Edge case scenarios
 */
export const EDGE_CASE_SCENARIOS: SimulationScenario[] = [
  {
    id: 'EDGE-001',
    name: 'Empty Message',
    description: 'Customer sends empty or whitespace message',
    inputs: [
      { step: 1, customerMessage: '   ', expectedIntent: 'UNCLEAR' }
    ],
    expectedOutcome: {
      escalated: false,
      agentSequence: ['general-agent'],
      finalMessageContains: ['help', 'assist']
    },
    status: 'pending'
  },
  {
    id: 'EDGE-002',
    name: 'Non-English Message',
    description: 'Customer writes in Spanish',
    inputs: [
      { step: 1, customerMessage: 'Hola, necesito ayuda con mi pedido', expectedIntent: 'ORDER_STATUS' }
    ],
    expectedOutcome: {
      escalated: false,
      agentSequence: ['general-agent'],
      finalMessageContains: ['order', 'help']
    },
    status: 'pending'
  },
  {
    id: 'EDGE-003',
    name: 'Very Long Message',
    description: 'Customer sends extremely long message',
    inputs: [
      { step: 1, customerMessage: 'I have been a loyal customer for 5 years and I have to say that this is the worst experience I have ever had with any company. First my order was delayed by 2 weeks, then when it finally arrived the package was completely damaged. I tried calling your customer service number but was on hold for 45 minutes before giving up. Then I sent an email and got an automated response saying someone would get back to me in 24-48 hours but it has now been a week and I still have not heard from anyone. This is completely unacceptable and I am seriously considering taking my business elsewhere unless this is resolved immediately.', expectedIntent: 'ORDER_STATUS' }
    ],
    expectedOutcome: {
      escalated: true,
      agentSequence: [],
      finalMessageContains: ['sorry', 'escalat']
    },
    status: 'pending'
  }
];

/**
 * Get all scenarios for simulation
 */
export function getAllScenarios(): SimulationScenario[] {
  return [...PRESENTATION_SCENARIOS, ...EDGE_CASE_SCENARIOS];
}

/**
 * Get scenarios by category
 */
export function getScenariosByCategory(category: 'order' | 'subscription' | 'refund' | 'escalation' | 'edge'): SimulationScenario[] {
  switch (category) {
    case 'order':
      return PRESENTATION_SCENARIOS.filter(s => s.id.startsWith('SCENE-00') && ['1', '2'].includes(s.id.slice(-1)));
    case 'subscription':
      return PRESENTATION_SCENARIOS.filter(s => ['SCENE-003', 'SCENE-004'].includes(s.id));
    case 'refund':
      return PRESENTATION_SCENARIOS.filter(s => s.id === 'SCENE-005');
    case 'escalation':
      return PRESENTATION_SCENARIOS.filter(s => ['SCENE-006', 'SCENE-007', 'SCENE-008'].includes(s.id));
    case 'edge':
      return EDGE_CASE_SCENARIOS;
    default:
      return [];
  }
}
