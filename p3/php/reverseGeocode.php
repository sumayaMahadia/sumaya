<?php
header('Content-Type: application/json');

$lat = $_GET['lat'];
$lon = $_GET['lon'];
$apiKey = '9006b5b8af3c44af891c06488776d8ea';

$url = "https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${apiKey}";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>
