<?php

include_once __DIR__ . '/../lib/util.php';

try
{
	$force = $_GET['force'];
	$path  = $_GET['path'];

	if ($force)
	{
		git_exec_live($path, 'git fetch');
		git_exec_live($path, 'git reset origin --hard');
	}
	else
	{
		git_exec_live($path, 'git pull');
	}

}
catch (Exception $e)
{
	echo "\n\n[[*ERR*]] ".$e->getMessage()."\n";
}