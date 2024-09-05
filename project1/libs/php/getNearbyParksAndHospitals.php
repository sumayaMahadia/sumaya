<?php
require "config.php";
$url = "https://trueway-places.p.rapidapi.com/FindPlacesNearby?location=".$_REQUEST['lat']."%2C". $_REQUEST['lng']."&type=hospital&type=park&language=en&radius=10000";
$ch = curl_init();
curl_setopt($ch, CURLOPT_RETURNTRANSFER , true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION , true);
curl_setopt($ch,CURLOPT_ENCODING , "");
curl_setopt($ch,CURLOPT_MAXREDIRS , 10);
curl_setopt($ch,CURLOPT_TIMEOUT , 30);
curl_setopt($ch,CURLOPT_HTTP_VERSION , CURL_HTTP_VERSION_1_1);
curl_setopt($ch,CURLOPT_CUSTOMREQUEST , "GET");
curl_setopt($ch,CURLOPT_HTTPHEADER , [
	"X-RapidAPI-Host:". TRUEWAY_PLACES_API_HOST,
	"X-RapidAPI-Key:" . TRUE_WAY_PLACES_API_KEY
]);

$executionStartTime = microtime(true);

curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);

$result=curl_exec($ch);


curl_close($ch);


$decode = json_decode($result,true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = $decode['results'];

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);
?>
