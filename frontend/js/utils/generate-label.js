export function generateLabel(accession_no, title) {
  if (!accession_no) {
    showMessage("error", "Invalid Accession No", "Cannot Generate Label");
    return;
  }
  window.BOOKS.generateLabel(accession_no, title).then((res) => {
    if (res.success) {
      showMessage("success", "Label Generated", "Label Generated Successfully");
    } else {
      showMessage(
        "error",
        "Label Generation Failed",
        "Label Generation Failed",
      );
    }
  });
}

export function viewLabel(accession_no) {
  if (!accession_no) {
    showMessage("error", "Invalid Accession No", "Cannot Generate Label");
    return;
  }

  const overlay = document.getElementById("view-label-overlay");
  const labelImage = document.getElementById("label-image");
  const closeBtn = document.getElementById("close-label-overlay");

  window.BOOKS.viewLabel(accession_no).then((res) => {
    if (res.success) {
      // Set the image source with base64 data
      labelImage.src = `data:image/png;base64,${res.label}`;
      // Show the overlay
      overlay.classList.remove("hidden");
    } else {
      showMessage(
        "error",
        "Label Generation Failed",
        res.message || "Label Generation Failed",
      );
    }
  });

  // Close button event listener
  closeBtn.addEventListener(
    "click",
    function () {
      overlay.classList.add("hidden");
      labelImage.src = "";
    },
    { once: true },
  );
}
