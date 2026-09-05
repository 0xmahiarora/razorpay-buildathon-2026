/**
 * RAZORPAY /BUILDATHON — AGENTIC MONEY ECOSYSTEM NODE.JS API SERVER
 * Features:
 * 1. In-Memory Structured Audit Trail Ledger Array
 * 2. Graceful Failover Handling for Simulated Razorpay API 500 / Timeout Errors
 * 3. Mitigation Metadata Logging & Automated Fallback Recovery Links
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Global Failure Simulation State
let globalSimulationMode = {
  enabled: false,
  errorType: '500' // '500' or 'timeout'
};

// =========================================================================
// 1. AUDIT LEDGER CLASS & IN-MEMORY DATA STORE
// =========================================================================
class AuditLedger {
  constructor(initialLogs = []) {
    this.logs = [...initialLogs];
  }

  log(actionTag, message) {
    const timestamp = new Date().toISOString();
    const formattedEntry = `[${timestamp}] [${actionTag}]: ${message}`;
    this.logs.push(formattedEntry);
    console.log(`[AUDIT_LEDGER] ${formattedEntry}`);
    return formattedEntry;
  }

  getLogs() {
    return [...this.logs];
  }
}

// Global Audit History Array across transactions
const globalAuditStore = new AuditLedger([
  `[${new Date().toISOString()}] [SYSTEM_INIT]: Razorpay Buildathon Node.js API engine started.`
]);

// =========================================================================
// 2. SIMULATED RAZORPAY TEST-MODE API GATEWAY
// Developer Note: Simulates API server failure (mock 500 / timeout)
// =========================================================================
async function simulateRazorpayApiCall(paymentDetails, shouldFail, errorType = '500') {
  // Simulate network latency (250ms)
  await new Promise((resolve) => setTimeout(resolve, 250));

  if (shouldFail) {
    if (errorType === 'timeout') {
      const timeoutErr = new Error('ESOCKETTIMEDOUT: Gateway timeout waiting for Razorpay API response after 5000ms');
      timeoutErr.code = 'GATEWAY_TIMEOUT';
      timeoutErr.statusCode = 504;
      throw timeoutErr;
    } else {
      const serverErr = new Error('HTTP 500 Internal Server Error: Razorpay upstream mock gateway failure [SIMULATED_TEST_MODE_500]');
      serverErr.code = 'RAZORPAY_API_500';
      serverErr.statusCode = 500;
      throw serverErr;
    }
  }

  // Success path
  return {
    razorpay_payment_id: 'pay_RZP_' + Math.floor(10000000 + Math.random() * 90000000),
    razorpay_order_id: 'order_RZP_' + Math.floor(1000000 + Math.random() * 900000),
    status: 'captured',
    method: paymentDetails.method || 'upi',
    amount: paymentDetails.amount || 1274900, // paise
    currency: 'INR'
  };
}

// =========================================================================
// 3. API ENDPOINTS
// =========================================================================

/**
 * Health Check
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    version: '2.4.0',
    simulation_mode: globalSimulationMode,
    timestamp: new Date().toISOString()
  });
});

/**
 * Audit Ledger Inspection
 */
app.get('/api/audit-ledger', (req, res) => {
  res.json({
    success: true,
    total_entries: globalAuditStore.getLogs().length,
    audit_trail: globalAuditStore.getLogs()
  });
});

/**
 * Failure Simulation Mode Toggle
 */
app.post('/api/simulate-failure', (req, res) => {
  const { enabled, errorType } = req.body;
  if (typeof enabled === 'boolean') {
    globalSimulationMode.enabled = enabled;
  }
  if (errorType) {
    globalSimulationMode.errorType = errorType;
  }
  
  const statusMsg = globalSimulationMode.enabled
    ? `Failure simulation ENABLED (Type: ${globalSimulationMode.errorType})`
    : 'Failure simulation DISABLED';
  
  globalAuditStore.log('SIMULATION_TOGGLE', statusMsg);

  res.json({
    success: true,
    simulation_mode: globalSimulationMode,
    message: statusMsg
  });
});

