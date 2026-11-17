<?php
// Exp 15: Server-side form validation via $_POST (used by formaction button)
$flag = 'OK';
$msg = '';

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$age = (int)($_POST['age'] ?? 0);

if ($name === '') {
    $msg .= 'Please enter your full name.<br>';
    $flag = 'NOTOK';
} elseif (!preg_match('/^[A-Za-z\s]+$/', $name)) {
    $msg .= 'Name must contain only letters and spaces.<br>';
    $flag = 'NOTOK';
}

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $msg .= 'Please enter a valid email address.<br>';
    $flag = 'NOTOK';
}

if (!preg_match('/^[0-9]{10}$/', $phone)) {
    $msg .= 'Please enter a 10-digit phone number.<br>';
    $flag = 'NOTOK';
}

if ($age < 1 || $age > 120) {
    $msg .= 'Age must be between 1 and 120.<br>';
    $flag = 'NOTOK';
}

echo '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Form Validation</title></head><body style="font-family:sans-serif;padding:30px;">';
if ($flag === 'NOTOK') {
    echo "<h2 style='color:#c62828;'>Validation Failed</h2><p>$msg</p>";
    echo '<button onclick="history.back()">Go Back</button>';
} else {
    $safeName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
    echo "<h2 style='color:#2e7d32;'>Validation Passed ($flag)</h2>";
    echo "<p>All fields for <b>$safeName</b> are valid.</p>";
    echo '<a href="../index.html">Return to CityCare Hospital</a>';
}
echo '</body></html>';
