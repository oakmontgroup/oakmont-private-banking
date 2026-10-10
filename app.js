/* Oakmont educational demo.
   This is not real banking authentication or payment software. */
(() => {
  "use strict";
  const TIME_ZONE = "America/Vancouver";
  const timeFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZoneName: "short"
  });
  const dateFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const yearFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric"
  });
  function updateVancouverClock() {
    const now = new Date();
    document.querySelectorAll("[data-vancouver-time]")
      .forEach(element => {
        element.textContent = timeFormatter.format(now);
      });
    document.querySelectorAll("[data-vancouver-date]")
      .forEach(element => {
        element.textContent = dateFormatter.format(now);
      });
    document.querySelectorAll("[data-year]")
      .forEach(element => {
        element.textContent = yearFormatter.format(now);
      });
  }
  // Display the correct Vancouver time immediately, then refresh every second.
  updateVancouverClock();
  setInterval(updateVancouverClock, 1000);
  function getDemoName() {
    try {
      return localStorage.getItem("oakmontDemoName") || "Demo Client";
    } catch (error) {
      return "Demo Client";
    }
  }
  function saveDemoName(name) {
    const cleaned = String(name || "Demo Client")
      .trim()
      .slice(0, 48) || "Demo Client";
    try {
      localStorage.setItem("oakmontDemoName", cleaned);
    } catch (error) {
      // The demo still works with the default name if storage is unavailable.
    }
    return cleaned;
  }
  // LOGIN PAGE
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    let mode = "signin";
    const title = document.getElementById("formTitle");
    const nameLabel = document.getElementById("nameLabel");
    const submitButton = document.getElementById("submitButton");
    const message = document.getElementById("loginMessage");
    document.querySelectorAll("[data-mode]").forEach(button => {
      button.addEventListener("click", () => {
        mode = button.dataset.mode;
        document.querySelectorAll("[data-mode]").forEach(tab => {
          tab.classList.toggle("active", tab === button);
        });
        nameLabel.classList.toggle("hidden", mode !== "create");
        title.textContent = mode === "create"
          ? "Create your demo profile"
          : "Welcome back";
        submitButton.innerHTML = mode === "create"
          ? 'Create Demo Profile <span>→</span>'
          : 'Continue to Dashboard <span>→</span>';
        message.textContent = "";
        message.style.color = "";
      });
    });
    loginForm.addEventListener("submit", event => {
      event.preventDefault();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const typedName = document.getElementById("fullName").value;
      if (!email || password.length < 4) {
        message.textContent =
          "Enter a valid email and at least 4 characters for the demo password.";
        return;
      }
      // Only use a display name. Do not store the password.
      let displayName = getDemoName();
      if (mode === "create") {
        if (!typedName.trim()) {
          message.textContent = "Enter a display name for your demo profile.";
          return;
        }
        displayName = saveDemoName(typedName);
      } else {
        displayName = saveDemoName(displayName);
      }
      message.style.color = "#267b54";
      message.textContent =
        "Demo profile ready. Opening your sample dashboard...";
      window.setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 500);
    });
  }
  // DASHBOARD PAGE
  if (document.body.classList.contains("dashboard-page")) {
    const name = getDemoName();
    const welcomeName = document.getElementById("welcomeName");
    const sidebarName = document.getElementById("sidebarName");
    const avatar = document.getElementById("avatar");
    if (welcomeName) welcomeName.textContent = name;
    if (sidebarName) sidebarName.textContent = name;
    if (avatar) avatar.textContent = name.charAt(0).toUpperCase();
    const modal = document.getElementById("demoModal");
    function openModal() {
      if (modal) modal.classList.remove("hidden");
    }
    function closeModal() {
      if (modal) modal.classList.add("hidden");
    }
    document.getElementById("transferButton")
      ?.addEventListener("click", openModal);
    document.getElementById("closeModal")
      ?.addEventListener("click", closeModal);
    document.getElementById("okayButton")
      ?.addEventListener("click", closeModal);
    modal?.addEventListener("click", event => {
      if (event.target === modal) closeModal();
    });
    document.getElementById("signOutButton")
      ?.addEventListener("click", () => {
        window.location.href = "login.html";
      });
  }
})();
