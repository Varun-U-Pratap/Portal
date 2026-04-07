<?php
// Prevent PHP from printing warnings/errors to the browser output
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL); // Keep logging errors, but don't "display" them
// ============================================================
// Resurgence Portal – Database Configuration
// ============================================================
$envFile = __DIR__ . '/env.ini';
$env = parse_ini_file($envFile, true);

if (file_exists($envFile)) {
    // The 'true' parameter is CRITICAL to read [database] and [server] sections
    $env = parse_ini_file($envFile, true);
} else {
    // Only send HTTP headers if we are not in Terminal
    if (php_sapi_name() !== 'cli') {
        http_response_code(500);
        header('Content-Type: application/json');
    }
    echo json_encode(['error' => 'Database configuration file missing.']);
    exit;
}

// Mapping to your env.ini structure
define('DB_HOST',        $env['database']['host'] ?? 'localhost');
define('DB_PORT',        $env['database']['port'] ?? '3306');
define('DB_NAME',        $env['database']['dbname'] ?? 'defaultdb');
define('DB_USER',        $env['database']['user'] ?? 'avnadmin');
define('DB_PASS',        $env['database']['pass'] ?? '');
define('DB_CHARSET',     'utf8mb4');
define('DB_SSL_CA',      __DIR__ . '/' . ($env['database']['ca_cert'] ?? '../certs/ca.pem'));
define('ALLOWED_ORIGIN', $env['server']['allowed_origin'] ?? '*');

/**
 * Returns a PDO instance with secure defaults and SSL for Aiven.
 */
function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=%s',
            DB_HOST, DB_PORT, DB_NAME, DB_CHARSET
        );
        
        // Handle PHP 8.5+ Deprecations for SSL and Init constants
        $isPhp85 = class_exists('Pdo\Mysql');
        
        $sslCaKey      = $isPhp85 ? \Pdo\Mysql::ATTR_SSL_CA : PDO::MYSQL_ATTR_SSL_CA;
        $sslVerifyKey  = $isPhp85 ? \Pdo\Mysql::ATTR_SSL_VERIFY_SERVER_CERT : PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT;
        $initCommandKey = $isPhp85 ? \Pdo\Mysql::ATTR_INIT_COMMAND : PDO::MYSQL_ATTR_INIT_COMMAND;

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            // Mandatory SSL for Aiven Security
            $sslCaKey      => DB_SSL_CA,
            $sslVerifyKey  => true,
            // Fail-safe for utf8mb4 encoding (PHP 8.5 Compatible)
            $initCommandKey => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ];

        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log('Database connection failed: ' . $e->getMessage());
            
            if (php_sapi_name() !== 'cli') {
                http_response_code(500);
                header('Content-Type: application/json');
            }
            echo json_encode(['error' => 'Database connection failed.']);
            exit;
        }
    }
    return $pdo;
}
/**
 * Common JSON response helper
 */
function jsonResponse(mixed $data, int $statusCode = 200): void {
    // Only send HTTP headers if we are not in Terminal (CLI)
    if (php_sapi_name() !== 'cli') {
        if (!headers_sent()) {
            http_response_code($statusCode);
            header('Content-Type: application/json');
            if (ALLOWED_ORIGIN) {
                header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
            }
        }
    }
    
    // JSON_PRETTY_PRINT makes it readable in the Terminal
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}