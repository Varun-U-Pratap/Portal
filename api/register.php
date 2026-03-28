<?php
// ============================================================
// POST /api/register.php
// Body (JSON): { usn, name, semester, dept_id, subjects: [] }
// Inserts student + registrations inside a single transaction.
// ============================================================

require_once __DIR__ . '/config.php';

// ── Only allow POST ──────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed.'], 405);
}

// ── Parse & validate body ────────────────────────────────────
$body = json_decode(file_get_contents('php://input'), true);

if (!$body) {
    jsonResponse(['error' => 'Invalid JSON body.'], 400);
}

$usn = trim($body['usn'] ?? '');
$name = trim($body['name'] ?? '');
$semester = (int)($body['semester'] ?? 0);
$deptId = (int)($body['dept_id'] ?? 0);
$subjects = $body['subjects'] ?? [];

if (!$usn || !$name || $semester < 1 || $semester > 8 || $deptId < 1 || !is_array($subjects) || count($subjects) === 0) {
    jsonResponse(['error' => 'Missing or invalid fields.'], 422);
}

$pdo = getDB();

// ── Transaction ──────────────────────────────────────────────
try {
    $pdo->beginTransaction();

    // 1. Insert student (or update name/semester if USN already exists)
    $stmtStudent = $pdo->prepare(
        'INSERT INTO students (usn, name, semester, dept_id)
         VALUES (:usn, :name, :semester, :dept_id)
         ON DUPLICATE KEY UPDATE
             name     = VALUES(name),
             semester = VALUES(semester),
             dept_id  = VALUES(dept_id)'
    );
    $stmtStudent->execute([
        ':usn' => $usn,
        ':name' => $name,
        ':semester' => $semester,
        ':dept_id' => $deptId,
    ]);

    // Fetch the student id (handles both INSERT and UPDATE)
    $studentId = (int)$pdo->lastInsertId();
    if ($studentId === 0) {
        // USN existed – fetch the existing id
        $stmtId = $pdo->prepare('SELECT id FROM students WHERE usn = :usn');
        $stmtId->execute([':usn' => $usn]);
        $studentId = (int)$stmtId->fetchColumn();
    }

    // 2. Delete registrations that are no longer selected
    $placeholders = str_repeat('?,', count($subjects) - 1) . '?';
    $stmtDel = $pdo->prepare("DELETE FROM registrations WHERE student_id = ? AND subject_code NOT IN ($placeholders)");
    $params = array_merge([$studentId], $subjects);
    $stmtDel->execute($params);

    // 3. Insert each selected subject
    $stmtReg = $pdo->prepare(
        'INSERT IGNORE INTO registrations (student_id, subject_code)
         VALUES (:student_id, :subject_code)'
    );
    foreach ($subjects as $code) {
        $code = trim((string)$code);
        if ($code) {
            $stmtReg->execute([
                ':student_id' => $studentId,
                ':subject_code' => $code,
            ]);
        }
    }

    $pdo->commit();

    jsonResponse([
        'success' => true,
        'student_id' => $studentId,
        'message' => 'Registration completed successfully.',
    ], 201);

}
catch (PDOException $e) {
    $pdo->rollBack();
    jsonResponse(['error' => 'Registration failed. Please try again.'], 500);
}
