<?php
/**
 * PSS Global — Executive Client Enquiry Dispatcher
 * Integrates directly with Resend API for instant email delivery.
 */

// Set response headers for clean JSON and security
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// Allow only POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method Not Allowed. Only POST requests are accepted.'
    ]);
    exit;
}

// 1. Parse Input (Supports both JSON payload and standard form-data)
$rawInput = file_get_contents('php://input');
$data = [];

if (!empty($rawInput)) {
    $decoded = json_decode($rawInput, true);
    if (is_array($decoded)) {
        $data = $decoded;
    }
}

// Fallback to $_POST if JSON wasn't parsed
if (empty($data)) {
    $data = $_POST;
}

// 2. Extract and Sanitize Fields
$name    = isset($data['name']) ? trim(strip_tags($data['name'])) : (isset($data['full_name']) ? trim(strip_tags($data['full_name'])) : '');
$company = isset($data['company']) ? trim(strip_tags($data['company'])) : '';
$email   = isset($data['email']) ? filter_var(trim($data['email']), FILTER_SANITIZE_EMAIL) : '';
$phone   = isset($data['phone']) ? trim(strip_tags($data['phone'])) : '';
$service = isset($data['service']) ? trim(strip_tags($data['service'])) : 'General Enquiry';
$message = isset($data['message']) ? trim(strip_tags($data['message'])) : '';

// 3. Validation
$errors = [];
if (empty($name)) {
    $errors[] = 'Full name is required.';
}
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'A valid email address is required.';
}
if (empty($message)) {
    $errors[] = 'A message or enquiry description is required.';
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => implode(' ', $errors)
    ]);
    exit;
}

// 4. Prepare Email Payload for Resend
$apiKey = getenv('RESEND_API_KEY') ?: base64_decode('cmVfS3M2OGRqQ1BfNzFyYW02R3NoUDZVaFR4dGZrcUtXNHBo');
$recipients = [
    'praneethnaidu21@gmail.com',
    'puchakayala.praneeth2027@mastersunion.org'
];

$companyDisplay = !empty($company) ? htmlspecialchars($company) : 'Not Specified';
$phoneDisplay   = !empty($phone) ? htmlspecialchars($phone) : 'Not Provided';
$serviceDisplay = htmlspecialchars($service);
$nameDisplay    = htmlspecialchars($name);
$emailDisplay   = htmlspecialchars($email);
$messageDisplay = nl2br(htmlspecialchars($message));
$timestamp      = date('d M Y, h:i A T');
$ipAddress      = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';

$subject = "New Client Enquiry: " . (!empty($company) ? $company : $name) . " (" . $service . ")";

$htmlBody = "
<!DOCTYPE html>
<html>
<head>
<meta charset='utf-8'>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 30px; color: #1e293b; }
  .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
  .header { background: #0b1528; padding: 28px 32px; border-bottom: 3px solid #2563eb; }
  .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
  .header p { color: #94a3b8; margin: 6px 0 0 0; font-size: 13px; }
  .content { padding: 32px; }
  .badge { display: inline-block; padding: 4px 10px; background: #eff6ff; color: #2563eb; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 20px; }
  .data-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  .data-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; vertical-align: top; }
  .data-table td.label { width: 35%; color: #64748b; font-weight: 600; }
  .data-table td.value { width: 65%; color: #0f172a; font-weight: 500; }
  .message-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px; margin-top: 10px; font-size: 14px; line-height: 1.6; color: #334155; }
  .footer { background: #f8fafc; padding: 18px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
  .action-btn { display: inline-block; background: #2563eb; color: #ffffff !important; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 13px; margin-top: 20px; }
</style>
</head>
<body>
<div class='email-container'>
  <div class='header'>
    <h1>PSS Global — Website Client Enquiry</h1>
    <p>Incoming transmission via pssglobal.co.in</p>
  </div>
  <div class='content'>
    <div class='badge'>New Lead</div>
    
    <table class='data-table'>
      <tr>
        <td class='label'>Client Name:</td>
        <td class='value'><strong>{$nameDisplay}</strong></td>
      </tr>
      <tr>
        <td class='label'>Organization / Company:</td>
        <td class='value'>{$companyDisplay}</td>
      </tr>
      <tr>
        <td class='label'>Work Email:</td>
        <td class='value'><a href='mailto:{$emailDisplay}' style='color:#2563eb;'>{$emailDisplay}</a></td>
      </tr>
      <tr>
        <td class='label'>Contact Phone:</td>
        <td class='value'><a href='tel:{$phoneDisplay}' style='color:#0f172a; text-decoration:none;'>{$phoneDisplay}</a></td>
      </tr>
      <tr>
        <td class='label'>Service Required:</td>
        <td class='value'><strong>{$serviceDisplay}</strong></td>
      </tr>
      <tr>
        <td class='label'>Received At:</td>
        <td class='value'>{$timestamp}</td>
      </tr>
    </table>

    <div style='font-size: 13px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em;'>Enquiry / Project Scope:</div>
    <div class='message-box'>
      {$messageDisplay}
    </div>

    <div style='text-align: center;'>
      <a href='mailto:{$emailDisplay}?subject=Re:%20PSS%20Global%20Enquiry%20-%20{$companyDisplay}' class='action-btn'>Reply to {$nameDisplay} directly</a>
    </div>
  </div>
  <div class='footer'>
    Praneeth Soft Solutions (PSS Global) &bull; Lead Dispatch System<br>
    IP: {$ipAddress} &bull; Dispatched via Resend API
  </div>
</div>
</body>
</html>
";

$resendPayload = [
    'from'     => 'PSS Global Enquiries <hello@hirecraftai.me>',
    'to'       => $recipients,
    'reply_to' => $email,
    'subject'  => $subject,
    'html'     => $htmlBody
];

// 5. Send via Resend API cURL
$ch = curl_init('https://api.resend.com/emails');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($resendPayload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiKey,
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Network error connecting to email dispatch service: ' . $curlError
    ]);
    exit;
}

if ($httpCode >= 200 && $httpCode < 300) {
    echo json_encode([
        'success' => true,
        'message' => 'Thank you for reaching out. Your enquiry has been securely received by our leadership team and we will respond promptly.'
    ]);
} else {
    http_response_code($httpCode);
    $resDecoded = json_decode($response, true);
    $errMsg = isset($resDecoded['message']) ? $resDecoded['message'] : 'Failed to dispatch email notification.';
    echo json_encode([
        'success' => false,
        'error' => $errMsg,
        'details' => $resDecoded
    ]);
}
