<?php

include_once __DIR__ . '/../lib/util.php';

try
{
	$force = $_GET['force'];
	$path  = $_GET['path'];

	$index = pcombine($path, '.git', 'index');

	$owner = posix_getpwuid(fileowner($index))['name'];

	if ($CONFIG['use_sudopull'])
	{
		if ($force)
		{
			git_exec_live($path, 'sudo sudopull force "'.$path.'"');
		}
		else
		{
			git_exec_live($path, 'sudo sudopull normal "'.$path.'"');
		}
	}
	else
	{

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


}
catch (Exception $e)
{
	echo "\n\n[[*ERR*]] ".$e->getMessage()."\n";
}