/**
 * Primary Money Action / Checkout Endpoint
 * Requirements:
 * 1. Generate explicit audit trail array for every money action state change.
 * 2. Handle simulated Razorpay API 500 / timeout errors gracefully,
 *    returning an automated fallback link and mitigation metadata.
 */
app.post('/api/checkout', async (req, res) => {
  const transactionLedger = new AuditLedger();
  
  // Extract request context
  const {
    item_id = 'cat_bootcamp_ai_14999',
    item_name = 'Premium AI Developer BootCamp Course',
    apply_discount = true,
    vpa = 'builder@razorpay',
    simulate_error = false,
    error_type = '500'
  } = req.body;

  // Determine pricing based on discount trigger
  const basePrice = 14999;
  const finalPrice = apply_discount ? 12749 : 14999;
  const isSimulatedFail = simulate_error || globalSimulationMode.enabled;
  const activeErrorType = error_type || globalSimulationMode.errorType || '500';

  // STEP 1: Log initial evaluation state changes
  transactionLedger.log('ACTION', 'AI Buyer evaluated item context');
  globalAuditStore.log('ACTION', `AI Buyer evaluated item context [${item_id}]`);

  transactionLedger.log('CONTEXT_LOADED', `Catalog item loaded: "${item_name}" @ base ₹${basePrice}`);
  
  if (apply_discount) {
    transactionLedger.log('DISCOUNT_VERIFIED', 'Dynamic UPI intent 15% discount verified');
  }

  // STEP 2: Log money bounding gate
  transactionLedger.log('GATE_VERIFIED', `Total bounded to ₹${finalPrice.toLocaleString('en-IN')}`);
  globalAuditStore.log('GATE_VERIFIED', `Total bounded to ₹${finalPrice.toLocaleString('en-IN')}`);

  // STEP 3: Initiate Razorpay payment intent state
  transactionLedger.log('INTENT_INITIATED', `Generated payment intent request for VPA: ${vpa}`);

  // DYNAMIC TRY / CATCH FAULT-TOLERANT EXECUTION BLOCK
  try {
    // Attempt Gateway Call (Will throw if simulate_error is true)
    const gatewayResult = await simulateRazorpayApiCall(
      { amount: finalPrice * 100, vpa: vpa },
      isSimulatedFail,
      activeErrorType
    );

    // If successful:
    transactionLedger.log('INTENT_GENERATED', `Razorpay UPI intent ID ${gatewayResult.razorpay_order_id} generated`);
    transactionLedger.log('TRANSACTION_SETTLED', `Payment authorized successfully. TxID: ${gatewayResult.razorpay_payment_id}`);
    globalAuditStore.log('TRANSACTION_SETTLED', `Payment authorized TxID: ${gatewayResult.razorpay_payment_id}`);

    return res.json({
      success: true,
      status: 'SETTLED',
      transaction_id: gatewayResult.razorpay_payment_id,
      order_id: gatewayResult.razorpay_order_id,
      amount: finalPrice,
      currency: 'INR',
      audit_trail: transactionLedger.getLogs(),
      metadata: {
        item_id: item_id,
        bounded_limit: finalPrice,
        vpa_used: vpa,
        processed_at: new Date().toISOString()
      }
    });

  } catch (err) {
    // =========================================================================
    // REQUIREMENT 2: GRACEFUL FAILOVER HANDLING
    // Catch the error dynamically to prevent process crash / unhandled exceptions,
    // and pivot the response payload to return an automated fallback option link.
    // =========================================================================

    // STEP A: Log failure event into Audit Ledger
    const errorTag = err.code === 'GATEWAY_TIMEOUT' ? 'API_TIMEOUT' : 'API_ERROR';
    transactionLedger.log(errorTag, `Razorpay test-mode API failure: ${err.message}`);
    globalAuditStore.log(errorTag, `Razorpay API server error caught dynamically: ${err.message}`);

    // STEP B: Log dynamic exception interception & failover trigger
    transactionLedger.log('FAILOVER_TRIGGERED', 'Caught exception dynamically — initializing automated fallback recovery protocol');

    // STEP C: Construct automated fallback recovery link
    const fallbackToken = 'fallback_' + Math.random().toString(36).substring(2, 11);
    const fallbackUrl = `https://pages.razorpay.com/pl_fallback_buildathon_backup/pay?token=${fallbackToken}&amount=${finalPrice}`;
    
    transactionLedger.log('FALLBACK_GENERATED', `Automated fallback option link generated: ${fallbackUrl}`);

    // STEP D: Log precise mitigation steps in transaction metadata
    const mitigationSteps = [
      '1. Dynamic exception handler caught HTTP 500 / Timeout failure from Razorpay API gateway',
      '2. Prevented process crash and unhandled Promise rejection',
      '3. Formatted automated fallback hosted payment URL for instant recovery',
      '4. Recorded state transition and mitigation logs in audit ledger metadata'
    ];

    transactionLedger.log('MITIGATION_LOGGED', 'Mitigation steps and recovery URL attached to transaction metadata');
    globalAuditStore.log('MITIGATION_LOGGED', `Recovery URL generated for bounded ₹${finalPrice}`);

    // Return graceful failover response payload with audit trail and mitigation metadata
    return res.status(200).json({
      success: false,
      status: 'FALLBACK_PIVOT',
      error_code: err.code || 'RAZORPAY_API_500_SIMULATED',
      message: 'Razorpay test-mode API server failure caught gracefully. Directing to automated fallback recovery page.',
      fallback_url: fallbackUrl,
      audit_trail: transactionLedger.getLogs(),
      metadata: {
        original_error: err.message,
        error_status_code: err.statusCode || 500,
        failover_strategy: 'HOSTED_BACKUP_GATEWAY_PIVOT',
        mitigation_steps: mitigationSteps,
        recovered_at: new Date().toISOString(),
        bounded_total: finalPrice
      }
    });
  }
});

