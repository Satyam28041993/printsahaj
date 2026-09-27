<?php
// Router for `php -S` that sends the same security headers as site/.htaccess,
// so a CSP mistake shows up locally too.
//   FINANCE_CONFIG=/path/config.php php -S 127.0.0.1:8770 -t finance/site finance/tests/dev-router.php
header("Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
header('X-Frame-Options: DENY');
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (preg_match('#^/(src|tests)(/|$)|config(\.example)?\.php$#', $path)) {
    http_response_code(404);
    exit;
}
return false;
