// ------------------ Authentication Check ------------------
let loggedkey = localStorage.getItem("loggedkey");

if (!loggedkey || !localStorage.getItem(loggedkey)) {
    window.location.href = "login.html";
} else {
    // ------------------ Welcome User ------------------
    const welcomeuser = document.getElementById("welcomeuser");
    if (welcomeuser) {
        welcomeuser.innerHTML = `<i class="fa-solid fa-user me-1"></i> Welcome, ${loggedkey}`;
    }

    // ------------------ Initial Display Calls ------------------
    displayincomeexpense();
    displayincomeArray();
    displayexpenseArray();
}

// ------------------ Display Totals ------------------
function displayincomeexpense() {
    let obj = JSON.parse(localStorage.getItem(loggedkey));
    if (!obj) return;

    document.getElementById("incomedisplay").innerHTML = `Rs ${obj.income.toFixed(2)}/-`;
    document.getElementById("expensedisplay").innerHTML = `Rs ${obj.expense.toFixed(2)}/-`;

    const statusBadge = document.getElementById("budget-status");
    const statusLabel = document.getElementById("status-label");
    if (statusBadge && statusLabel) {
        if (obj.income < 0 || (obj.income === 0 && obj.expense > 0)) {
            statusBadge.textContent = "OVER BUDGET";
            statusBadge.className = "badge bg-danger-subtle text-danger border border-danger";
            statusLabel.textContent = "Deficit";
        } else {
            statusBadge.textContent = "APPROVED";
            statusBadge.className = "badge bg-success-subtle text-success border border-success";
            statusLabel.textContent = "Active";
        }
    }
}

// ------------------ Add Income ------------------
function addIncome(event) {
    event.preventDefault();
    const incometype = document.getElementById("incometype").value.trim();
    const incomeamt = parseFloat(document.getElementById("incomeamt").value);

    if (!incometype || isNaN(incomeamt) || incomeamt <= 0) {
        alert("Please enter a valid income type and positive amount.");
        return;
    }

    let user = JSON.parse(localStorage.getItem(loggedkey));
    user.income = parseFloat((user.income + incomeamt).toFixed(2));
    if (!user.incomeArray) user.incomeArray = [];

    const now = new Date();
    const date = now.toLocaleString();

    user.incomeArray.push({
        type: incometype,
        amt: incomeamt.toFixed(2),
        bal: user.income.toFixed(2),
        dt: date
    });

    localStorage.setItem(loggedkey, JSON.stringify(user));
    alert("Income added successfully");

    displayincomeexpense();
    displayincomeArray();
    document.getElementById("incomeform").reset();
}

function displayincomeArray() {
    let user = JSON.parse(localStorage.getItem(loggedkey));
    if (!user) return;
    const incomearray = user.incomeArray || [];
    const incomedetails = document.getElementById("incomedetails");
    incomedetails.innerHTML = '';

    for (let item of incomearray) {
        incomedetails.innerHTML += `
            <tr>
                <td class="fw-semibold">${item.type}</td>  
                <td class="text-success fw-bold">+Rs ${item.amt}</td> 
                <td>Rs ${item.bal}</td> 
                <td class="text-secondary">${item.dt}</td>  
            </tr>`;
    }
}

// ------------------ Add Expense ------------------
function addExpense(event) {
    event.preventDefault();
    const expensetype = document.getElementById("expensetype").value.trim();
    const expenseamt = parseFloat(document.getElementById("expenseamt").value);

    if (!expensetype || isNaN(expenseamt) || expenseamt <= 0) {
        alert("Please enter a valid expense type and positive amount.");
        return;
    }

    let user = JSON.parse(localStorage.getItem(loggedkey));
    if (expenseamt > user.income) {
        alert("Insufficient balance.");
        return;
    }

    user.income = parseFloat((user.income - expenseamt).toFixed(2));
    user.expense = parseFloat((user.expense + expenseamt).toFixed(2));
    if (!user.expenseArray) user.expenseArray = [];

    const now = new Date();
    const date = now.toLocaleString();

    user.expenseArray.push({
        type: expensetype,
        amt: expenseamt.toFixed(2),
        bal: user.income.toFixed(2),
        dt: date
    });

    localStorage.setItem(loggedkey, JSON.stringify(user));
    alert("Expense added successfully");

    displayincomeexpense();
    displayexpenseArray();
    document.getElementById("expenseform").reset();
}

function displayexpenseArray() {
    let user = JSON.parse(localStorage.getItem(loggedkey));
    if (!user) return;
    const expenseArray = user.expenseArray || [];
    const expensedetails = document.getElementById("expensedetails");
    expensedetails.innerHTML = '';

    for (let item of expenseArray) {
        expensedetails.innerHTML += `
            <tr>
                <td class="fw-semibold">${item.type}</td>  
                <td class="text-danger fw-bold">-Rs ${item.amt}</td> 
                <td>Rs ${item.bal}</td> 
                <td class="text-secondary">${item.dt}</td>  
            </tr>`;
    }
}

// ------------------ Clear All ------------------
function clearAll() {
    if (confirm("Are you sure you want to clear all transaction data?")) {
        let user = JSON.parse(localStorage.getItem(loggedkey));
        user.income = 0;
        user.expense = 0;
        user.incomeArray = [];
        user.expenseArray = [];
        localStorage.setItem(loggedkey, JSON.stringify(user));

        displayincomeexpense();
        displayincomeArray();
        displayexpenseArray();

        if (pieChartInstance) {
            pieChartInstance.destroy();
            pieChartInstance = null;
        }

        alert("Cleared all data successfully.");
    }
}

// ------------------ Logout ------------------
function logout() {
    localStorage.removeItem("loggedkey");
    window.location.href = "login.html";
}

// ------------------ Pie Chart ------------------
let pieChartInstance = null;

function displaychart() {
    const user = JSON.parse(localStorage.getItem(loggedkey));
    if (!user) return;
    const expenseArray = user.expenseArray || [];

    if (expenseArray.length === 0 && user.income === 0) {
        alert("No income or expenses recorded yet.");
        return;
    }

    const type = expenseArray.map(x => x.type);
    const values = expenseArray.map(x => parseFloat(x.amt));

    if (user.income > 0) {
        type.push("Remaining Balance");
        values.push(user.income);
    }

    const customColors = generateDistinctColors(type.length);
    const canvas = document.getElementById("piechart");
    const ctx = canvas.getContext('2d');

    if (pieChartInstance) {
        pieChartInstance.destroy();
    }

    pieChartInstance = new Chart(ctx, {
        type: "pie",
        data: {
            labels: type,
            datasets: [{
                data: values,
                backgroundColor: customColors
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function generateDistinctColors(num) {
    const colors = [];
    if (num <= 0) return colors;
    const increment = 360 / num;
    let hue = 0;

    for (let i = 0; i < num; i++) {
        const saturation = 70 + Math.random() * 10;
        const lightness = 50 + Math.random() * 10;
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
        hue += increment;
    }

    return colors;
}