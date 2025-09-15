document.addEventListener('DOMContentLoaded', () => {
    const updateButton = document.getElementById('updateButton');
    const updateMessage = document.getElementById('updateMessage');

    const fields = {
        displayName: { valueElement: document.getElementById('displayNameValue'), inputElement: document.getElementById('displayNameInput') },
        email: { valueElement: document.getElementById('emailValue'), inputElement: document.getElementById('emailInput') },
        phone: { valueElement: document.getElementById('phoneValue'), inputElement: document.getElementById('phoneInput') },
        zipCode: { valueElement: document.getElementById('zipCodeValue'), inputElement: document.getElementById('zipCodeInput') },
        password: { valueElement: document.getElementById('passwordValue'), inputElement: document.getElementById('passwordInput') },
        passwordConfirm: { valueElement: null, inputElement: document.getElementById('passwordConfirmInput') }
    };

    updateButton.addEventListener('click', () => {
        let changedFields = [];
        let validationErrors = [];

        // Validate inputs
        if (fields.email.inputElement.value && !/^\S+@\S+\.\S+$/.test(fields.email.inputElement.value)) {
            validationErrors.push("Invalid email address.");
        }

        if (fields.phone.inputElement.value && !/^\d{3}-\d{3}-\d{4}$/.test(fields.phone.inputElement.value)) {
            validationErrors.push("Invalid phone number format (e.g., 555-123-4567).");
        }

        if (fields.zipCode.inputElement.value && !/^\d{5}$/.test(fields.zipCode.inputElement.value)) {
            validationErrors.push("Invalid Zip Code format (e.g., 77005).");
        }

        if (fields.password.inputElement.value !== fields.passwordConfirm.inputElement.value) {
            validationErrors.push("Passwords do not match.");
        }

        if (validationErrors.length > 0) {
            showMessage(validationErrors.join('<br>'), 'error');
            return;
        }

        // Determine changed fields
        for (const key in fields) {
            if (key !== 'passwordConfirm') {
                const newValue = fields[key].inputElement.value.trim();
                const currentValue = fields[key].valueElement.textContent.trim();

                if (newValue !== '' && newValue !== currentValue && (key !== 'password' || newValue.length > 0)) {
                    changedFields.push(key);
                }
            }
        }

        // Update values and display message
        if (changedFields.length > 0) {
            const messageText = "The following fields will be updated: " + changedFields.join(', ');
            showMessage(messageText, 'success');

            changedFields.forEach(key => {
                if (key === 'password') {
                    fields[key].valueElement.textContent = '********';
                } else {
                    fields[key].valueElement.textContent = fields[key].inputElement.value.trim();
                }
            });
        } else {
            showMessage("No fields have been changed.", 'success');
        }

        // Clear input fields
        for (const key in fields) {
            fields[key].inputElement.value = '';
        }
    });

    function showMessage(message, type) {
        updateMessage.textContent = '';
        updateMessage.innerHTML = message;
        updateMessage.className = `message-${type}`;
        updateMessage.style.display = 'block';
    }
});