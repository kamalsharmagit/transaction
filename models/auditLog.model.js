const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  details: {
    type: mongoose.Schema.Types.Mixed // Allows storing any type of data
  }
});

// Indexes
auditLogSchema.index({ timestamp: -1, details: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
