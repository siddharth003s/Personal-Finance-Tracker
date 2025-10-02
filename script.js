// ===========================
// Global State & References
// ===========================
let transactions = [];
let editId = null;
const submitBtn = document.getElementById("submit");
const errorElem = document.getElementById("error");

// Input fields
const descInput = document.getElementById("desc");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const dateInput = document.getElementById("date");

// ===========================
// Utility Functions
// ===========================
function resetForm() {
  document.getElementById("transaction-form").reset();
  editId = null;
  submitBtn.textContent = "Add";
  errorElem.textContent = "";
}

// ===========================
// CRUD Operations
// ===========================
function addTransaction(desc, amount, type, date) {
  transactions.push({
    id: Date.now(),
    desc,
    amount,
    type,
    date
  });
  saveTransactions();
  renderTransactions();
  resetForm();
}

function editTransaction(id) {
  let transaction = transactions.find(t => t.id === id);
  if (!transaction) return;

  // Prefill form
  descInput.value = transaction.desc;
  amountInput.value = transaction.amount;
  typeInput.value = transaction.type;
  dateInput.value = transaction.date;

  editId = id;
  submitBtn.textContent = "Update";
}

function updateTransaction(id, desc, amount, type, date) {
  let transaction = transactions.find(t => t.id === id);
  if (!transaction) return;

  transaction.desc = desc;
  transaction.amount = amount;
  transaction.type = type;
  transaction.date = date;

  saveTransactions();
  renderTransactions();
  resetForm();
}

function deleteTransaction(id) {
  if (!confirm("Are you sure you want to delete this transaction?")) return;

  transactions = transactions.filter(t => t.id !== id);
  saveTransactions();
  renderTransactions();
}

// ===========================
// Rendering Functions
// ===========================
function renderTransactions() {
  let tbody = document.querySelector("#transaction-table tbody");
  tbody.innerHTML = "";

  // Filtering
  let filtered = [...transactions];
  let filterValue = document.getElementById("filter").value;
  if (filterValue !== "All") {
    filtered = filtered.filter(t => t.type === filterValue);
  }

  // Sorting
  let sortValue = document.getElementById("sort").value;
  if (sortValue === "date-desc") {
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sortValue === "date-asc") {
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (sortValue === "amount-asc") {
    filtered.sort((a, b) => a.amount - b.amount);
  } else if (sortValue === "amount-desc") {
    filtered.sort((a, b) => b.amount - a.amount);
  }

  // Empty state
  if (filtered.length === 0) {
    let row = tbody.insertRow();
    let cell = row.insertCell(0);
    cell.colSpan = 5;
    cell.textContent = "No transactions yet.";
    cell.style.textAlign = "center";
  }

  // Populate rows
  for (let t of filtered) {
    let row = tbody.insertRow();
    row.insertCell(0).textContent = t.desc;
    row.insertCell(1).textContent = t.amount;
    row.insertCell(2).textContent = t.type;
    row.insertCell(3).textContent = t.date;
    row.insertCell(4).innerHTML =
      `<button onclick='editTransaction(${t.id})'>Edit</button>
       <button onclick='deleteTransaction(${t.id})'>Delete</button>`;
  }

  updateSummary();
}

// ===========================
// Summary & Charts
// ===========================
function updateSummary() {
  let income = 0, expense = 0;

  for (let t of transactions) {
    if (t.type === "Income") income += t.amount;
    else if (t.type === "Expense") expense += t.amount;
  }

  let balance = income - expense;
  document.getElementById("Income").textContent = income;
  document.getElementById("Expense").textContent = expense;

  let balanceElem = document.getElementById("balance");
  balanceElem.textContent = balance;
  balanceElem.style.color = balance < 0 ? "red" : "black";

  // Progress bars
  let total = income + expense;
  document.getElementById("income-bar").style.width = total ? (income / total) * 100 + "%" : "0";
  document.getElementById("expense-bar").style.width = total ? (expense / total) * 100 + "%" : "0";

  updateChart(income, expense);
}

function updateChart(income, expense) {
  let ctx = document.getElementById("pieChart").getContext("2d");
  if (!window.myPieChart) {
    window.myPieChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Income", "Expense"],
        datasets: [{
          data: [income, expense],
          backgroundColor: ["green", "red"]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true
      }
    });
  } else {
    window.myPieChart.data.datasets[0].data = [income, expense];
    window.myPieChart.update();
  }
}

// ===========================
// Storage Functions
// ===========================
function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function loadTransactions() {
  let stored = localStorage.getItem("transactions");
  if (stored) {
    transactions = JSON.parse(stored);
    renderTransactions();
  }
}

// ===========================
// Event Listeners
// ===========================
document.getElementById("transaction-form").addEventListener("submit", function (e) {
  e.preventDefault();
  errorElem.textContent = "";

  let desc = descInput.value.trim();
  let amount = Number(amountInput.value);
  let type = typeInput.value;
  let date = dateInput.value;

  // Validation
  if (!desc) { errorElem.textContent = "Description cannot be empty."; return; }
  if (!amount || amount <= 0) { errorElem.textContent = "Amount must be positive."; return; }
  if (!date) { errorElem.textContent = "Please select a date."; return; }

  if (editId) {
    updateTransaction(editId, desc, amount, type, date);
  } else {
    addTransaction(desc, amount, type, date);
  }
});

// Filter & Sort
document.getElementById("filter").addEventListener("change", renderTransactions);
document.getElementById("sort").addEventListener("change", renderTransactions);

// Initialize on page load
window.onload = loadTransactions;
