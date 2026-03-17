<?php
// ============================================================
// GET /api/student_registrations.php?usn=<usn>
// Returns an array of previously registered subject codes.
// ============================================================

require_once __DIR__ . '/config.php';

if (!isset($_GET['usn'])) {
    jsonResponse(['error' => 'Missing USN parameter.'], 400);
}

$usn = trim($_GET['usn']);
$pdo = getDB();

$stmt = $pdo->prepare('SELECT id FROM students WHERE usn = :usn');
$stmt->execute([':usn' => $usn]);
$studentId = $stmt->fetchColumn();

if (!$studentId) {
    // Student not found, therefore no registrations
    jsonResponse(['registered_subjects' => []]);
}

$stmtReg = $pdo->prepare('SELECT subject_code FROM registrations WHERE student_id = :sid');
$stmtReg->execute([':sid' => $studentId]);
$registeredSubjects = $stmtReg->fetchAll(PDO::FETCH_COLUMN);

jsonResponse(['registered_subjects' => $registeredSubjects]);
