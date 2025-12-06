//    imported in account.html
   document.addEventListener('DOMContentLoaded', (event) => {
        const editBtn = document.getElementById("edit-btn");
        const cancelBtn = document.getElementById("cancel-btn");
        const viewSection = document.getElementById("view-section");
        const editSection = document.getElementById("edit-section");

        // Helper to add Bootstrap class 'form-control' to all form inputs
        const inputs = editSection.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            const type = input.getAttribute('type');
            if (input.tagName !== 'BUTTON' && type !== 'submit' && type !== 'hidden' && type !== 'checkbox' && type !== 'radio') {
                input.classList.add('form-control');
            }
        });

        // Toggle visibility to edit form
        if (editBtn) {
            editBtn.addEventListener("click", () => {
                viewSection.style.display = "none";
                editSection.style.display = "block";
            });
        }

        // Toggle visibility back to view
        if (cancelBtn) {
            cancelBtn.addEventListener("click", () => {
                editSection.style.display = "none";
                viewSection.style.display = "block";
            });
        }
    });
