<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);
$executionStartTime = microtime(true);

$apiKey = '7526e2e653c519a08473b643654fe319';
$url = 'http://api.openweathermap.org/data/2.5/weather?q=' . urlencode($_REQUEST['city']) . '&appid=' . $apiKey . '&units=metric';

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);
curl_close($ch);

$decode = json_decode($result, true);

$output = [
    'status' => [
        'code' => "200",
        'name' => "ok",
        'description' => "success",
        'returnedIn' => intval((microtime(true) - $executionStartTime) * 1000) . " ms"
    ],
    'data' => $decode 
];

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output);
?>
