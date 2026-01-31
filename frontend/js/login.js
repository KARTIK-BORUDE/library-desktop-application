// Function to show messages
function showMessage(type, title, description) {
  const messageBox = document.getElementById("upload-message");
  const icon = document.getElementById("message-icon");
  const titleEl = document.getElementById("message-title");
  const descEl = document.getElementById("message-description");

  if (!messageBox || !icon || !titleEl || !descEl) return;

  // Set content
  titleEl.textContent = title;
  descEl.textContent = description;

  // Set icon
  if (type === "success") {
    icon.textContent = "✓";
    icon.className = "message-icon success";
  } else {
    icon.textContent = "✕";
    icon.className = "message-icon error";
  }

  // Show message
  messageBox.classList.remove("hidden");

  // Auto-hide after 5 seconds
  setTimeout(() => {
    messageBox.classList.add("hidden");
  }, 5000);
}

const btn = document.querySelector(".login-btn");
const username = document.querySelector("#name");
const password = document.querySelector("#pass");

btn.addEventListener("click", async () => {
  if (username.value === "" || password.value === "") {
    showMessage("error", "Error", "All fields required");
    return;
  }

  const res = await window.BOOKS.login(username.value, password.value);

  if (!res.success) {
    showMessage("error", "Error", res.error);
  } else {
    // Store role directly (no JSON.stringify needed since it's already a string)
    if (res.role) {
      localStorage.setItem("userRole", res.role.trim());
    }
    window.location.href = "index.html";
  }
});
