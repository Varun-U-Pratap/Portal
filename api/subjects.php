<?php
// ============================================================
// GET /api/subjects.php?dept_id=<id>
// Returns subjects for a given department (prepared statement).
// ============================================================

require_once __DIR__ . '/config.php';

if (!isset($_GET['dept_id']) || !ctype_digit((string)$_GET['dept_id'])) {
    jsonResponse(['error' => 'Invalid or missing dept_id parameter.'], 400);
}

$deptId = (int)$_GET['dept_id'];
$pdo = getDB();

$stmt = $pdo->prepare(
    'SELECT subject_code, subject_name, credits
     FROM   subjects
     WHERE  dept_id = :dept_id
     ORDER  BY subject_name ASC'
);
$stmt->execute([':dept_id' => $deptId]);
$rows = $stmt->fetchAll();

jsonResponse($rows);
