const express = require('express');
const router = express.Router();
const Transaction = require('../models/transaction');
const pdf = require('html-pdf');
const path = require('path');

// Get summary statistics by category
router.get('/summary', async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    
    const summary = await Transaction.getSummaryByCategory(startDate, endDate, type);
    res.json(summary || []);
  } catch (error) {
    console.error('Error in /summary route:', error);
    res.status(500).json({ error: error.message, data: [] });
  }
});

// Generate PDF report
router.post('/pdf', async (req, res) => {
  try {
    const { startDate, endDate, transactions } = req.body;
    
    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({ error: 'Valid transactions data is required' });
    }

    let totalIncome = 0;
    let totalExpense = 0;
    
    transactions.forEach(t => {
      if (t.type === 'income') {
        totalIncome += parseFloat(t.amount);
      } else {
        totalExpense += parseFloat(t.amount);
      }
    });

    const balance = totalIncome - totalExpense;
    
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Expense Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
          }
          h1 {
            color: #333;
            text-align: center;
          }
          .header {
            margin-bottom: 20px;
          }
          .summary {
            margin: 20px 0;
            padding: 10px;
            background-color: #f5f5f5;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
            font-weight: bold;
          }
          .income {
            color: green;
          }
          .expense {
            color: red;
          }
          .balance {
            font-weight: bold;
            font-size: 18px;
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Expense Report</h1>
          <p><strong>Period:</strong> ${startDate} to ${endDate}</p>
        </div>
          <div class="summary">
          <p><strong>Total Income:</strong> ₹${totalIncome.toFixed(2)}</p>
          <p><strong>Total Expense:</strong> ₹${totalExpense.toFixed(2)}</p>
          <p class="balance">Balance: ₹${balance.toFixed(2)}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map(t => `
              <tr>
                <td>${t.date}</td>
                <td>${t.description}</td>
                <td>${t.category_name || 'None'}</td>
                <td>${t.type}</td>                <td class="${t.type === 'income' ? 'income' : 'expense'}">
                  ${t.type === 'income' ? '+' : '-'}₹${parseFloat(t.amount).toFixed(2)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    // PDF options
    const options = {
      format: 'A4',
      border: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    };

    const filename = `expense-report-${Date.now()}.pdf`;
    const outputPath = path.join(__dirname, '..', 'public', 'reports', filename);

    const fs = require('fs');
    const dir = path.join(__dirname, '..', 'public', 'reports');
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    pdf.create(htmlContent, options).toFile(outputPath, (err, result) => {
      if (err) {
        console.error('Error generating PDF:', err);
        return res.status(500).json({ error: 'Error generating PDF report' });
      }
      
      res.json({ 
        url: `/reports/${filename}`,
        message: 'PDF report generated successfully' 
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
