const auth = firebase.auth();

// Check auth state
auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('loginCard').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        loadShipments();
    } else {
        document.getElementById('loginCard').style.display = 'block';
        document.getElementById('dashboard').style.display = 'none';
    }
});

function doLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errEl = document.getElementById('loginError');

    if (!email || !password) {
        errEl.style.display = 'block';
        errEl.textContent = 'Please enter email and password.';
        return;
    }

    if (firebaseConfig.apiKey === "YOUR_API_KEY") {
        errEl.style.display = 'block';
        errEl.textContent = 'Firebase is not configured. Follow README.md instructions first.';
        return;
    }

    errEl.style.display = 'none';
    auth.signInWithEmailAndPassword(email, password)
        .catch(err => {
            errEl.style.display = 'block';
            errEl.textContent = err.message;
        });
}

function doLogout() {
    auth.signOut();
}

function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'GLS-2026-';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function addShipment(e) {
    e.preventDefault();
    const code = generateCode();
    const data = {
        code: code,
        sender: document.getElementById('sender').value.trim(),
        receiver: document.getElementById('receiver').value.trim(),
        item: document.getElementById('item').value.trim(),
        origin: document.getElementById('origin').value.trim(),
        destination: document.getElementById('destination').value.trim(),
        status: document.getElementById('status').value,
        date: new Date().toLocaleDateString(),
        lastUpdate: new Date().toLocaleString(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    const addBtn = document.getElementById('addBtn');
    addBtn.disabled = true;
    addBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    db.collection('shipments').add(data)
        .then(() => {
            document.getElementById('codeBox').style.display = 'block';
            document.getElementById('newCode').textContent = code;
            document.getElementById('addSuccess').style.display = 'block';
            document.getElementById('addError').style.display = 'none';
            document.getElementById('addForm').reset();
            loadShipments();
            setTimeout(() => {
                document.getElementById('addSuccess').style.display = 'none';
            }, 4000);
        })
        .catch(err => {
            document.getElementById('addError').style.display = 'block';
            document.getElementById('addError').textContent = err.message;
        })
        .finally(() => {
            addBtn.disabled = false;
            addBtn.innerHTML = '<i class="fas fa-barcode"></i> Generate Tracking Code & Save';
        });
}

function loadShipments() {
    const loading = document.getElementById('tableLoading');
    const table = document.getElementById('shipTable');
    const empty = document.getElementById('emptyMsg');
    const tbody = document.getElementById('shipBody');

    loading.style.display = 'block';
    table.style.display = 'none';
    empty.style.display = 'none';

    db.collection('shipments').orderBy('createdAt', 'desc').get()
        .then(snapshot => {
            loading.style.display = 'none';
            if (snapshot.empty) {
                empty.style.display = 'block';
                return;
            }
            table.style.display = 'table';
            tbody.innerHTML = '';
            snapshot.forEach(doc => {
                const s = doc.data();
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${s.code}</strong></td>
                    <td>${s.sender}</td>
                    <td>${s.receiver}</td>
                    <td>${s.item}</td>
                    <td>
                        <select class="status-select" data-id="${doc.id}">
                            <option value="Pending" ${s.status==='Pending'?'selected':''}>Pending</option>
                            <option value="In Transit" ${s.status==='In Transit'?'selected':''}>In Transit</option>
                            <option value="Delivered" ${s.status==='Delivered'?'selected':''}>Delivered</option>
                            <option value="Exception" ${s.status==='Exception'?'selected':''}>Exception</option>
                        </select>
                    </td>
                    <td>
                        <button class="btn-del" data-id="${doc.id}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Status change handlers
            tbody.querySelectorAll('.status-select').forEach(sel => {
                sel.addEventListener('change', function() {
                    const id = this.getAttribute('data-id');
                    db.collection('shipments').doc(id).update({
                        status: this.value,
                        lastUpdate: new Date().toLocaleString()
                    });
                });
            });

            // Delete handlers
            tbody.querySelectorAll('.btn-del').forEach(btn => {
                btn.addEventListener('click', function() {
                    if (confirm('Delete this shipment?')) {
                        const id = this.getAttribute('data-id');
                        db.collection('shipments').doc(id).delete().then(loadShipments);
                    }
                });
            });
        })
        .catch(err => {
            loading.style.display = 'none';
            empty.style.display = 'block';
            empty.textContent = 'Error loading: ' + err.message;
        });
}

// Enter key for login
document.getElementById('loginPassword').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') doLogin();
});
