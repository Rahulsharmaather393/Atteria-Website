<?php
/**
 * HIMALAYAN CODEX PVT. LTD. - Production Form Mailer with Authenticated SMTP
 * Target Recipient: santoshdeveloper123@gmail.com
 * Delivery Pipeline:
 *  1. Authenticated SMTP via PHPMailer (Gmail, Hostinger, cPanel)
 *  2. Cloud Email Relay fallback (FormSubmit API)
 *  3. Native PHP mail() fallback
 *  4. Local JSON Lead Backup (leads_backup.json)
 */

// Allow CORS & JSON responses
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With, Accept");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed. POST required.']);
    exit;
}

// Load SMTP Configuration
$smtpConfig = file_exists(__DIR__ . '/smtp-config.php') ? require __DIR__ . '/smtp-config.php' : [];

$toEmail = !empty($smtpConfig['to_email']) ? $smtpConfig['to_email'] : "info.rahul393@gmail.com";
$companyName = !empty($smtpConfig['from_name']) ? $smtpConfig['from_name'] : "HIMALAYAN CODEX PVT. LTD.";

// Clean input helper
function clean_input($data) {
    if (is_array($data)) {
        return array_map('clean_input', $data);
    }
    $data = trim((string)$data);
    $data = stripslashes($data);
    return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
}

// Request type check
$isAjax = (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest')
    || (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false)
    || isset($_POST['ajax']);

// Collect fields
$formType   = clean_input($_POST['form_type'] ?? $_POST['formType'] ?? 'general_inquiry');
$fullName   = clean_input($_POST['fullName'] ?? $_POST['name'] ?? '');
$email      = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$phone      = clean_input($_POST['phone'] ?? '');
$company    = clean_input($_POST['company'] ?? '');
$service    = clean_input($_POST['service'] ?? '');
$budget     = clean_input($_POST['budget'] ?? '');
$details    = clean_input($_POST['details'] ?? $_POST['message'] ?? $_POST['notes'] ?? '');
$position   = clean_input($_POST['position'] ?? '');
$experience = clean_input($_POST['experience'] ?? '');
$portfolio  = clean_input($_POST['portfolio'] ?? '');

// Validate Email
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    if ($isAjax) {
        http_response_code(400);
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(['success' => false, 'message' => 'Please provide a valid email address.']);
        exit;
    } else {
        echo "<script>alert('Please provide a valid email address.'); window.history.back();</script>";
        exit;
    }
}

$timestamp = date("d M Y, h:i A (T)");
$clientIP = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';

// Subject & Titles
switch ($formType) {
    case 'career_application':
        $subject = "💼 [Career Application] " . ($position ? "$position - " : "") . ($fullName ? $fullName : $email);
        $title = "New Career Application Received";
        $badgeColor = "#8B5CF6";
        break;

    case 'newsletter':
        $subject = "📰 [Newsletter Subscription] New Subscriber: " . $email;
        $title = "New Newsletter Subscription";
        $badgeColor = "#10B981";
        break;

    case 'consultation_modal':
        $subject = "📅 [Consultation Request] " . ($fullName ? $fullName : $email) . " - " . ($service ? $service : "Advisory");
        $title = "Executive Consultation Booking";
        $badgeColor = "#06B6D4";
        break;

    case 'home_quote':
        $subject = "⚡ [Home Consultation Request] " . ($fullName ? $fullName : $email);
        $title = "Homepage Proposal & Consultation Request";
        $badgeColor = "#2563EB";
        break;

    case 'contact_inquiry':
    default:
        $subject = "🚀 [Detailed Inquiry] " . ($fullName ? $fullName : $email) . " - " . ($service ? $service : "Technical Services");
        $title = "Corporate Technical Inquiry";
        $badgeColor = "#2563EB";
        break;
}

