<?php

include_once __DIR__ . '/../lib/util.php';

try
{
	$path = pcombine(__DIR__,  '..', 'config.txt');

	$newentry = $_GET['path'];

	$head = (pcombine($newentry, '.git', 'HEAD'));

	if (!file_exists($head))
	{
		echo json_encode(['ok' => false, 'err' => 'Not a repository']);
		return;
	}

	$content = file_get_contents($path);
	$lines = explode("\n", $content);
	$result = [];
	foreach ($lines as $line)
	{
		$l = trim($line);
		if ($l !== '') $result []= $l;
	}

	$result []= $newentry;

	$result = array_unique($result);
	asort($result);

	file_put_contents($path, implode("\n", $result));

	echo json_encode(['ok' => true, 'err' => 'none']);
}
catch (Exception $e)
{
	echo json_encode(['ok' => false, 'err' => $e->getMessage()]);
}