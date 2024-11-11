<?php
header('Content-Type: application/json');

$amount = $_GET['amount'];
$fromCurrency = $_GET['from'];
$toCurrency = $_GET['to'];

$url = "https://api.exchangerate-api.com/v4/latest/${fromCurrency}";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = json_decode(curl_exec($ch), true);
curl_close($ch);

$rate = $response['rates'][$toCurrency];
$result = $amount * $rate;

echo json_encode(['result' => $result]);
?>
