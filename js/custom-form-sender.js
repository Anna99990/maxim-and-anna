document.addEventListener('submit', function(e) {
    if (e.target.closest('.t-form') || e.target.closest('form')) {
        e.preventDefault();
        e.stopImmediatePropagation(); // Block Tilda from processing it

        const formEl = e.target;
        const submitBtn = formEl.querySelector('button[type="submit"]') || formEl.querySelector('.t-submit');

        // Gather inputs safely
        const inputs = formEl.querySelectorAll('input, textarea, select');
        let dataMap = {};
        inputs.forEach(input => {
            if (input.name && input.name !== 'formservices[]' && input.name !== 'tildaspec-formname') {
                if (input.type === 'radio' || input.type === 'checkbox') {
                    if (input.checked) {
                        dataMap[input.name] = input.value;
                    }
                } else {
                    if (input.value.trim() !== '') {
                        dataMap[input.name] = input.value;
                    }
                }
            }
        });

        // Map names to titles safely
        let titles = {};
        const inputsDataEl = document.querySelector('.tn-atom__inputs-textarea') || document.querySelector('.tn-atom__inputs-data');
        if (inputsDataEl) {
            try {
                const jsonText = inputsDataEl.value || inputsDataEl.textContent || inputsDataEl.getAttribute('data-value');
                if (jsonText) {
                    const inputsData = JSON.parse(jsonText);
                    inputsData.forEach(item => {
                        if (item.li_nm) titles[item.li_nm] = item.li_title || item.li_nm;
                        if (item.li_name) titles[item.li_name] = item.li_title || item.li_nm;
                    });
                }
            } catch (err) {}
        }

        let message = "🎉 Новая анкета (Максим и Анна):\n\n";
        for (let key in dataMap) {
            let title = titles[key] || key;
            message += `🔹 ${title}:\n${dataMap[key]}\n\n`;
        }

        if (Object.keys(dataMap).length === 0) {
            message += "(Форма отправлена пустой)\n";
        }

        const botToken = "8615039987:AAGOvrFohHpEI2sw65HOd2dFlFVjoB6_Suw";
        const chatId = "7792139795";
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

        let originalText = "ОТПРАВИТЬ";
        if (submitBtn) {
            originalText = submitBtn.textContent || submitBtn.value || "ОТПРАВИТЬ";
            if (submitBtn.tagName === 'INPUT') submitBtn.value = "Отправка...";
            else submitBtn.textContent = "Отправка...";
            submitBtn.style.opacity = "0.7";
            submitBtn.style.pointerEvents = "none";
        }

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message
            })
        }).then(response => {
            if (response.ok) {
                const successBox = formEl.querySelector('.t-form__successbox') || document.querySelector('.t-form__successbox');
                const errorBox = formEl.querySelector('.t-form__errorbox-wrapper') || document.querySelector('.t-form__errorbox-wrapper');
                if (errorBox) errorBox.style.display = 'none';
                
                if (successBox) {
                    successBox.style.display = 'block';
                    successBox.innerHTML = '<div class="t-form__successbox-text" style="color:green; font-weight:bold; font-size: 20px;">Спасибо! Ждем вас на свадьбе! ❤️</div>';
                } else {
                    alert('Спасибо! Ваши ответы успешно отправлены. Ждем вас на свадьбе! ❤️');
                }
                formEl.reset();
            } else {
                alert('Произошла ошибка при отправке в Telegram. Пожалуйста, попробуйте еще раз.');
            }
        }).catch(error => {
            alert('Ошибка сети. Проверьте подключение к интернету и попробуйте еще раз.');
        }).finally(() => {
            if (submitBtn) {
                if (submitBtn.tagName === 'INPUT') submitBtn.value = originalText;
                else submitBtn.textContent = originalText;
                submitBtn.style.opacity = "1";
                submitBtn.style.pointerEvents = "auto";
            }
        });
    }
}, true);

// Just in case Tilda intercepts the button click instead of the form submit,
// we also attach a capture click listener to the submit button that manually triggers our logic.
document.addEventListener('click', function(e) {
    const submitBtn = e.target.closest('.t-submit') || e.target.closest('button[type="submit"]');
    if (submitBtn) {
        const formEl = submitBtn.closest('.t-form') || submitBtn.closest('form');
        if (formEl) {
            // Check if the form is valid natively (required fields)
            if (formEl.checkValidity && !formEl.checkValidity()) {
                // Let the browser show the native validation tooltip
                return;
            }
            e.preventDefault();
            e.stopImmediatePropagation();
            // Dispatch a submit event on the form so our submit handler catches it
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            formEl.dispatchEvent(submitEvent);
        }
    }
}, true);
