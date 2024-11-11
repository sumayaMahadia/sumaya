<?php
header('Content-Type: application/json');
error_log("News API Request Started"); // Debug log

$country = $_GET['country'];
$apiKey = '612809f3a0c841a18c1de0e861cfcacf';
$url = "https://newsapi.org/v2/everything?q=" . urlencode($country) . "&language=en&sortBy=publishedAt&pageSize=10&apiKey=" . $apiKey;

error_log("URL: " . $url); // Log the URL

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'User-Agent: Mozilla/5.0'
));

$response = curl_exec($ch);
error_log("Response: " . $response); // Log the response

if(curl_errno($ch)){
    error_log("Curl Error: " . curl_error($ch));
}

curl_close($ch);

echo $response;
?>
