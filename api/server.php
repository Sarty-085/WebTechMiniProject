<?php
// Exp 10, 11, 13, 14, 15: AJAX JSON/XML, Batch JSON, File Handling, ArrayIterator & Validation
$logFile = __DIR__ . '/../data/appointments.txt';
$action = $_GET['action'] ?? '';
$contentType = trim($_SERVER['CONTENT_TYPE'] ?? '');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'logs') {
        header('Content-Type: application/json; charset=UTF-8');
        $lines = [];
        if (file_exists($logFile)) {
            $fp = fopen($logFile, 'r');
            while (($line = fgets($fp)) !== false) {
                $t = trim($line);
                if ($t !== '') $lines[] = $t;
            }
            fclose($fp);
        }
        $departments = ['General Medicine', 'Cardiology', 'Orthopaedics', 'Paediatrics'];
        sort($departments);
        $iter = new ArrayIterator($departments);
        $sortedDepts = [];
        while ($iter->valid()) {
            $sortedDepts[] = $iter->current();
            $iter->next();
        }
        echo json_encode(['count' => count($lines), 'logs' => array_slice($lines, -5), 'departments' => $sortedDepts]);
        exit;
    }
    if ($action === 'clear') {
        header('Content-Type: application/json; charset=UTF-8');
        $deleted = file_exists($logFile) ? unlink($logFile) : false;
        echo json_encode(['message' => $deleted ? 'Appointment log cleared.' : 'No log file to delete.']);
        exit;
    }
}

$raw = file_get_contents('php://input');

if (stripos($contentType, 'application/xml') !== false) {
    header('Content-Type: text/plain; charset=UTF-8');
    if (function_exists('simplexml_load_string')) {
        libxml_use_internal_errors(true);
        $xml = simplexml_load_string($raw);
        if (!$xml) {
            http_response_code(400);
            echo 'Invalid XML payload.';
            exit;
        }
        $name = (string)($xml->name ?? '');
        $msg = (string)($xml->message ?? '');
    } else {
        preg_match('/<name>(.*?)<\/name>/s', $raw, $mName);
        preg_match('/<message>(.*?)<\/message>/s', $raw, $mMsg);
        $name = $mName[1] ?? '';
        $msg = $mMsg[1] ?? '';
    }
    $name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
    $msg = htmlspecialchars($msg, ENT_QUOTES, 'UTF-8');
    echo "Received XML Inquiry -> Name: $name | Message: $msg";
    exit;
}

header('Content-Type: application/json; charset=UTF-8');
$data = json_decode($raw, true);

if ($action === 'batch') {
    if (!is_array($data) || count($data) === 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid or empty JSON array.']);
        exit;
    }
    $processed = [];
    foreach ($data as $item) {
        if (!empty($item['name']) && !empty($item['age']) && !empty($item['test'])) {
            array_push($processed, [
                'name' => htmlspecialchars(trim((string)$item['name']), ENT_QUOTES, 'UTF-8'),
                'age' => (int)$item['age'],
                'test' => htmlspecialchars(trim((string)$item['test']), ENT_QUOTES, 'UTF-8')
            ]);
        }
    }
    echo json_encode(['message' => 'Batch tests scheduled.', 'count' => count($processed), 'items' => $processed]);
    exit;
}

if ($action === 'book') {
    $errors = [];
    $name = trim((string)($data['name'] ?? ''));
    $email = trim((string)($data['email'] ?? ''));
    $phone = trim((string)($data['phone'] ?? ''));
    $age = (int)($data['age'] ?? 0);
    $dept = trim((string)($data['department'] ?? ''));
    $doctor = trim((string)($data['doctor'] ?? ''));
    $date = trim((string)($data['date'] ?? ''));

    if ($name === '' || !preg_match('/^[A-Za-z\s]+$/', $name)) $errors[] = 'Name must contain only letters and spaces.';
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Valid email is required.';
    if (!preg_match('/^[0-9]{10}$/', $phone)) $errors[] = 'Phone must be 10 digits.';
    if ($age < 1 || $age > 120) $errors[] = 'Age must be between 1 and 120.';
    if ($dept === '' || $doctor === '' || $date === '') $errors[] = 'Department, doctor, and date are required.';

    if (count($errors) > 0) {
        http_response_code(400);
        echo json_encode(['flag' => 'NOTOK', 'errors' => $errors]);
        exit;
    }

    $bookingId = 'CC-' . rand(1000, 9999);
    $entry = "$bookingId | $name | $dept | $doctor | $date\n";
    $fp = fopen($logFile, 'a');
    fwrite($fp, $entry);
    fclose($fp);

    echo json_encode([
        'flag' => 'OK',
        'bookingId' => $bookingId,
        'message' => 'Appointment confirmed!',
        'summary' => htmlspecialchars("$name ($dept - $doctor) on $date", ENT_QUOTES, 'UTF-8')
    ]);
    exit;
}

if (is_array($data) && isset($data['name'])) {
    $name = htmlspecialchars((string)$data['name'], ENT_QUOTES, 'UTF-8');
    $msg = htmlspecialchars((string)($data['message'] ?? ''), ENT_QUOTES, 'UTF-8');
    echo json_encode(['reply' => "Received JSON Inquiry -> Name: $name | Message: $msg"]);
    exit;
}

http_response_code(400);
echo json_encode(['error' => 'Unsupported request.']);
