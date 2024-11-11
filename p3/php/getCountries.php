<?php
$countries = [
    ['code' => 'US', 'name' => 'United States', 'lat' => 37.0902, 'lng' => -95.7129],
    ['code' => 'GB', 'name' => 'United Kingdom', 'lat' => 55.3781, 'lng' => -3.4360],
    // Add more countries...
];

header('Content-Type: application/json');
echo json_encode($countries);
