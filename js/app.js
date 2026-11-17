// Exp 7, 9, 10, 11, 12, 13: JS Basics, DOM, Events, AJAX (JSON/XML) & Error Handling
const DOCTORS = [
    { id: 'ananya', name: 'Dr. Ananya Sharma', dept: 'cardiology', available: true },
    { id: 'rahul', name: 'Dr. Rahul Mehta', dept: 'orthopaedics', available: true },
    { id: 'priya', name: 'Dr. Priya Nair', dept: 'paediatrics', available: true },
    { id: 'arjun', name: 'Dr. Arjun Kapoor', dept: 'general', available: true },
    { id: 'temp', name: 'Dr. On Leave', dept: 'general', available: false }
];

const testQueue = [
    { name: 'Asha', age: 29, test: 'Complete Blood Count' },
    { name: 'Rahul', age: 42, test: 'Lipid Profile' }
];

function initPage() {
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date();
        const maxDate = new Date();
        maxDate.setDate(today.getDate() + 90);
        dateInput.min = today.toISOString().split('T')[0];
        dateInput.max = maxDate.toISOString().split('T')[0];
    }
    renderQueue();
    loadHospitalJSON();
}

// Exp 7: switch, for, continue, break, return + DOM .textContent & .style
function handleDepartmentChange() {
    const dept = document.getElementById('department').value;
    const feeBox = document.getElementById('deptFeeInfo');
    const doctorSelect = document.getElementById('doctor');

    let feeText = '';
    switch (dept) {
        case 'general': feeText = 'General Medicine | Fee: Rs. 500 | Room 101'; break;
        case 'cardiology': feeText = 'Cardiology | Fee: Rs. 900 | Room 204'; break;
        case 'orthopaedics': feeText = 'Orthopaedics | Fee: Rs. 800 | Room 302'; break;
        case 'paediatrics': feeText = 'Paediatrics | Fee: Rs. 600 | Room 108'; break;
        default: feeText = 'Select a department to view consultation fee.';
    }
    feeBox.textContent = feeText;
    feeBox.style.color = dept ? '#0d47a1' : '#546e7a';

    doctorSelect.innerHTML = '<option value="">-- Select Doctor --</option>';
    if (!dept) return;

    for (let i = 0; i < DOCTORS.length; i++) {
        if (!DOCTORS[i].available) continue;
        if (DOCTORS[i].dept === dept) {
            const opt = document.createElement('option');
            opt.value = DOCTORS[i].id;
            opt.textContent = DOCTORS[i].name;
            doctorSelect.appendChild(opt);
            break;
        }
    }
}

// Exp 7: Conditionals + DOM manipulation
function calculateBMI() {
    const w = parseFloat(document.getElementById('bmiWeight').value);
    const hCm = parseFloat(document.getElementById('bmiHeight').value);
    const out = document.getElementById('bmiResult');
    if (!w || !hCm || w <= 0 || hCm <= 0) {
        out.textContent = 'Enter valid weight (kg) and height (cm).';
        out.style.color = '#c62828';
        return;
    }
    const bmi = (w / ((hCm / 100) ** 2)).toFixed(1);
    let status = 'Normal';
    if (bmi < 18.5) status = 'Underweight';
    else if (bmi >= 25 && bmi < 30) status = 'Overweight';
    else if (bmi >= 30) status = 'Obese';

    out.textContent = `BMI: ${bmi} (${status})`;
    out.style.color = status === 'Normal' ? '#2e7d32' : '#e65100';
}

// Exp 9: Event handlers (onkeydown, onfocus, onblur, onreset, onmouseover/out)
function filterDoctors() {
    const query = document.getElementById('doctorSearch').value.toLowerCase();
    const cards = document.querySelectorAll('.doctor-card');
    cards.forEach(card => {
        card.style.display = card.textContent.toLowerCase().includes(query) ? 'block' : 'none';
    });
}

function updateCharCount() {
    const len = document.getElementById('problem').value.length;
    document.getElementById('charCount').textContent = `${len} / 250 characters`;
}

function highlightField(el) {
    el.style.backgroundColor = '#e3f2fd';
}

function validateFieldOnBlur(el) {
    el.style.backgroundColor = '';
    const hint = document.getElementById('fieldHint');
    if (el.id === 'phone' && el.value && !/^[0-9]{10}$/.test(el.value)) {
        hint.textContent = 'Phone number must be exactly 10 digits.';
        hint.style.color = '#c62828';
    } else {
        hint.textContent = '';
    }
}

function handleFormReset() {
    document.getElementById('appointmentResult').textContent = 'Form cleared.';
    document.getElementById('deptFeeInfo').textContent = '';
}

// Exp 12: Shared XMLHttpRequest helper with status, onerror, and ontimeout
function sendXHR(method, url, body, contentType, onSuccess, onError) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.timeout = 4000;
    if (contentType) xhr.setRequestHeader('Content-Type', contentType);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                onSuccess(xhr);
            } else {
                const msg = xhr.status === 0
                    ? 'Network Error: Server unreachable.'
                    : `HTTP ${xhr.status}: ${xhr.responseText || xhr.statusText}`;
                onError(msg);
            }
        }
    };
    xhr.onerror = () => onError('Network Error: Check your connection or server.');
    xhr.ontimeout = () => onError('Timeout Error: Server took longer than 4 seconds.');
    xhr.send(body);
}

