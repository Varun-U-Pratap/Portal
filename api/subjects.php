<?php
// ============================================================
// GET /api/subjects.php?dept_id=<id>
// Returns subjects for a given department (prepared statement).
// ============================================================

require_once __DIR__ . '/config.php';

if (!isset($_GET['dept_id']) || !ctype_digit((string)$_GET['dept_id']) || !isset($_GET['semester']) || !ctype_digit((string)$_GET['semester'])) {
    jsonResponse(['error' => 'Invalid or missing parameters.'], 400);
}

$deptId = (int)$_GET['dept_id'];
$semester = (int)$_GET['semester'];
$pdo = getDB();

$stmt = $pdo->prepare(
    'SELECT subject_code, subject_name, credits
     FROM   subjects
     WHERE  dept_id = :dept_id AND semester = :semester
     ORDER  BY subject_name ASC'
);
$stmt->execute([':dept_id' => $deptId, ':semester' => $semester]);
$rows = $stmt->fetchAll();

jsonResponse($rows);
