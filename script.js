const routes = {
  "/": "/views/home.html",
  "/login": "/views/login.html",
  "/signup": "/views/signup.html",
  404: "/views/404.html",
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

  // pvt route "/"
  if (path === "/") {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.isLoggedIn === false) {
      redirectTo("/login");
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
    alert("Enter all fields");
    return;
  }

  // email validation
  if (!email.match(/\S+@\S+\.\S+/)) {
    alert("Enter a valid email");
    return;
  }

  // username length validation
  if (username.length < 6) {
    alert("Username must contain at least 6 characters");
    return;
  }

  // password length validation
  if (pwd.length < 8) {
    alert("Password must contain at least 8 characters");
    return;
  }

  const newUser = {
    username,
    email,
    pwd,
    isLoggedIn: false,
  };

  console.log(newUser);
  localStorage.setItem("user", JSON.stringify(newUser));

  alert("Signup success!!! You can now proceed to login");

  redirectTo("/login");
};

const handleLogin = function () {
  const usernameOrEmail = document.getElementById("email-login-input").value;
  const pwd = document.getElementById("password-login-input").value;

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please sign up first");
    return;
  }

  if (
    (user.email === usernameOrEmail || user.username === usernameOrEmail) &&
    user.pwd === pwd
  ) {
    alert("Log in successfull!!! You can now go to home");
    const loggedInUser = { ...user, isLoggedIn: true };
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    redirectTo("/");
  } else {
    alert("Incorrect username/email or password");
  }
};

const handleLogout = function () {
  localStorage.removeItem("user");
  redirectTo("/login");
};