function showStatus(id, text, isError = false) {
    const el = document.getElementById(id);
    el.textContent = text;
    el.className = isError ? 'output-box error-box' : 'output-box';
}

// Exp 10: GET JSON
function loadHospitalJSON() {
    sendXHR('GET', 'data/hospital_data.json', null, null, (xhr) => {
        const data = JSON.parse(xhr.responseText);
        document.getElementById('bedMeter').value = data.bedsOccupied;
        document.getElementById('bedText').textContent = `${data.bedsOccupied}% of hospital beds are currently occupied.`;
        document.getElementById('opdProgress').value = data.opdProgress;
        document.getElementById('opdText').textContent = `${data.opdProgress}% of today's appointment slots are planned.`;
        const lines = data.departments.map(d => `${d.name}: ${d.doctorsOnDuty} doctors (Wait ~${d.waitMins}m)`);
        showStatus('liveOutput', 'GET JSON ->\n' + lines.join('\n'));
    }, (err) => showStatus('liveOutput', err, true));
}

// Exp 10: GET XML
function loadNoticesXML() {
    sendXHR('GET', 'data/notices.xml', null, null, (xhr) => {
        const xml = xhr.responseXML;
        const nodes = xml.getElementsByTagName('notice');
        const out = [];
        for (let i = 0; i < nodes.length; i++) {
            const title = nodes[i].getElementsByTagName('title')[0].textContent;
            const dept = nodes[i].getElementsByTagName('department')[0].textContent;
            out.push(`[${dept}] ${title}`);
        }
        showStatus('liveOutput', 'GET XML ->\n' + out.join('\n'));
    }, (err) => showStatus('liveOutput', err, true));
}

// Exp 12: Error handling demo
function testErrorHandling() {
    sendXHR('GET', 'api/nonexistent.php', null, null, () => {}, (err) => {
        showStatus('liveOutput', 'Handled Error -> ' + err, true);
    });
}

// Exp 10: POST JSON or XML
function sendQuickInquiry(format) {
    const name = document.getElementById('inqName').value.trim();
    const message = document.getElementById('inqMsg').value.trim();
    if (!name || !message) {
        showStatus('inquiryOutput', 'Please enter both name and message.', true);
        return;
    }
    if (format === 'xml') {
        const xmlBody = `<inquiry><name>${name}</name><message>${message}</message></inquiry>`;
        sendXHR('POST', 'api/server.php', xmlBody, 'application/xml',
            (xhr) => showStatus('inquiryOutput', xhr.responseText),
            (err) => showStatus('inquiryOutput', err, true));
    } else {
        sendXHR('POST', 'api/server.php', JSON.stringify({ name, message }), 'application/json',
            (xhr) => showStatus('inquiryOutput', JSON.parse(xhr.responseText).reply),
            (err) => showStatus('inquiryOutput', err, true));
    }
}

// Exp 11: Multiple JSON Objects in single AJAX POST
function addToQueue() {
    const name = document.getElementById('qName').value.trim();
    const age = parseInt(document.getElementById('qAge').value, 10);
    const test = document.getElementById('qTest').value;
    if (!name || !age) return;
    testQueue.push({ name, age, test });
    renderQueue();
}

function renderQueue() {
    const el = document.getElementById('queueList');
    if (el) el.textContent = testQueue.map((item, i) => `${i + 1}. ${item.name} (${item.age}) - ${item.test}`).join('\n');
}

function submitBatchQueue() {
    sendXHR('POST', 'api/server.php?action=batch', JSON.stringify(testQueue), 'application/json', (xhr) => {
        const res = JSON.parse(xhr.responseText);
        const list = res.items.map((x, i) => `${i + 1}. ${x.name} (${x.age}) - ${x.test}`).join('\n');
        showStatus('queueOutput', `${res.message} (${res.count} items)\n${list}`);
    }, (err) => showStatus('queueOutput', err, true));
}

// Exp 13: Dynamic User Input with JSON in AJAX
function submitAppointmentAJAX(event) {
    event.preventDefault();
    const payload = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        age: document.getElementById('age').value.trim(),
        department: document.getElementById('department').value,
        doctor: document.getElementById('doctor').value,
        date: document.getElementById('date').value
    };
    sendXHR('POST', 'api/server.php?action=book', JSON.stringify(payload), 'application/json', (xhr) => {
        const res = JSON.parse(xhr.responseText);
        showStatus('appointmentResult', `${res.message} ID: ${res.bookingId}\n${res.summary}`);
    }, (err) => showStatus('appointmentResult', err, true));
}

// Exp 14: Read & Clear Server Logs
function loadServerLogs() {
    sendXHR('GET', 'api/server.php?action=logs', null, null, (xhr) => {
        const res = JSON.parse(xhr.responseText);
        showStatus('liveOutput', `Saved Bookings (${res.count}):\n${res.logs.join('\n') || 'None yet'}`);
    }, (err) => showStatus('liveOutput', err, true));
}

function clearServerLogs() {
    sendXHR('GET', 'api/server.php?action=clear', null, null, (xhr) => {
        const res = JSON.parse(xhr.responseText);
        showStatus('liveOutput', res.message);
    }, (err) => showStatus('liveOutput', err, true));
}
