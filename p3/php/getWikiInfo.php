<?php
header('Content-Type: application/json');

$country = $_GET['country'];
$username = 'Smayam';
$apiKey = '312355b80fa9a3166c7a80c7c15780b96d76c71c';

$params = array(
    'action' => 'query',
    'format' => 'json',
    'titles' => $country,
    'prop' => 'extracts|pageimages',
    'exintro' => true,
    'explaintext' => true,
    'pithumbsize' => 500,
    'username' => $username,
    'api_key' => $apiKey
);

$url = 'https://en.wikipedia.org/w/api.php?' . http_build_query($params);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_USERAGENT, 'Your App Name/1.0');

$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>
