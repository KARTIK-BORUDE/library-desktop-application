// Helper function to format dates for HTML5 date inputs (yyyy-MM-dd)
function formatDateForInput(dateValue) {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return ''; // Invalid date

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function showLoading() {
    const overlay = document.getElementById("upload-loading-overlay");
    if (overlay) overlay.classList.remove("hidden");
}

function hideLoading() {
    const overlay = document.getElementById("upload-loading-overlay");
    if (overlay) overlay.classList.add("hidden");
}

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

export { formatDateForInput, showLoading, hideLoading, showMessage };