/* 
 * -----------------------------------------------------------
 * TELEGRAM FORM INTERCEPTOR SCRIPT (Tilda Compatible)
 * -----------------------------------------------------------
 * Автор: ИИ-ассистент (Antigravity)
 * Дата: 27 июля 2026 г.
 * Описание:
 * Этот скрипт создан для перехвата стандартной отправки формы Тильды
 * и перенаправления собранных данных напрямую в Telegram-бота. 
 * Он игнорирует внутренние механизмы отправки Тильды (обходя любые блокировки и ошибки), 
 * читает все поля `input` и радио-кнопки, затем делает POST-запрос в Telegram API.
 * 
 * Использование: Вставить этот код прямо в низ файла `index.html` перед </body>
 * -----------------------------------------------------------
 */

(function() {
    function sendToTelegram(formEl, submitBtn) {
        // Защита от двойного клика
        if (submitBtn && submitBtn.getAttribute('data-sending') === 'true') return;
        if (submitBtn) submitBtn.setAttribute('data-sending', 'true');

        // Сбор данных из всех полей формы
        const inputs = formEl.querySelectorAll('input, textarea, select');
        let dataMap = {};
        inputs.forEach(input => {
            if (input.name && !input.name.includes('tildaspec') && !input.name.includes('form-spec') && input.name !== 'formservices[]') {
                if (input.type === 'radio' || input.type === 'checkbox') {
                    if (input.checked) dataMap[input.name] = input.value;
                } else {
                    if (input.value.trim() !== '') dataMap[input.name] = input.value;
                }
            }
        });

        // Попытка вытащить человекочитаемые названия полей (titles) из конфигурации Тильды
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

        // Формирование сообщения
        let message = "🎉 Новая анкета (Максим и Анна):\n\n";
        let hasData = false;
        for (let key in dataMap) {
            let title = titles[key] || key;
            message += `🔹 ${title}:\n${dataMap[key]}\n\n`;
            hasData = true;
        }

        if (!hasData) {
            message += "(Форма отправлена пустой)\n";
        }

        // Учетные данные Telegram бота
        const botToken = "8615039987:AAGOvrFohHpEI2sw65HOd2dFlFVjoB6_Suw";
        const chatId = "770473480";
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

        // Визуальная индикация отправки на кнопке
        let originalText = "ОТПРАВИТЬ";
        if (submitBtn) {
            originalText = submitBtn.textContent || submitBtn.value || "ОТПРАВИТЬ";
            if (submitBtn.tagName === 'INPUT') submitBtn.value = "Отправка...";
            else submitBtn.textContent = "Отправка...";
            submitBtn.style.opacity = "0.7";
        }

        // Сетевой запрос
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: message })
        }).then(response => {
            if (response.ok) {
                // Успешная отправка
                const successBox = formEl.querySelector('.t-form__successbox') || document.querySelector('.t-form__successbox');
                const errorBox = formEl.querySelector('.t-form__errorbox-wrapper') || document.querySelector('.t-form__errorbox-wrapper');
                if (errorBox) errorBox.style.display = 'none';
                if (successBox) {
                    successBox.style.display = 'block';
                    successBox.innerHTML = '<div class="t-form__successbox-text" style="color:green; font-weight:bold; font-size: 20px;">Спасибо! Ждем вас на свадьбе! ❤️</div>';
                } else {
                    alert('Спасибо! Ваши ответы успешно отправлены. Ждем вас на свадьбе! ❤️');
                }
                if (formEl.reset) formEl.reset();
            } else {
                alert('Произошла ошибка при отправке в Telegram. Пожалуйста, попробуйте еще раз.');
            }
        }).catch(error => {
            alert('Ошибка сети. Проверьте подключение к интернету.');
        }).finally(() => {
            // Возвращаем кнопку в исходное состояние
            if (submitBtn) {
                if (submitBtn.tagName === 'INPUT') submitBtn.value = originalText;
                else submitBtn.textContent = originalText;
                submitBtn.style.opacity = "1";
                submitBtn.removeAttribute('data-sending');
            }
        });
    }

    // Перехват клика по кнопке "ОТПРАВИТЬ" (Capture Phase)
    document.addEventListener('click', function(e) {
        const submitBtn = e.target.closest('.t-submit') || e.target.closest('button[type="submit"]');
        if (submitBtn) {
            const formEl = submitBtn.closest('.t-form') || submitBtn.closest('form');
            if (formEl) {
                if (formEl.checkValidity && !formEl.checkValidity()) return;
                e.preventDefault();
                e.stopImmediatePropagation();
                sendToTelegram(formEl, submitBtn);
            }
        }
    }, true);

    // Дополнительный перехват события 'submit' (Capture Phase)
    document.addEventListener('submit', function(e) {
        const formEl = e.target.closest('.t-form') || e.target.closest('form');
        if (formEl) {
            e.preventDefault();
            e.stopImmediatePropagation();
            const submitBtn = formEl.querySelector('button[type="submit"]') || formEl.querySelector('.t-submit');
            sendToTelegram(formEl, submitBtn);
        }
    }, true);
})();