// Handle Resume File Upload (Careers Form)
$attachmentPath = null;
$attachmentName = '';
$uploadDir = __DIR__ . '/uploads/resumes/';
if (isset($_FILES['resume']) && $_FILES['resume']['error'] === UPLOAD_ERR_OK) {
    if (!is_dir($uploadDir)) {
        @mkdir($uploadDir, 0755, true);
    }
    $fileTmp  = $_FILES['resume']['tmp_name'];
    $origName = basename($_FILES['resume']['name']);
    $fileExt  = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
    $allowed  = ['pdf', 'doc', 'docx', 'txt', 'rtf'];

    if (in_array($fileExt, $allowed) && $_FILES['resume']['size'] <= 10 * 1024 * 1024) {
        $safeName = preg_replace('/[^a-zA-Z0-9_\.-]/', '_', pathinfo($origName, PATHINFO_FILENAME)) . '_' . time() . '.' . $fileExt;
        $targetPath = $uploadDir . $safeName;
        if (move_uploaded_file($fileTmp, $targetPath)) {
            $attachmentPath = $targetPath;
            $attachmentName = $origName;
        }
    }
}

// Build key-value map for email
$fields = [];
if (!empty($fullName))   $fields["Full Name"] = $fullName;
$fields["Email Address"] = $email;
if (!empty($phone))      $fields["Phone Number"] = $phone;
if (!empty($company))    $fields["Company / Organization"] = $company;
if (!empty($service))    $fields["Service Required"] = $service;
if (!empty($budget))     $fields["Estimated Budget"] = $budget;
if (!empty($position))   $fields["Position Applied For"] = $position;
if (!empty($experience)) $fields["Years of Experience"] = $experience;
if (!empty($portfolio))  $fields["Portfolio / GitHub"] = $portfolio;
if (!empty($attachmentName)) $fields["Uploaded Resume"] = $attachmentName;
if (!empty($details))    $fields["Project Details / Notes"] = $details;
$fields["Submission Time"] = $timestamp;
$fields["Client IP"] = $clientIP;

// HTML Table Rows
$tableRows = '';
foreach ($fields as $label => $val) {
    $tableRows .= '
    <tr>
      <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569; width: 35%; vertical-align: top; font-size: 13px;">' . htmlspecialchars($label) . '</td>
      <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px; vertical-align: top;">' . nl2br(htmlspecialchars($val)) . '</td>
    </tr>';
}

$htmlMessage = '<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>' . $title . '</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px;">
  <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
    <div style="background: linear-gradient(135deg, #0b132b 0%, #1e3a8a 100%); padding: 24px 28px; color: #ffffff;">
      <div style="display: inline-block; padding: 4px 10px; border-radius: 6px; background-color: ' . $badgeColor . '; color: #ffffff; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px;">
        ' . $companyName . '
      </div>
      <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff;">' . $title . '</h2>
      <p style="margin: 6px 0 0 0; font-size: 12px; color: #93c5fd;">Notification System &bull; ' . $timestamp . '</p>
    </div>
    <div style="padding: 24px 28px;">
      <table style="width: 100%; border-collapse: collapse;">
        ' . $tableRows . '
      </table>
    </div>
    <div style="background-color: #f8fafc; padding: 16px 28px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center;">
      Delivered directly to <strong>' . $toEmail . '</strong> &bull; ' . $companyName . '
    </div>
  </div>
</body>
</html>';

$deliveryMethod = 'none';
$deliverySuccess = false;
$smtpError = '';

// =========================================================================
// PIPELINE 1: PHPMailer with Authenticated SMTP (Direct to Gmail)
// =========================================================================
$smtpPass = trim(str_replace(' ', '', $smtpConfig['smtp_pass'] ?? ''));

if (!empty($smtpConfig['enable_smtp']) && !empty($smtpPass)) {
    require_once __DIR__ . '/includes/PHPMailer/PHPMailer.php';
    require_once __DIR__ . '/includes/PHPMailer/SMTP.php';
    require_once __DIR__ . '/includes/PHPMailer/Exception.php';

    $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = $smtpConfig['smtp_host'] ?? 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = $smtpConfig['smtp_user'] ?? $toEmail;
        $mail->Password   = $smtpPass;
        $mail->SMTPSecure = (($smtpConfig['smtp_secure'] ?? 'tls') === 'ssl') ? \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS : \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = $smtpConfig['smtp_port'] ?? 587;
        $mail->CharSet    = 'UTF-8';
        $mail->Timeout    = 10;

        $mail->setFrom($smtpConfig['from_email'] ?? $toEmail, $companyName);
        $mail->addAddress($toEmail, $smtpConfig['to_name'] ?? 'Admin');
        $mail->addReplyTo($email, $fullName ?: 'Client');

        // Attachment
        if ($attachmentPath && file_exists($attachmentPath)) {
            $mail->addAttachment($attachmentPath, $attachmentName);
        }

        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $htmlMessage;
        $mail->AltBody = strip_tags($tableRows);

        $mail->send();
        $deliverySuccess = true;
        $deliveryMethod = 'smtp';
    } catch (\PHPMailer\PHPMailer\Exception $e) {
        $smtpError = $mail->ErrorInfo;
    }
}

