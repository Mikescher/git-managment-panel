<?php

include_once __DIR__ . '/../lib/util.php';

$path = pcombine(__DIR__,  '..', 'config.txt');

if (!file_exists($path)) touch($path);

$content = file_get_contents($path);

$lines = explode("\n", $content);

$result = [];

foreach ($lines as $line)
{
    $l = trim($line);
    if ($l !== '') $result []= $l;

}

echo json_encode($result);
