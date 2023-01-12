const routes = {
  "/": "/views/home.html",
  "/login": "/views/login.html",
  "/signup": "/views/signup.html",
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

// Router
const route = function (event) {
  event = event || window.event;
  event.preventDefault();
  window.history.pushState({}, "", event.target.href);
  handleLocation();
};

// A general function to make URL redirections
const redirectTo = async function (path) {
  window.history.pushState({}, "", path);
  const html = await fetch(routes[path]).then((data) => data.text());
  document.getElementById("router-view").innerHTML = html;
};

// Function to render html pages based on route
const handleLocation = async function () {
  const path = window.location.pathname;
  const authUser = JSON.parse(localStorage.getItem("auth-user"));

  // pvt route "/"
  if (path === "/") {
    // check if a user is logged in
    if (!authUser) {
      redirectTo("/login");
      toggleLogoutButton("hide");
      toggleLoginLinks("show");
      return;
    } else {
      toggleLogoutButton("show");
      toggleLoginLinks("hide");
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
  localStorage.removeItem("auth-user");
  toggleLogoutButton("hide");
  toggleLoginLinks("show");
  redirectTo("/login");
};
