let currentLang = localStorage.getItem('gls_lang') || 'en';

function changeLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('gls_lang', lang);
    applyTranslations();
    if (lang === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('lang', 'ar');
    } else {
        document.documentElement.setAttribute('dir', 'ltr');
        document.documentElement.setAttribute('lang', lang);
    }
}

function applyTranslations() {
    const t = translations[currentLang] || translations.en;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) el.placeholder = t[key];
    });
    const select = document.getElementById('languageSelect');
    if (select) select.value = currentLang;
}

function toggleMenu() {
    document.getElementById('mainNav').classList.toggle('active');
}

function trackParcel() {
    const code = document.getElementById('trackingCode').value.trim().toUpperCase();
    const resultDiv = document.getElementById('trackResult');
    const loading = document.getElementById('trackLoading');
    const t = translations[currentLang] || translations.en;

    if (!code) {
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `<p style="color:#e74c3c;">${t.not_found}</p>`;
        return;
    }

    // Check if Firebase is configured
    if (firebaseConfig.apiKey === "YOUR_API_KEY") {
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `<p style="color:#e74c3c;">
            <strong>Firebase not configured yet.</strong><br>
            Please follow the instructions in README.md to connect your Firebase project.
        </p>`;
        return;
    }

    resultDiv.style.display = 'none';
    loading.style.display = 'block';

    db.collection('shipments').where('code', '==', code).limit(1).get()
        .then(snapshot => {
            loading.style.display = 'none';
            if (snapshot.empty) {
                resultDiv.style.display = 'block';
                resultDiv.innerHTML = `<p style="color:#e74c3c;">${t.not_found}</p>`;
                return;
            }
            const shipment = snapshot.docs[0].data();
            const statusClass = {
                'Pending': 'status-pending',
                'In Transit': 'status-intransit',
                'Delivered': 'status-delivered',
                'Exception': 'status-exception'
            }[shipment.status] || 'status-pending';

            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `
                <h3>${t.tracking_code}: ${shipment.code}</h3>
                <div class="status ${statusClass}">${t.status_label}: ${shipment.status}</div>
                <div class="track-details">
                    <div><span>${t.sender}:</span> ${shipment.sender}</div>
                    <div><span>${t.receiver}:</span> ${shipment.receiver}</div>
                    <div><span>${t.item}:</span> ${shipment.item}</div>
                    <div><span>${t.origin}:</span> ${shipment.origin}</div>
                    <div><span>${t.destination}:</span> ${shipment.destination}</div>
                    <div><span>${t.date}:</span> ${shipment.date || ''}</div>
                    <div><span>${t.last_update}:</span> ${shipment.lastUpdate || ''}</div>
                </div>
                <p style="margin-top:15px; font-size:0.9rem; color:#666;">
                    <i class="fas fa-info-circle"></i> ${t.track_note}
                </p>
            `;
        })
        .catch(err => {
            loading.style.display = 'none';
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `<p style="color:#e74c3c;">Error: ${err.message}<br>Check your Firebase configuration.</p>`;
        });
}

function submitContact(e) {
    e.preventDefault();
    const t = translations[currentLang] || translations.en;
    alert(t.message_sent);
    document.getElementById('contactForm').reset();
}

// Allow Enter key on tracking input
document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
    if (currentLang === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
    }
    const trackInput = document.getElementById('trackingCode');
    if (trackInput) {
        trackInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') trackParcel();
        });
    }
});

function submitQuote(e) {
    e.preventDefault();
    const name = document.getElementById('qName').value.trim();
    const phone = document.getElementById('qPhone').value.trim();
    const email = document.getElementById('qEmail').value.trim();
    const service = document.getElementById('qService').value;
    const from = document.getElementById('qFrom').value.trim();
    const to = document.getElementById('qTo').value.trim();
    const weight = document.getElementById('qWeight').value;
    const item = document.getElementById('qItem').value.trim();
    const message = document.getElementById('qMessage').value.trim();

    let text = `*GLOBAL Logistics – Quote Request*%0A%0A`;
    text += `*Name:* ${encodeURIComponent(name)}%0A`;
    text += `*Phone:* ${encodeURIComponent(phone)}%0A`;
    if (email) text += `*Email:* ${encodeURIComponent(email)}%0A`;
    text += `*Service:* ${encodeURIComponent(service)}%0A`;
    text += `*From:* ${encodeURIComponent(from)}%0A`;
    text += `*To:* ${encodeURIComponent(to)}%0A`;
    if (weight) text += `*Weight:* ${encodeURIComponent(weight)} kg%0A`;
    if (item) text += `*Item:* ${encodeURIComponent(item)}%0A`;
    if (message) text += `*Details:* ${encodeURIComponent(message)}%0A`;
    text += `%0APlease send me a quote. Thank you!`;

    const waUrl = `https://wa.me/15184168768?text=${text}`;
    window.open(waUrl, '_blank');
}
