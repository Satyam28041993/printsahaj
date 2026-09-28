<?php
/**
 * Copy this file to domains/printsahaj.com/finance-config.php on Hostinger
 * (one level ABOVE public_html, so the web can never serve it) and fill it in.
 * Never commit the real file.
 */
return [
    'db' => [
        'host' => 'localhost',
        'port' => 3306,
        'name' => 'u205537795_finance',
        'user' => 'u205537795_finance',
        'pass' => 'PUT-THE-DATABASE-PASSWORD-HERE',
    ],
    // Needed once, on the first-time setup page. Any long random text.
    // After both accounts exist you can blank it.
    'setup_token' => 'PUT-A-LONG-RANDOM-SETUP-CODE-HERE',
    // Google Gemini key for the AI tab — the same kind of key PrintVerify uses
    // (aistudio.google.com → Get API key). Leave empty to keep AI off.
    'gemini_api_key' => '',
    // Optional: pin a model. By default it tries gemini-2.5-flash, then the fallbacks.
    // 'gemini_model' => 'gemini-2.5-flash',
    'allowed_hosts' => ['finance.printsahaj.com'],
    'secure_cookies' => true,
];
