<?php

include_once __DIR__ . '/../lib/util.php';

try
{
	$force = $_GET['force'];
	$path  = $_GET['path'];
	git_exec_live($path, $force ? 'git pull --force' : 'git pull');
}
catch (Exception $e)
{
	echo "\n\n[[*ERR*]] ".$e->getMessage()."\n";
}