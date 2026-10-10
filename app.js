/* Oakmont educational website.
   Account balances and activity are illustrative.
   This is not real banking or authentication software. */
(() => {
  "use strict";
  // SETTINGS
  const TIME_ZONE = "America/Vancouver";
  const ACCOUNT_OWNER_NAME = "Tianna Jack";
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
  // VANCOUVER CLOCK
  function updateVancouverClock() {
    const now = new Date();
    document.querySelectorAll("[data-vancouver-time]")
      .forEach((element) => {
        element.textContent = timeFormatter.format(now);
      });
    document.querySelectorAll("[data-vancouver-date]")
      .forEach((element) => {
        element.textContent = dateFormatter.format(now);
      });
    document.querySelectorAll("[data-year]")
      .forEach((element) => {
        element.textContent = yearFormatter.format(now);
      });
  }
  updateVancouverClock();
  window.setInterval(updateVancouverClock, 1000);
  // CONSISTENT ACCOUNT OWNER NAME
  function updateAccountOwnerName() {
    document.querySelectorAll(
      "#sidebarName, #welcomeName, [data-account-owner]"
    ).forEach((element) => {
      element.textContent = ACCOUNT_OWNER_NAME;
    });
    const avatar = document.getElementById("avatar");
    if (avatar) {
      avatar.textContent = ACCOUNT_OWNER_NAME.charAt(0);
    }
  }
  // LOGIN PAGE
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    let mode = "signin";
    const title = document.getElementById("formTitle");
    const nameLabel = document.getElementById("nameLabel");
    const submitButton = document.getElementById("submitButton");
    const message = document.getElementById("loginMessage");
    document.querySelectorAll("[data-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        mode = button.dataset.mode;
        document.querySelectorAll("[data-mode]").forEach((tab) => {
          tab.classList.toggle("active", tab === button);
        });
        if (nameLabel) {
          nameLabel.classList.toggle("hidden", mode !== "create");
        }
        if (title) {
          title.textContent = mode === "create"
            ? "Create your profile"
            : "Welcome back";
        }
        if (submitButton) {
          submitButton.innerHTML = mode === "create"
            ? 'Create Profile <span>→</span>'
            : 'Continue to Dashboard <span>→</span>';
        }
        if (message) {
          message.textContent = "";
          message.style.color = "";
        }
      });
    });
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const emailInput = document.getElementById("email");
      const passwordInput = document.getElementById("password");
      const fullNameInput = document.getElementById("fullName");
      const email = emailInput ? emailInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value : "";
      const typedName = fullNameInput
        ? fullNameInput.value.trim()
        : "";
      if (!email || password.length < 4) {
        if (message) {
          message.textContent =
            "Enter an email address and a password of at least 4 characters.";
          message.style.color = "";
        }
        return;
      }
      if (mode === "create" && !typedName) {
        if (message) {
          message.textContent = "Please enter a profile name.";
          message.style.color = "";
        }
        return;
      }
      // This is a front-end demonstration, not real sign-in.
      // Never save the password.
      try {
        localStorage.setItem(
          "oakmontDemoName",
          ACCOUNT_OWNER_NAME
        );
      } catch (error) {
        // The fixed owner name still works without browser storage.
      }
      if (message) {
        message.style.color = "#267b54";
        message.textContent = "Opening the account overview...";
      }
      window.setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 500);
    });
  }
  // DASHBOARD PAGE
  if (document.body.classList.contains("dashboard-page")) {
    updateAccountOwnerName();
    const modal = document.getElementById("demoModal");
    const transferButton = document.getElementById("transferButton");
    const closeModalButton = document.getElementById("closeModal");
    const okayButton = document.getElementById("okayButton");
    const signOutButton = document.getElementById("signOutButton");
    function openModal() {
      if (modal) {
        modal.classList.remove("hidden");
      }
    }
    function closeModal() {
      if (modal) {
        modal.classList.add("hidden");
      }
    }
    if (transferButton) {
      transferButton.addEventListener("click", openModal);
    }
    if (closeModalButton) {
      closeModalButton.addEventListener("click", closeModal);
    }
    if (okayButton) {
      okayButton.addEventListener("click", closeModal);
    }
    if (modal) {
      modal.addEventListener("click", (event) => {
        if (event.target === modal) {
          closeModal();
        }
      });
      document.addEventListener("keydown", (event) => {
        if (
          event.key === "Escape" &&
          !modal.classList.contains("hidden")
        ) {
          closeModal();
        }
      });
    }
    if (signOutButton) {
      signOutButton.addEventListener("click", () => {
        window.location.href = "index.html";
      });
    }
  }
})();
