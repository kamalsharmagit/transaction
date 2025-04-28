// generateTransactions.js
const fs = require('fs');
const path = require('path');

const Account = require('./models/account.model');
const Transaction = require('./models/transaction.model');
const AuditLog = require('./models/auditLog.model');

// Define working hours (8 AM to 5 PM IST)
const WORKING_HOURS_START = 8;
const WORKING_HOURS_END = 17;
const TOTAL_TRANSACTION_PER_DAY = 180;

/**
 * Adds accounts to the database from a JSON file.
 * @param {string} filePath - Path to the JSON file containing account data.
 */
const addAccountsFromJSON = async (filePath) => {
    try {
        const data = fs.readFileSync(path.resolve(filePath), 'utf-8');
        const accounts = JSON.parse(data);

        if (!Array.isArray(accounts)) {
            throw new Error('JSON data is not an array of accounts.');
        }

        const result = await Account.insertMany(accounts);
        console.log(`Inserted ${result.length} accounts into the database.`);
    } catch (error) {
        console.error('Error adding accounts from JSON:', error);
    }
}

/**
 * Generates a random timestamp within the specified working hours for the current day.
 * @returns {Date} Random timestamp within working hours.
 */
function generateTransactionTime() {
  const now = new Date();
  const start = new Date(now.setFullYear(now.getFullYear(), now.getMonth(), now.getDate(), WORKING_HOURS_START, 0, 0));
  const end = new Date(now.setFullYear(now.getFullYear(), now.getMonth(), now.getDate(), WORKING_HOURS_END, 0, 0));
  const randomTime = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return randomTime;
}

/**
 * Generates and inserts transactions and corresponding audit logs.
 */
async function createTransactions() {
  try {
    // Retrieve all 13 accounts stored in DB
    const accounts = await Account.find();
    const totalAccounts = accounts.length;

    if (totalAccounts === 0) {
      console.log('No accounts found in DB.');
      return;
    }

    const baseTransactions = Math.floor(TOTAL_TRANSACTION_PER_DAY / totalAccounts);
    const remainder = TOTAL_TRANSACTION_PER_DAY % totalAccounts;

    let transactionCount = 0;

    for (let i = 0; i < totalAccounts; i++) {
      const account = accounts[i];
      const transactionsForAccount = i < remainder ? baseTransactions + 1 : baseTransactions;

      for (let j = 0; j < transactionsForAccount; j++) {
        const amount = 100;
        const transactionType = Math.random() < 0.5 ? 'credit' : 'debit';
        const timestamp = generateTransactionTime();

        // Create and save the transaction
        const transaction = new Transaction({
          accountId: account._id,
          amount,
          transactionType,
          timestamp,
          status: 'completed',
          description: `Auto-generated ${transactionType} transaction`,
        });

        await transaction.save();

        // Create and save the audit log
        const auditLog = new AuditLog({
          action: 'Transaction Created',
          timestamp: new Date(),
          details: {
            transactionId: transaction._id,
            accountId: account._id,
            amount,
            transactionType,
            timestamp,
          },
        });

        await auditLog.save();

        transactionCount++;
      }
    }

    console.log(`Successfully inserted ${transactionCount} transactions and corresponding audit logs.`);
  } catch (error) {
    console.error('Error generating transactions:', error);
  }
}

module.exports = {createTransactions, addAccountsFromJSON};
