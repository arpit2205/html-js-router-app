const routes = {
  "/": "/views/home.html",
  "/login": "/views/login.html",
  "/signup": "/views/signup.html",
  "/news": "/views/news.html",
  404: "/views/404.html",
};

const toggleLogoutButton = function (action) {
  let logoutButton = document.getElementById("logout-btn");
  logoutButton.style.display = action === "hide" ? "none" : "block";
};

const toggleLoginLinks = function (action) {
  let signupLink = document.getElementById("signup-link");
  let loginLink = document.getElementById("login-link");
  signupLink.style.display = action === "hide" ? "none" : "block";
  loginLink.style.display = action === "hide" ? "none" : "block";
};

const setError = function (msg) {
  let errorField = document.getElementById("error-field");

  errorField.style.display = msg === "" ? "none" : "block";
  errorField.innerHTML = "Error: " + msg;
};

const fetchNews = async function () {
  const response = await fetch(
    "https://newsapi.org/v2/top-headlines?country=in&category=business&apiKey=78ecece3f7a64a41b09b3818536ae270"
  );
  const data = await response.json();
  const articles = data.articles;

  const newsRootDiv = document.getElementById("news-root");

  let html = "";

  articles.map((article) => {
    html += `<div class="news-card">
    <div class="news-image">
      <img
        src="${article.urlToImage}"
      />
    </div>
    <div class="news-content">
      <a
        href="${article.url}"
        target="_blank"
        class="news-title"
        >${article.title}</a
      >
      <p class="news-description">
        ${article.description}
      </p>
      <p class="news-date">Published at ${article.publishedAt}</p>
      <p class="news-source">Source ${article.source.name}</p>
    </div>
  </div>`;
  });

  newsRootDiv.innerHTML = html;
};

const fetchExpenses = function () {
  const authUser = JSON.parse(localStorage.getItem("auth-user"));

  if (!authUser.expenses) {
    return;
  }

  authUser.expenses.sort((a, b) => b.id - a.id);

  let html = ``;
  authUser.expenses.map((expense) => {
    html += `<div class="expense-card">
    <div class="expense-left">
      <h1 class="expense-title">${expense.title}</h1>
      <p class="expense-category">${expense.category}</p>
      <p class="expense-date">${new Date(expense.id)
        .toString()
        .slice(0, 24)}</p>
    </div>
    <div class="expense-right">
      <h1 class="expense-amount">&#8377; ${expense.amount}</h1>
      <button class="remove-btn" id="${
        expense.id
      }" onclick="handleRemoveExpense()">REMOVE</button>
    </div>
  </div>`;
  });

  setTimeout(() => {
    const expenseRootDiv = document.getElementById("expenses-root");
    expenseRootDiv.insertAdjacentHTML("afterbegin", html);
  }, 100);
};

// Router
const route = function (event) {
  event = event || window.event;
  event.preventDefault();
  window.history.pushState({}, "", event.target.href);
  handleLocation();
};

// A general function to make URL redirections
const redirectTo = async function (path) {
  if (path === "/") fetchExpenses();
  window.history.pushState({}, "", path);
  const html = await fetch(routes[path]).then((data) => data.text());
  document.getElementById("router-view").innerHTML = html;
};

// Function to render html pages based on route
const handleLocation = async function () {
  const path = window.location.pathname;
  const authUser = JSON.parse(localStorage.getItem("auth-user"));

  // pvt route "/"
  if (path === "/" || path === "/news") {
    // check if a user is logged in
    if (!authUser) {
      redirectTo("/login");
      toggleLogoutButton("hide");
      toggleLoginLinks("show");
      return;
    } else {
      toggleLogoutButton("show");
      toggleLoginLinks("hide");

      if (path === "/") {
        fetchExpenses();
      }

      if (path === "/news") {
        fetchNews();
      }
    }
  }

  // prevent login/signup when user is logged in
  if (path === "/login" || path === "/signup") {
    if (authUser) {
      redirectTo("/");
      return;
    }
  }

  const route = routes[path] || routes[404];
  const html = await fetch(route).then((data) => data.text());
  document.getElementById("router-view").innerHTML = html;
};

window.onpopstate = handleLocation;
window.route = route;

// for first render
handleLocation();