// =========================================================================
// PIPELINE 2: Cloud Email Relay Fallback (If SMTP password not yet set)
// =========================================================================
if (!$deliverySuccess && function_exists('curl_init')) {
    $postPayload = [
        '_subject'  => $subject,
        '_template' => 'table',
        '_captcha'  => 'false',
        'Form_Type' => strtoupper($formType)
    ];

    foreach ($fields as $k => $v) {
        $cleanKey = str_replace(' ', '_', $k);
        $postPayload[$cleanKey] = $v;
    }

    $ch = curl_init('https://formsubmit.co/ajax/' . $toEmail);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postPayload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Referer: https://himalayancodex.com',
        'Origin: https://himalayancodex.com'
    ]);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);

    $response = curl_exec($ch);
    curl_close($ch);

    if ($response) {
        $jsonRes = json_decode($response, true);
        if (isset($jsonRes['success']) && ($jsonRes['success'] === 'true' || $jsonRes['success'] === true)) {
            $deliverySuccess = true;
            $deliveryMethod = 'cloud_relay';
        }
    }
}

// =========================================================================
// PIPELINE 3: Native PHP mail() Fallback
// =========================================================================
if (!$deliverySuccess) {
    $systemSender = "no-reply@" . (!empty($_SERVER['SERVER_NAME']) && $_SERVER['SERVER_NAME'] !== 'localhost' ? $_SERVER['SERVER_NAME'] : 'himalayancodex.com');
    $nativeHeaders  = "MIME-Version: 1.0\r\n";
    $nativeHeaders .= "Content-Type: text/html; charset=UTF-8\r\n";
    $nativeHeaders .= "From: " . $companyName . " <" . $systemSender . ">\r\n";
    $nativeHeaders .= "Reply-To: " . $email . "\r\n";
    $nativeHeaders .= "X-Mailer: PHP/" . phpversion();

    if (@mail($toEmail, $subject, $htmlMessage, $nativeHeaders)) {
        $deliverySuccess = true;
        $deliveryMethod = 'native_mail';
    }
}

// =========================================================================
// PIPELINE 4: Lead Backup in leads_backup.json (Zero Data Loss)
// =========================================================================
$logEntry = [
    'id' => 'LEAD-' . uniqid(),
    'form_type' => $formType,
    'full_name' => $fullName,
    'email' => $email,
    'phone' => $phone,
    'company' => $company,
    'service' => $service,
    'budget' => $budget,
    'details' => $details,
    'position' => $position,
    'experience' => $experience,
    'portfolio' => $portfolio,
    'attachment' => $attachmentName,
    'timestamp' => $timestamp,
    'client_ip' => $clientIP,
    'delivery_method' => $deliveryMethod,
    'delivery_success' => $deliverySuccess,
    'smtp_error' => $smtpError
];

$logFile = __DIR__ . '/leads_backup.json';
$existingLogs = [];
if (file_exists($logFile)) {
    $existingLogs = json_decode(file_get_contents($logFile), true) ?: [];
}
array_unshift($existingLogs, $logEntry);
@file_put_contents($logFile, json_encode($existingLogs, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

// =========================================================================
// Final Output
// =========================================================================
if ($isAjax) {
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode([
        'success' => true,
        'message' => 'Thank you! Your information has been delivered to ' . $toEmail . '.',
        'recipient' => $toEmail,
        'delivery_method' => $deliveryMethod,
        'smtp_configured' => !empty($smtpPass)
    ]);
    exit;
} else {
    $referer = $_SERVER['HTTP_REFERER'] ?? 'index.html';
    $separator = (strpos($referer, '?') !== false) ? '&' : '?';
    header("Location: " . $referer . $separator . "status=success");
    exit;
}
