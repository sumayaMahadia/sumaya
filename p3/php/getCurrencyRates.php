<?php
header('Content-Type: application/json');

$apiKey = '08ac987f1f0436f13cabcb49aa8b9d6c';
$url = "https://api.exchangerate-api.com/v4/latest/USD";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>
