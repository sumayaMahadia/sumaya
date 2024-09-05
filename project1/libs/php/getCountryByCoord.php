<?php
require "config.php";
if(isset($_REQUEST['lat'])  && isset($_REQUEST['long']) ){

$url = "https://api.opencagedata.com/geocode/v1/json?q=". $_REQUEST['lat']. ",+" . $_REQUEST['long']. "&key=".OPENCAGE_API
. "&language=en&pretty=1";
}else{
  $url = "https://api.opencagedata.com/geocode/v1/json?q=". $_REQUEST['country']. "&key=".OPENCAGE_API . "&language=en&pretty=1";
}
$executionStartTime = microtime(true);

$ch = curl_init();
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
$output['data'] = $decode;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output); 
?>