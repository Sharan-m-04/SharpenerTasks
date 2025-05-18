document.addEventListener('DOMContentLoaded', function() {
  const state = {
    currentDate: new Date(),
    currentView: 'day',
    currentChartType: 'expense',
    transactions: [],
    categories: [],
    selectedTransactionType: 'expense'
  };

  const elements = {
    prevDateBtn: document.getElementById('prevDate'),
    nextDateBtn: document.getElementById('nextDate'),
    currentDateEl: document.getElementById('currentDate'),
    prevMonthBtn: document.getElementById('prevMonth'),
    nextMonthBtn: document.getElementById('nextMonth'),
    currentMonthEl: document.getElementById('currentMonth'),
    prevYearBtn: document.getElementById('prevYear'),
    nextYearBtn: document.getElementById('nextYear'),
    currentYearEl: document.getElementById('currentYear'),
    viewBtns: document.querySelectorAll('.view-btn'),
    dayView: document.getElementById('dayView'),
    monthView: document.getElementById('monthView'),
    yearView: document.getElementById('yearView'),
    chartView: document.getElementById('chartView'),
    transactionList: document.getElementById('transactionList'),
    monthlyTransactionList: document.getElementById('monthlyTransactionList'),
    yearlyTransactionList: document.getElementById('yearlyTransactionList'),
    incomeAmount: document.getElementById('incomeAmount'),
    expenseAmount: document.getElementById('expenseAmount'),
    balanceAmount: document.getElementById('balanceAmount'),
    chartBtns: document.querySelectorAll('.chart-btn'),
    pieChart: document.getElementById('pieChart'),
    noDataMessage: document.querySelector('.no-data-message'),
    addButton: document.getElementById('addButton'),
    addModal: document.getElementById('addModal'),
    closeModalBtns: document.querySelectorAll('.close-modal'),
    transactionForm: document.getElementById('transactionForm'),
    typeBtns: document.querySelectorAll('.type-btn'),
    amountInput: document.getElementById('amount'),
    descriptionInput: document.getElementById('description'),
    categorySelect: document.getElementById('category'),
    dateInput: document.getElementById('date'),
    exportButton: document.getElementById('exportButton'),
    exportModal: document.getElementById('exportModal'),
    exportForm: document.getElementById('exportForm'),
    startDateInput: document.getElementById('startDate'),
    endDateInput: document.getElementById('endDate'),
    pdfModal: document.getElementById('pdfModal'),
    pdfFrame: document.getElementById('pdfFrame'),
    downloadPdf: document.getElementById('downloadPdf')
  };

  let pieChart = null;

  function init() {
    loadCategories();
    updateDateDisplay();
    updateMonthDisplay();
    updateYearDisplay();
    setToday();
    setupEventListeners();
  }
  function setupEventListeners() {
    elements.prevDateBtn.addEventListener('click', goToPreviousDay);
    elements.nextDateBtn.addEventListener('click', goToNextDay);
    elements.prevMonthBtn.addEventListener('click', goToPreviousMonth);
    elements.nextMonthBtn.addEventListener('click', goToNextMonth);
    elements.prevYearBtn.addEventListener('click', goToPreviousYear);
    elements.nextYearBtn.addEventListener('click', goToNextYear);
    elements.viewBtns.forEach(btn => {
      btn.addEventListener('click', () => switchView(btn.dataset.view));
    });
    
    elements.chartBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        state.currentChartType = btn.dataset.type;
        updateActiveChartButton();
        loadChartData();
      });
    });

    elements.addButton.addEventListener('click', openAddModal);
    elements.exportButton.addEventListener('click', openExportModal);
    elements.closeModalBtns.forEach(btn => {
      btn.addEventListener('click', closeModals);
    });
    
    elements.typeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        state.selectedTransactionType = btn.dataset.type;
        updateActiveTypeButton();
      });
    });
    
    elements.transactionForm.addEventListener('submit', handleTransactionSubmit);
    elements.exportForm.addEventListener('submit', handleExportSubmit);
    
    window.addEventListener('click', (e) => {
      if (e.target === elements.addModal) {
        closeModals();
      }
    });
  }

  function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  
  function formatDateDisplay(date) {
    const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }
  
  function formatMonthDisplay(date) {
    const options = { month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }
  
  function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  }
  
  function updateDateDisplay() {
    if (isToday(state.currentDate)) {
      elements.currentDateEl.textContent = 'Today';
    } else {
      elements.currentDateEl.textContent = formatDateDisplay(state.currentDate);
    }
    elements.dateInput.value = formatDate(state.currentDate);
  }
  
  function updateMonthDisplay() {
    elements.currentMonthEl.textContent = formatMonthDisplay(state.currentDate);
  }
  
  function updateYearDisplay() {
    elements.currentYearEl.textContent = state.currentDate.getFullYear();
  }
  
  function setToday() {
    state.currentDate = new Date();
    updateDateDisplay()
    updateMonthDisplay();
    updateYearDisplay()
    loadTransactions()
  }
  
  function goToPreviousDay() {
    const newDate = new Date(state.currentDate);
    newDate.setDate(newDate.getDate() - 1);
    state.currentDate = newDate;
    updateDateDisplay();
    loadTransactions();
  }
  
  function goToNextDay() {
    const newDate = new Date(state.currentDate);
    newDate.setDate(newDate.getDate() + 1);
    state.currentDate = newDate;
    updateDateDisplay();
    loadTransactions();
  }
  
  function goToPreviousMonth() {
    const newDate = new Date(state.currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    state.currentDate = newDate;
    updateMonthDisplay();
    loadMonthlyTransactions();
  }
  
  function goToNextMonth() {
    const newDate = new Date(state.currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    state.currentDate = newDate;
    updateMonthDisplay();
    loadMonthlyTransactions();
  }
  
  function goToPreviousYear() {
    const newDate = new Date(state.currentDate);
    newDate.setFullYear(newDate.getFullYear() - 1);
    state.currentDate = newDate;
    updateYearDisplay();
    loadYearlyTransactions();
  }
  
  function goToNextYear() {
    const newDate = new Date(state.currentDate);
    newDate.setFullYear(newDate.getFullYear() + 1);
    state.currentDate = newDate;
    updateYearDisplay();
    loadYearlyTransactions();
  }

  // View switching
  function switchView(view) {
    state.currentView = view;
    
    elements.viewBtns.forEach(btn => {
      if (btn.dataset.view === view) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    elements.dayView.classList.add('hidden');
    elements.monthView.classList.add('hidden');
    elements.yearView.classList.add('hidden');
    elements.chartView.classList.add('hidden');
    
    switch (view) {
      case 'day':
        elements.dayView.classList.remove('hidden');
        loadTransactions();
        break;
      case 'month':
        elements.monthView.classList.remove('hidden');
        loadMonthlyTransactions();
        break;
      case 'year':
        elements.yearView.classList.remove('hidden');
        loadYearlyTransactions();
        break;
      case 'chart':
        elements.chartView.classList.remove('hidden');
        loadChartData();
        break;
    }
  }

  // Update active buttons
  function updateActiveTypeButton() {
    elements.typeBtns.forEach(btn => {
      if (btn.dataset.type === state.selectedTransactionType) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
  
  function updateActiveChartButton() {
    elements.chartBtns.forEach(btn => {
      if (btn.dataset.type === state.currentChartType) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });  }

  function openAddModal() {
    elements.dateInput.value = formatDate(state.currentDate);
    elements.addModal.style.display = 'block';
  }
  
  function openExportModal() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    elements.startDateInput.value = formatDate(firstDayOfMonth);
    elements.endDateInput.value = formatDate(today);
    
    elements.exportModal.style.display = 'block';
  }
  
  function closeModals() {
    elements.addModal.style.display = 'none';
    elements.exportModal.style.display = 'none';
    elements.pdfModal.style.display = 'none';
    elements.transactionForm.reset();
  }

  async function loadCategories() {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      state.categories = data;

      elements.categorySelect.innerHTML = '<option value="">No Category</option>';
      data.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        elements.categorySelect.appendChild(option);
      });
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }
    async function loadTransactions() {
    try {
      const date = formatDate(state.currentDate);
      const response = await fetch(`/api/expenses/date/${date}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      state.transactions = Array.isArray(data) ? data : [];
      renderTransactionList();
      updateSummary(state.transactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      state.transactions = [];
      renderTransactionList(); // Render empty state
      updateSummary([]);
    }
  }
  
  async function loadMonthlyTransactions() {
    try {
      const year = state.currentDate.getFullYear();
      const month = state.currentDate.getMonth() + 1;
      const response = await fetch(`/api/expenses/month/${year}/${month}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const transactions = Array.isArray(data) ? data : [];
      renderMonthlyTransactionList(transactions);
      updateSummary(transactions);
    } catch (error) {
      console.error('Error loading monthly transactions:', error);
      renderMonthlyTransactionList([]);
      updateSummary([]);
    }
  }
  
  async function loadYearlyTransactions() {
    try {
      const year = state.currentDate.getFullYear();
      const response = await fetch(`/api/expenses/year/${year}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const transactions = Array.isArray(data) ? data : [];
      renderYearlyTransactionList(transactions);
      updateSummary(transactions);
    } catch (error) {
      console.error('Error loading yearly transactions:', error);
      renderYearlyTransactionList([]);
      updateSummary([]);
    }
  }
    async function loadChartData() {
    try {
      const year = state.currentDate.getFullYear();
      const month = state.currentDate.getMonth() + 1;
      
      // Get first and last day of the month
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
      
      const response = await fetch(`/api/reports/summary?startDate=${startDate}&endDate=${endDate}&type=${state.currentChartType}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      renderChart(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading chart data:', error);
      renderChart([]);
    }
  }

  function renderTransactionList() {
    const transactions = state.transactions;
    elements.transactionList.innerHTML = '';
    
    if (transactions.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      emptyState.textContent = 'No transactions for today. Click the + button to add.';
      elements.transactionList.appendChild(emptyState);
      return;
    }
    
    transactions.forEach(transaction => {
      const item = createTransactionItem(transaction);
      elements.transactionList.appendChild(item);
    });
  }
  
  function renderMonthlyTransactionList(transactions) {
    elements.monthlyTransactionList.innerHTML = '';
    
    if (transactions.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      emptyState.textContent = 'No transactions for this month.';
      elements.monthlyTransactionList.appendChild(emptyState);
      return;
    }
    
    const groupedByDate = groupTransactionsByDate(transactions);
    
    Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a)).forEach(date => {
      const dateHeader = document.createElement('div');
      dateHeader.className = 'date-header';
      dateHeader.textContent = new Date(date).toLocaleDateString('en-US', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      });
      elements.monthlyTransactionList.appendChild(dateHeader);
      
      groupedByDate[date].forEach(transaction => {
        const item = createTransactionItem(transaction);
        elements.monthlyTransactionList.appendChild(item);
      });
    });
  }
  
  function renderYearlyTransactionList(transactions) {
    elements.yearlyTransactionList.innerHTML = '';
    
    if (transactions.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      emptyState.textContent = 'No transactions for this year.';
      elements.yearlyTransactionList.appendChild(emptyState);
      return;
    }
    
    const groupedByMonth = groupTransactionsByMonth(transactions);
    for (let i = 11; i >= 0; i--) {
      const monthName = new Date(state.currentDate.getFullYear(), i, 1)
        .toLocaleDateString('en-US', { month: 'long' });
      
      if (groupedByMonth[i]) {
        const monthHeader = document.createElement('div');
        monthHeader.className = 'month-header';
        monthHeader.textContent = monthName;
        elements.yearlyTransactionList.appendChild(monthHeader);
        
        let monthIncome = 0;
        let monthExpense = 0;
        
        groupedByMonth[i].forEach(transaction => {
          if (transaction.type === 'income') {
            monthIncome += parseFloat(transaction.amount);
          } else {
            monthExpense += parseFloat(transaction.amount);
          }
        });
          const monthSummary = document.createElement('div');
        monthSummary.className = 'month-summary';
        monthSummary.innerHTML = `
          <div class="income">Income: ₹${monthIncome.toFixed(2)}</div>
          <div class="expense">Expense: ₹${monthExpense.toFixed(2)}</div>
          <div class="balance">Balance: ₹${(monthIncome - monthExpense).toFixed(2)}</div>
        `;
        elements.yearlyTransactionList.appendChild(monthSummary);
      }
    }
  }
  
  function renderChart(data) {
    if (pieChart) {
      pieChart.destroy();
    }
    
    if (data.length === 0) {
      elements.noDataMessage.classList.remove('hidden');
      return;
    }
    
    elements.noDataMessage.classList.add('hidden');
    
    const labels = data.map(item => item.name || 'Uncategorized');
    const values = data.map(item => parseFloat(item.total));
    const colors = data.map(item => item.color || '#808080');
    
    const ctx = elements.pieChart.getContext('2d');
    
    pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
          },
          tooltip: {
            callbacks: {              label: function(context) {
                const value = context.raw;
                const total = context.chart.getDatasetMeta(0).total;
                const percentage = Math.round((value / total) * 100);
                return `₹${value.toFixed(2)} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }
  
  function createTransactionItem(transaction) {
    const item = document.createElement('div');
    item.className = 'transaction-item';
    
    const categoryDot = transaction.color 
      ? `<span class="category-dot" style="background-color:${transaction.color}"></span>` 
      : '';
    
    item.innerHTML = `
      <div class="transaction-info">
        <div class="transaction-description">${transaction.description}</div>
        <div class="transaction-category">
          ${categoryDot}
          ${transaction.category_name || 'Uncategorized'}
        </div>
      </div>      <div class="transaction-amount ${transaction.type}">
        ${transaction.type === 'income' ? '+' : '-'}₹${parseFloat(transaction.amount).toFixed(2)}
      </div>
      <div class="transaction-actions">
        <button class="delete-btn" data-id="${transaction.id}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    
    // Add delete event listener
    item.querySelector('.delete-btn').addEventListener('click', () => {
      deleteTransaction(transaction.id);
    });
    
    return item;
  }
  
  function groupTransactionsByDate(transactions) {
    return transactions.reduce((acc, transaction) => {
      const date = transaction.date.split('T')[0]; // Handle ISO date format
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transaction);
      return acc;
    }, {});
  }
  
  function groupTransactionsByMonth(transactions) {
    return transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      const month = date.getMonth();
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(transaction);
      return acc;
    }, {});
  }
  
  function updateSummary(transactions) {
    let income = 0;
    let expense = 0;
    
    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        income += parseFloat(transaction.amount);
      } else {
        expense += parseFloat(transaction.amount);
      }
    });
    
    const balance = income - expense;
      elements.incomeAmount.textContent = `₹${income.toFixed(2)}`;
    elements.expenseAmount.textContent = `₹${expense.toFixed(2)}`;
    elements.balanceAmount.textContent = `₹${balance.toFixed(2)}`;
  }

  // Handle form submissions and API requests
  async function handleTransactionSubmit(e) {
    e.preventDefault();
    
    const amount = parseFloat(elements.amountInput.value);
    const description = elements.descriptionInput.value;
    const categoryId = elements.categorySelect.value;
    const date = elements.dateInput.value;
    const type = state.selectedTransactionType;
    
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          description,
          category_id: categoryId || null,
          type,
          date
        })
      });
      
      if (response.ok) {
        closeModals();
        loadTransactions();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction. Please try again.');
    }
  }
  
  async function handleExportSubmit(e) {
    e.preventDefault();
    
    const startDate = elements.startDateInput.value;
    const endDate = elements.endDateInput.value;
    
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }
    
    try {
      // Get transactions for the selected period
      const response = await fetch(`/api/expenses/between?startDate=${startDate}&endDate=${endDate}`);
      const transactions = await response.json();
      
      if (!transactions || transactions.length === 0) {
        alert('No transactions found for the selected period');
        return;
      }
      
      // Generate PDF
      const pdfResponse = await fetch('/api/reports/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate,
          endDate,
          transactions
        })
      });
      
      const data = await pdfResponse.json();
      
      // Display PDF
      elements.exportModal.style.display = 'none';
      elements.pdfModal.style.display = 'block';
      elements.pdfFrame.src = data.url;
      elements.downloadPdf.href = data.url;
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    }
  }
  
  async function deleteTransaction(id) {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        loadTransactions();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction. Please try again.');
    }
  }
  init();
});