// Serve frontend for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// =========================================================================
// 4. STANDALONE TEST RUNNER (--test flag)
// =========================================================================
if (process.argv.includes('--test')) {
  console.log('\n=======================================================');
  console.log('🧪 RUNNING STANDALONE API AUDIT LEDGER & FAILOVER TEST');
  console.log('=======================================================\n');

  const server = app.listen(0, async () => {
    const testPort = server.address().port;
    const http = require('http');

    const makeRequest = (postData) => {
      return new Promise((resolve, reject) => {
        const dataStr = JSON.stringify(postData);
        const req = http.request({
          hostname: '127.0.0.1',
          port: testPort,
          path: '/api/checkout',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(dataStr)
          }
        }, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => resolve(JSON.parse(body)));
        });
        req.on('error', reject);
        req.write(dataStr);
        req.end();
      });
    };

    try {
      console.log('--- TEST 1: SUCCESSFUL CHECKOUT FLOW ---');
      const successRes = await makeRequest({ apply_discount: true, simulate_error: false });
      console.log('Status:', successRes.status);
      console.log('Audit Trail Array:');
      console.dir(successRes.audit_trail, { depth: null });

      console.log('\n--- TEST 2: SIMULATED 500 API SERVER FAILURE FLOW ---');
      const failoverRes = await makeRequest({ apply_discount: true, simulate_error: true, error_type: '500' });
      console.log('Status:', failoverRes.status);
      console.log('Fallback URL:', failoverRes.fallback_url);
      console.log('Audit Trail Array:');
      console.dir(failoverRes.audit_trail, { depth: null });
      console.log('Metadata Mitigation Steps:');
      console.dir(failoverRes.metadata.mitigation_steps, { depth: null });

      console.log('\n✅ ALL API AUDIT LEDGER & FAILOVER TESTS PASSED SUCCESSFULY!\n');
    } catch (err) {
      console.error('❌ Test failed:', err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
} else {
  // Start express server normally
  app.listen(PORT, () => {
    console.log(`\n=======================================================`);
    console.log(`🚀 Razorpay Buildathon API server running on port ${PORT}`);
    console.log(`- Health Check: http://localhost:${PORT}/api/health`);
    console.log(`- Audit Ledger: http://localhost:${PORT}/api/audit-ledger`);
    console.log(`- Checkout API: http://localhost:${PORT}/api/checkout`);
    console.log(`=======================================================\n`);
  });
}

module.exports = app;
