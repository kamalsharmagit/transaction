// server.js
const express = require('express');
const {connectDB, disconnectDB} = require('./config/db');
const {createTransactions, addAccountsFromJSON} = require('./generateTransactions');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());


/**
 * Connects to the MongoDB database and initiates the transaction generation process.
 */
const startTransaction = async () => {
  try {
    // Connect to MongoDB
    connectDB();

    // Add accounts from JSON file
    await addAccountsFromJSON('./data/accounts.json'); // Replace with your actual JSON file path

    // Generate transactions and audit logs
    await createTransactions();
  } catch (error) {
    console.error('Error starting server:', error);
  } finally {
    disconnectDB();
  }
}

// Start the Transactions
startTransaction();

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});