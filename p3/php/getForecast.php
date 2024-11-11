<?php
header('Content-Type: application/json');

$lat = $_GET['lat'];
$lon = $_GET['lon'];
$apiKey = '7526e2e653c519a08473b643654fe319'; // OpenWeather API key

$url = "https://api.openweathermap.org/data/2.5/forecast?lat=$lat&lon=$lon&appid=$apiKey&units=metric";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>
