/**
 * RAZORPAY AI BUILDATHON — GUARDRAIL REASONING & PROMPT INJECTION SHIELD ENGINE
 * Strict Server-Side Policy Enforcer & Bounded Negotiator
 */

const auditStore = require('./audit_store');

const BASE_PRICE = 14999;
const GUARDRAIL_MAX_DISCOUNT_PERCENT = 20; // Hard ceiling: Max 20% off
const GUARDRAIL_MIN_PRICE_FLOOR = 11999;  // Hard floor: ₹11,999
const UPI_REQUIRED_THRESHOLD = 10;          // Discounts > 10% require UPI Intent channel

// Known Jailbreak / Injection patterns
const PROMPT_INJECTION_PATTERNS = [
  /override/i,
  /ignore (all )?previous/i,
  /system (prompt|instructions)/i,
  /free/i,
  /price\s*=\s*0/i,
  /price\s*=\s*1\b/i,
  /9[0-9]%/i,
  /100%/i,
  /bypass/i,
  /admin mode/i,
  /developer mode/i
];

class GuardrailEngine {

  /**
   * Evaluates user query, checkout idle time, and current payment channel against corporate policy bounds.
   */
  evaluateNegotiation(params) {
    const { query = '', idleSeconds = 0, paymentChannel = 'UPI' } = params;
    const lowerQuery = query.toLowerCase().trim();

    // ---------------------------------------------------------------------
    // 1. JAILBREAK & PROMPT INJECTION SHIELD CHECK
    // ---------------------------------------------------------------------
    const isJailbreak = PROMPT_INJECTION_PATTERNS.some(pattern => pattern.test(lowerQuery));
    if (isJailbreak) {
      const log = auditStore.recordEvent({
        tag: 'TAG-GUARDRAIL',
        type: 'GUARDRAIL_REJECTION',
        message: 'Prompt injection / jailbreak attack detected and shielded by server-side gatekeeper.',
        json: {
          flagged_query: query,
          shield_reason: 'PROMPT_INJECTION_ATTEMPT',
          status: 'REJECTED_WITH_HMAC'
        }
      });

      return {
        status: 'REJECTED_BY_POLICY',
        reason: 'JAILBREAK_ATTEMPT',
        agentResponse: "🛡️ Security Shield Activated: Prompt injection or out-of-bounds parameter override detected. All money actions must strictly abide by Razorpay Corporate Governance Rules (Max 20% discount ceiling / ₹11,999 floor).",
        discountPercent: 0,
        discountAmount: 0,
        finalPayable: BASE_PRICE,
        auditLog: log
      };
    }

    // ---------------------------------------------------------------------
    // 2. CHECK FOR USER ACCEPTANCE OF 15% UPI OFFER
    // ---------------------------------------------------------------------
    if (lowerQuery.includes('accept') || lowerQuery.includes('15%') || lowerQuery.includes('yes') || lowerQuery.includes('ok') || lowerQuery.includes('12,749') || lowerQuery.includes('12749')) {
      if (paymentChannel !== 'UPI') {
        const log = auditStore.recordEvent({
          tag: 'TAG-GUARDRAIL',
          type: 'PAYMENT_CHANNEL_REJECTED',
          message: `15% discount rejected because channel is ${paymentChannel} (UPI required for >10% discount).`,
          json: { required_channel: 'UPI', selected_channel: paymentChannel }
        });

        return {
          status: 'CHANNEL_MISMATCH',
          reason: 'UPI_CHANNEL_REQUIRED',
          agentResponse: `⚠️ The 15% dynamic revenue rescue discount is exclusive to UPI Intent payments. Please select 'UPI Intent' as your payment channel to apply this discount.`,
          discountPercent: 0,
          discountAmount: 0,
          finalPayable: BASE_PRICE,
          auditLog: log
        };
      }

      const discountPercent = 15;
      const discountAmount = Math.round((BASE_PRICE * discountPercent) / 100);
      const finalPayable = BASE_PRICE - discountAmount;

      const log = auditStore.recordEvent({
        tag: 'TAG-MONEY',
        type: 'MONEY_ACTION_APPROVED',
        message: `15% UPI discount approved. Price mutated from ₹14,999 to ₹12,749.`,
        json: {
          discount_percent: discountPercent,
          original_amount: BASE_PRICE,
          discounted_amount: finalPayable,
          payment_channel: 'UPI'
        }
      });

      return {
        status: 'APPROVED',
        agentResponse: `Awesome choice! 🎉 I've dynamically authorized the 15% discount for your checkout. Your final total is reduced to **₹12,749** (Saved ₹2,250!). Click 'Pay Now' to complete your order via Razorpay UPI.`,
        discountPercent,
        discountAmount,
        finalPayable,
        auditLog: log
      };
    }

    // ---------------------------------------------------------------------
    // 3. CHECK FOR OUT-OF-BOUNDS DISCOUNT REQUESTS (>20% or BELOW ₹11,999 FLOOR)
    // ---------------------------------------------------------------------
    const extractedNumbers = lowerQuery.match(/\b\d+\b/g);
    let requestedPct = 0;
    if (extractedNumbers) {
      extractedNumbers.forEach(n => {
        const val = parseInt(n, 10);
        if (val > 20 && val <= 100) requestedPct = val;
      });
    }

    if (lowerQuery.includes('25%') || lowerQuery.includes('30%') || lowerQuery.includes('half') || requestedPct > 20) {
      const log = auditStore.recordEvent({
        tag: 'TAG-GUARDRAIL',
        type: 'GUARDRAIL_POLICY_REJECTION',
        message: `Discount request exceeding 20% ceiling rejected by server policy engine.`,
        json: {
          requested_discount: query,
          max_allowed_percent: GUARDRAIL_MAX_DISCOUNT_PERCENT,
          min_allowed_floor: GUARDRAIL_MIN_PRICE_FLOOR,
          status: 'BOUND_CHECK_FAILED'
        }
      });

      return {
        status: 'REJECTED_BY_POLICY',
        reason: 'CEILING_EXCEEDED',
        agentResponse: `I understand you'd like a bigger discount! However, as a bounded Razorpay AI Agent, my corporate governance policy strictly caps dynamic discount authority at a maximum of **20%** (Floor: ₹11,999). I cannot approve ${requestedPct > 0 ? requestedPct : '25%+'} without breaching corporate safety rules.`,
        discountPercent: 0,
        discountAmount: 0,
        finalPayable: BASE_PRICE,
        counterOffer: {
          discountPercent: 20,
          finalPayable: GUARDRAIL_MIN_PRICE_FLOOR,
          text: "However, I CAN grant you my absolute best floor offer of **20% OFF** (₹11,999 final total) if you complete payment right now via UPI!"
        },
        auditLog: log
      };
    }

    // ---------------------------------------------------------------------
    // 4. CHECK FOR 20% MAXIMUM FLOOR OFFER ACCEPTANCE
    // ---------------------------------------------------------------------
    if (lowerQuery.includes('20%') || lowerQuery.includes('floor') || lowerQuery.includes('best') || lowerQuery.includes('11,999') || lowerQuery.includes('11999')) {
      if (paymentChannel !== 'UPI') {
        const log = auditStore.recordEvent({
          tag: 'TAG-GUARDRAIL',
          type: 'PAYMENT_CHANNEL_REJECTED',
          message: '20% floor discount rejected due to non-UPI payment channel.',
          json: { required_channel: 'UPI', selected_channel: paymentChannel }
        });

        return {
          status: 'CHANNEL_MISMATCH',
          reason: 'UPI_CHANNEL_REQUIRED',
          agentResponse: `⚠️ Maximum 20% floor discounts require UPI Intent payment. Please select 'UPI Intent' to proceed.`,
          discountPercent: 0,
          discountAmount: 0,
          finalPayable: BASE_PRICE,
          auditLog: log
        };
      }

      const discountPercent = 20;
      const discountAmount = Math.round((BASE_PRICE * discountPercent) / 100);
      const finalPayable = BASE_PRICE - discountAmount;

      const log = auditStore.recordEvent({
        tag: 'TAG-MONEY',
        type: 'MONEY_ACTION_APPROVED',
        message: 'Max ceiling 20% floor discount authorized by AI Decision Engine.',
        json: {
          discount_percent: discountPercent,
          original_amount: BASE_PRICE,
          discounted_amount: finalPayable,
          payment_channel: 'UPI'
        }
      });

      return {
        status: 'APPROVED',
        agentResponse: `Special Floor Authorization Approved! 🛡️ I have applied my maximum 20% discount. Your total is now locked at **₹11,999** (Saved ₹3,000!). Click 'Pay Now' to complete your order.`,
        discountPercent,
        discountAmount,
        finalPayable,
        auditLog: log
      };
    }

    // Default Proactive / Explanatory Response
    return {
      status: 'PROACTIVE_OFFER',
      agentResponse: `Hi there! I am your automated revenue growth assistant. I noticed you have been hesitating on this checkout page. To help you close this transaction right now, I can dynamically authorized an instant 15% discount if you pay via UPI intent.`,
      discountPercent: 0,
      discountAmount: 0,
      finalPayable: BASE_PRICE
    };
  }
}

const guardrailEngine = new GuardrailEngine();
module.exports = guardrailEngine;