const handleSignup = function () {
  const username = document.getElementById("username-input").value;
  const email = document.getElementById("email-input").value;
  const pwd = document.getElementById("password-input").value;

  // empty fields validation
  if (!username || !email || !pwd) {
    setError("Enter all fields");
    return;
  }

  // email validation
  if (!email.match(/\S+@\S+\.\S+/)) {
    setError("Enter a valid email");
    return;
  }

  // username length validation
  if (username.length < 6) {
    setError("Username must contain at least 6 characters");
    return;
  }

  // password length validation
  if (pwd.length < 8) {
    setError("Password must contain at least 8 characters");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users"));

  // check if email/username already exists
  if (users) {
    let found = users.find(
      (user) =>
        user.email === email ||
        user.username === email ||
        user.email === username ||
        user.username === username
    );
    if (found) {
      setError("Email/Username already exists");
      return;
    }
  }

  const newUser = {
    id: Date.now(),
    username,
    email,
    pwd,
    expenses: [],
  };

  // add current user to the array of users in localStorage
  if (users) {
    localStorage.setItem("users", JSON.stringify([...users, newUser]));
  } else {
    localStorage.setItem("users", JSON.stringify([newUser]));
  }

  alert("Signup success!!! You can now proceed to login");
  setError("");
  redirectTo("/login");
};

const handleLogin = function () {
  const usernameOrEmail = document.getElementById("email-login-input").value;
  const pwd = document.getElementById("password-login-input").value;

  const users = JSON.parse(localStorage.getItem("users"));

  if (!users) {
    setError("Please sign up first");
    return;
  }

  let found = users.find(
    (user) =>
      (user.email === usernameOrEmail || user.username === usernameOrEmail) &&
      user.pwd === pwd
  );

  if (found) {
    setError("");
    alert("Log in successfull!!! You can now go to home");
    localStorage.setItem("auth-user", JSON.stringify(found));
    redirectTo("/");
    toggleLogoutButton("show");
    toggleLoginLinks("hide");
  } else {
    setError("Incorrect username/email or password");
  }
};

const handleLogout = function () {
  const authUser = JSON.parse(localStorage.getItem("auth-user"));
  const users = JSON.parse(localStorage.getItem("users"));

  const found = users.filter((user) => user.id === authUser.id)[0];
  const index = users.indexOf(found);
  users[index] = authUser;

  localStorage.setItem("users", JSON.stringify(users));
  localStorage.removeItem("auth-user");

  toggleLogoutButton("hide");
  toggleLoginLinks("show");
  redirectTo("/login");
};

const handleAddExpense = function () {
  const expenseTitleRef = document.getElementById("expense-title-input");
  const amountRef = document.getElementById("expense-amount-input");
  const categoryRef = document.getElementById("category-select");

  const expenseTitle = expenseTitleRef.value;
  const amount = amountRef.value;
  const category = categoryRef.value;

  if (!expenseTitle || !amount || !category) {
    alert("Please fill all fields");
    return;
  }

  const newExpense = {
    id: Date.now(),
    title: expenseTitle,
    amount: amount,
    category: category,
  };

  const authUser = JSON.parse(localStorage.getItem("auth-user"));
  authUser.expenses.push(newExpense);
  localStorage.setItem("auth-user", JSON.stringify(authUser));

  let html = `<div class="expense-card">
  <div class="expense-left">
    <h1 class="expense-title">${expenseTitle}</h1>
    <p class="expense-category">${category}</p>
    <p class="expense-date">${new Date(newExpense.id)
      .toString()
      .slice(0, 24)}</p>
  </div>
  <div class="expense-right">
    <h1 class="expense-amount">&#8377; ${amount}</h1>
    <button class="remove-btn" id="${
      newExpense.id
    }" onclick="handleRemoveExpense()">REMOVE</button>
  </div>
</div>`;

  const expenseRootDiv = document.getElementById("expenses-root");
  expenseRootDiv.insertAdjacentHTML("afterbegin", html);

  // reset values
  expenseTitleRef.value = "";
  amountRef.value = 0;
  categoryRef.value = "Food";
};

const handleRemoveExpense = function () {
  const authUser = JSON.parse(localStorage.getItem("auth-user"));
  const removeId = window.event.target.attributes[1].nodeValue;
  authUser.expenses = authUser.expenses.filter(
    (expense) => expense.id !== +removeId
  );
  localStorage.setItem("auth-user", JSON.stringify(authUser));

  const toBeRemovedExpense =
    document.getElementById(removeId).parentElement.parentElement;
  toBeRemovedExpense.remove();
};
