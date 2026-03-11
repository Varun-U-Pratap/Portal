<?php
// ============================================================
// GET /api/departments.php
// Returns all departments as JSON.
// ============================================================

require_once __DIR__ . '/config.php';

$pdo  = getDB();
$stmt = $pdo->query('SELECT id, dept_name FROM departments ORDER BY dept_name ASC');
$rows = $stmt->fetchAll();

jsonResponse($rows);
