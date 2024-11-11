<?php
header('Content-Type: application/json');

$type = isset($_GET['type']) ? $_GET['type'] : '';
$countryCode = isset($_GET['code']) ? $_GET['code'] : '';

if ($type === 'all') {
    $url = "https://restcountries.com/v3.1/all";
} elseif ($countryCode) {
    $url = "https://restcountries.com/v3.1/alpha/$countryCode";
} else {
    echo json_encode(['error' => 'Invalid request']);
    exit;
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>
