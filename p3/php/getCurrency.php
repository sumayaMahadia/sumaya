<?php
$currencyCode = $_GET['currency'];
$apiKey = '08ac987f1f0436f13cabcb49aa8b9d6c';
$url = "https://v6.exchangerate-api.com/v6/{$apiKey}/latest/{$currencyCode}";

$response = file_get_contents($url);
$data = json_decode($response, true);

$exchangeRate = [
    'rate' => $data['conversion_rates']['USD']
];

header('Content-Type: application/json');
echo json_encode($exchangeRate);
