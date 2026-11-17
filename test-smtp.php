<?php
/**
 * Quick SMTP Connection & Delivery Diagnostic Tool
 * Run in browser (http://localhost/.../test-smtp.php) or CLI (php test-smtp.php)
 */

require_once __DIR__ . '/includes/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/includes/PHPMailer/SMTP.php';
require_once __DIR__ . '/includes/PHPMailer/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$config = file_exists(__DIR__ . '/smtp-config.php') ? require __DIR__ . '/smtp-config.php' : [];

header('Content-Type: text/html; charset=UTF-8');
echo "<!DOCTYPE html><html><head><title>SMTP Test Diagnostic</title><style>
body { font-family: monospace; background: #0b132b; color: #f1f5f9; padding: 30px; }
.card { background: #1e293b; padding: 20px; border-radius: 10px; max-width: 700px; margin: auto; border: 1px solid #334155; }
.success { color: #10b981; font-weight: bold; }
.danger { color: #ef4444; font-weight: bold; }
.warning { color: #f59e0b; font-weight: bold; }
h2 { margin-top: 0; color: #60a5fa; }
pre { background: #0f172a; padding: 15px; border-radius: 6px; overflow-x: auto; color: #cbd5e1; }
</style></head><body><div class='card'>";

echo "<h2>🔧 Himalayan Codex - SMTP Diagnostics</h2>";
echo "<p><strong>Target Host:</strong> " . ($config['smtp_host'] ?? 'N/A') . ":" . ($config['smtp_port'] ?? 'N/A') . " (" . ($config['smtp_secure'] ?? 'tls') . ")</p>";
echo "<p><strong>User:</strong> " . ($config['smtp_user'] ?? 'N/A') . "</p>";
echo "<p><strong>Recipient:</strong> " . ($config['to_email'] ?? 'N/A') . "</p>";

$appPass = trim(str_replace(' ', '', $config['smtp_pass'] ?? ''));

if (empty($appPass)) {
    echo "<p class='warning'>⚠️ App Password is currently EMPTY!</p>";
    echo "<p>Please edit <code>smtp-config.php</code> and paste your 16-character Google App Password into <code>'smtp_pass'</code>.</p>";
    echo "<p>How to get it:</p><ol>
    <li>Visit <a href='https://myaccount.google.com/apppasswords' target='_blank' style='color:#60a5fa;'>https://myaccount.google.com/apppasswords</a></li>
    <li>Log in to <strong>" . ($config['smtp_user'] ?? 'your Google account') . "</strong></li>
    <li>Generate a new password for 'Website Mailer'</li>
    <li>Paste the 16 characters in <code>smtp-config.php</code></li>
    </ol>";
    echo "</div></body></html>";
    exit;
}

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = $config['smtp_host'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $config['smtp_user'];
    $mail->Password   = $appPass;
    $mail->SMTPSecure = ($config['smtp_secure'] === 'ssl') ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = $config['smtp_port'];
    $mail->SMTPDebug  = 2;

    $mail->setFrom($config['from_email'], $config['from_name']);
    $mail->addAddress($config['to_email'], $config['to_name']);

    $mail->isHTML(true);
    $mail->Subject = '✅ SMTP Test Email - HIMALAYAN CODEX';
    $mail->Body    = '<h3>SMTP Connection Successful!</h3><p>Your Gmail SMTP is now properly communicating with the server. All forms will deliver instantly to this email address.</p><p>Timestamp: ' . date('d M Y, h:i:s A') . '</p>';
    $mail->AltBody = 'SMTP Connection Successful! All forms will deliver instantly to this email address.';

    echo "<h3>Execution Log:</h3><pre>";
    $mail->send();
    echo "</pre>";

    echo "<p class='success'>🎉 SUCCESS! Test email has been delivered directly to " . htmlspecialchars($config['to_email']) . " via Gmail SMTP.</p>";
} catch (Exception $e) {
    echo "</pre>";
    echo "<p class='danger'>❌ SMTP ERROR: " . htmlspecialchars($mail->ErrorInfo) . "</p>";
    echo "<p>Check your 16-character Google App Password in <code>smtp-config.php</code>.</p>";
}

echo "</div></body></html>";
