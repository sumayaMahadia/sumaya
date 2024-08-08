<?php
header('Content-Type: application/json');

$lang = $_GET['lang'];
$country = $_GET['country'];

$url = "http://api.geonames.org/countryInfoJSON?lang=$lang&country=$country&username=sumsum";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
curl_close($ch);

echo $result;
?>
