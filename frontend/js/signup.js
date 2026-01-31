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
  if (username.value === "" && password.value === "") {
    showMessage("error", "Error", "All fields required");
    return;
  } else if (username.value == "") {
    showMessage("error", "Error", "Username required");
    return;
  } else if (password.value == "") {
    showMessage("error", "Error", "Password required");
    return;
  } else {
    window.BOOKS.signup(username.value, password.value).then((res) => {
      
      if (res.success) {
        // Store role in localStorage (same as login.js)
        if (res.role) {
          localStorage.setItem("userRole", res.role.trim());
        }
        // Show success message briefly then redirect
        showMessage("success", "Success", res.message);
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1500); // 1.5 second delay to show success message
      } else {
        showMessage("error", "Error", res.message);
      }
    });
  }
});
