document.addEventListener('DOMContentLoaded', function() {
    // Override Tilda form submission behavior
    const forms = document.querySelectorAll('form');
    forms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent standard Tilda submission
            
            // Collect form data
            const formData = new FormData(form);
            const data = {};
            
            // Adding a dynamic site identifier based on domain
            data['site_id'] = window.location.hostname || 'localhost';
            
            for (let [key, value] of formData.entries()) {
                // Tilda inputs often have names like "name", "Phone", etc.
                if (key.includes('tildaspec')) continue; // Skip Tilda specific hidden fields if any
                data[key] = value;
            }
            
            // Change button state to "Sending..."
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Submit';
            if (submitBtn) {
                submitBtn.innerHTML = 'Отправка...';
                submitBtn.disabled = true;
            }
            
            // Send to our local bot backend
            fetch('http://localhost:8080/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                console.log('Success:', result);
                // Show success message
                const successBox = form.nextElementSibling;
                if (successBox && successBox.classList.contains('t-form__successbox')) {
                    successBox.style.display = 'block';
                    form.style.display = 'none';
                } else {
                    alert('Заявка успешно отправлена!');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Произошла ошибка при отправке заявки.');
                if (submitBtn) {
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                }
            });
        });
    });
});
