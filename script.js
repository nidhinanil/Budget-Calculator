let loggedkey = localStorage.getItem("loggedkey");


// Check Login
if (!loggedkey || !localStorage.getItem(loggedkey)) {
    window.location.href = "login.html";
} else {

    let welcomeuser = document.getElementById("welcomeuser");

    if (welcomeuser) {
        welcomeuser.innerHTML = `<i class="fa-solid fa-user me-1"></i> Welcome, ${loggedkey}`;
    }

    displayincomeexpense();
    displayincomeArray();
    displayexpenseArray();
}


// Display Income and Expense
function displayincomeexpense() {

    let user = JSON.parse(localStorage.getItem(loggedkey));

    if (!user) return;

    document.getElementById("incomedisplay").innerHTML =
        `Rs ${user.income.toFixed(2)}/-`;

    document.getElementById("expensedisplay").innerHTML =
        `Rs ${user.expense.toFixed(2)}/-`;
}


// Add Income
function addIncome(event) {

    event.preventDefault();

    let type = document.getElementById("incometype").value.trim();
    let amount = parseFloat(document.getElementById("incomeamt").value);

    if (!type || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid income type and positive amount.");
        return;
    }

    let user = JSON.parse(localStorage.getItem(loggedkey));

    user.income += amount;

    if (!user.incomeArray) {
        user.incomeArray = [];
    }

    user.incomeArray.push({
        type: type,
        amt: amount.toFixed(2),
        bal: user.income.toFixed(2),
        dt: new Date().toLocaleString()
    });

    localStorage.setItem(loggedkey, JSON.stringify(user));

    alert("Income added successfully");

    displayincomeexpense();
    displayincomeArray();

    document.getElementById("incomeform").reset();
}


// Display Income History
function displayincomeArray() {

    let user = JSON.parse(localStorage.getItem(loggedkey));

    if (!user) return;

    let incomeArray = user.incomeArray || [];
    let details = document.getElementById("incomedetails");

    details.innerHTML = "";

    for (let item of incomeArray) {

        details.innerHTML += `
            <tr>
                <td class="fw-semibold">${item.type}</td>
                <td class="text-success fw-bold">+Rs ${item.amt}</td>
                <td>Rs ${item.bal}</td>
                <td class="text-secondary">${item.dt}</td>
            </tr>
        `;
    }
}


// Add Expense
function addExpense(event) {

    event.preventDefault();

    let type = document.getElementById("expensetype").value.trim();
    let amount = parseFloat(document.getElementById("expenseamt").value);

    if (!type || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid expense type and positive amount.");
        return;
    }

    let user = JSON.parse(localStorage.getItem(loggedkey));

    if (amount > user.income) {
        alert("Insufficient balance.");
        return;
    }

    user.income -= amount;
    user.expense += amount;

    if (!user.expenseArray) {
        user.expenseArray = [];
    }

    user.expenseArray.push({
        type: type,
        amt: amount.toFixed(2),
        bal: user.income.toFixed(2),
        dt: new Date().toLocaleString()
    });

    localStorage.setItem(loggedkey, JSON.stringify(user));

    alert("Expense added successfully");

    displayincomeexpense();
    displayexpenseArray();

    document.getElementById("expenseform").reset();
}


// Display Expense History
function displayexpenseArray() {

    let user = JSON.parse(localStorage.getItem(loggedkey));

    if (!user) return;

    let expenseArray = user.expenseArray || [];
    let details = document.getElementById("expensedetails");

    details.innerHTML = "";

    for (let item of expenseArray) {

        details.innerHTML += `
            <tr>
                <td class="fw-semibold">${item.type}</td>
                <td class="text-danger fw-bold">-Rs ${item.amt}</td>
                <td>Rs ${item.bal}</td>
                <td class="text-secondary">${item.dt}</td>
            </tr>
        `;
    }
}


// Clear All
function clearAll() {

    if (!confirm("Are you sure you want to clear all transaction data?")) {
        return;
    }

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


// Logout
function logout() {

    localStorage.removeItem("loggedkey");

    window.location.href = "login.html";
}


// Pie Chart
let pieChartInstance = null;


function displaychart() {

    let user = JSON.parse(localStorage.getItem(loggedkey));

    if (!user) return;

    let expenseArray = user.expenseArray || [];

    if (expenseArray.length === 0 && user.income === 0) {
        alert("No income or expenses recorded yet.");
        return;
    }

    let types = expenseArray.map(item => item.type);
    let values = expenseArray.map(item => parseFloat(item.amt));

    if (user.income > 0) {
        types.push("Remaining Balance");
        values.push(user.income);
    }

    let colors = generateDistinctColors(types.length);

    let canvas = document.getElementById("piechart");
    let ctx = canvas.getContext("2d");

    if (pieChartInstance) {
        pieChartInstance.destroy();
    }

    pieChartInstance = new Chart(ctx, {

        type: "pie",

        data: {
            labels: types,

            datasets: [{
                data: values,
                backgroundColor: colors
            }]
        },

        options: {
            responsive: true,

            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}


// Generate Chart Colors
function generateDistinctColors(num) {

    let colors = [];
    let hue = 0;
    let increment = 360 / num;

    for (let i = 0; i < num; i++) {

        let saturation = 70 + Math.random() * 10;
        let lightness = 50 + Math.random() * 10;

        colors.push(
            `hsl(${hue}, ${saturation}%, ${lightness}%)`
        );

        hue += increment;
    }

    return colors;
}