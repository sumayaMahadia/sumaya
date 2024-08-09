<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);


$lang = $_GET['lang'];
$country = $_GET['country'];


$url = "http://api.geonames.org/countryInfoJSON?lang=$lang&country=$country&username=sumsum";


$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);


$result = curl_exec($ch);


if (curl_errno($ch)) {
    echo 'Curl error: ' . curl_error($ch);
}


curl_close($ch);


$data = json_decode($result, true);


$output = [];
if (isset($data['geonames'])) {
    $output['status'] = 'ok';
    $output['data'] = $data['geonames'];
} else {
    $output['status'] = 'error';
    $output['message'] = 'No data found.';
}


header('Content-Type: application/json');


echo json_encode($output);
?>
