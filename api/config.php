<?php
// ============================================================
// Resurgence Portal – Database Configuration
// ============================================================
// Load database configuration from env.ini
$envFile = __DIR__ . '/env.ini';
$env = [];

if (file_exists($envFile)) {
    $env = parse_ini_file($envFile);
} else {
    // Fallback or error if env.ini doesn't exist
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Database configuration file missing.']);
    exit;
}

define('DB_HOST', $env['DB_HOST'] ?? 'localhost');
define('DB_NAME', $env['DB_NAME'] ?? 'resurgence');
define('DB_USER', $env['DB_USER'] ?? 'root');
define('DB_PASS', $env['DB_PASS'] ?? '');
define('DB_CHARSET', $env['DB_CHARSET'] ?? 'utf8mb4');
define('ALLOWED_ORIGIN', $env['ALLOWED_ORIGIN'] ?? '');

/**
 * Returns a PDO instance with secure defaults.
 */
function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = sprintf(
            'mysql:host=%s;dbname=%s;charset=%s',
            DB_HOST, DB_NAME, DB_CHARSET
        );
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            error_log('Database connection failed: ' . $e->getMessage());
            echo json_encode(['error' => 'Database connection failed.']);
            exit;
        }
    }
    return $pdo;
}

// Common JSON response helper
function jsonResponse(mixed $data, int $statusCode = 200): void {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    if (ALLOWED_ORIGIN) {
        header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
    }
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
