const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const AUDIT_FILE = path.join(__dirname, 'audit_ledger_store.json');
const HMAC_SECRET = process.env.HMAC_SECRET || 'razorpay_buildathon_agentic_secret_key_2026';

class CryptographicAuditStore {
  constructor() {
    this.logs = [];
    this.initStore();
  }

  initStore() {
    // Seed initial event if empty
    if (this.logs.length === 0) {
      this.recordEvent({
        tag: 'TAG-GATEWAY',
        type: 'SYSTEM_INIT',
        message: 'Razorpay Agentic Commerce API Engine started. Cryptographic HMAC Ledger active.',
        json: {
          system: 'Razorpay Buildathon Track 01 Node Engine',
          status: 'INITIALIZED',
          policy_version: 'v2.4-strict'
        }
      });
    }
  }

  generateHmacSignature(payload) {
    const dataString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return 'sha256_' + crypto.createHmac('sha256', HMAC_SECRET).update(dataString).digest('hex').substring(0, 24);
  }

  recordEvent(eventData) {
    const timestamp = new Date().toISOString();
    const eventId = 'evt_' + crypto.randomBytes(4).toString('hex');
    
    const hmacSignature = this.generateHmacSignature({
      id: eventId,
      timestamp,
      type: eventData.type,
      json: eventData.json
    });

    const logEntry = {
      id: eventId,
      timestamp: timestamp,
      tag: eventData.tag || 'TAG-GATEWAY',
      type: eventData.type || 'EVENT_LOG',
      message: eventData.message || '',
      json: {
        ...eventData.json,
        hmac_signature: hmacSignature
      }
    };

    this.logs.unshift(logEntry);
    
    // Keep max 200 logs in memory
    if (this.logs.length > 200) {
      this.logs.pop();
    }

    try {
      fs.writeFileSync(AUDIT_FILE, JSON.stringify(this.logs, null, 2));
    } catch (e) {
      // Ignore file write errors on read-only environments
    }

    console.log(`[AUDIT_LEDGER] [${logEntry.tag}] [${logEntry.type}]: ${logEntry.message}`);
    return logEntry;
  }

  getLogs(filter = 'ALL') {
    if (filter === 'ALL') return this.logs;
    if (filter === 'GUARDRAIL') return this.logs.filter(l => l.tag === 'TAG-GUARDRAIL');
    if (filter === 'MONEY') return this.logs.filter(l => l.tag === 'TAG-MONEY');
    if (filter === 'FAILOVER') return this.logs.filter(l => l.tag === 'TAG-FAILOVER');
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
    this.initStore();
  }
}

const auditStore = new CryptographicAuditStore();
module.exports = auditStore;
