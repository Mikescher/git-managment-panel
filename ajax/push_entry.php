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
			simple_exec_live('sudo -H '.$CONFIG['sudopull_path'].' forcepush "'.$path.'"');
		}
		else
		{
			simple_exec_live('sudo -H '.$CONFIG['sudopull_path'].' push "'.$path.'"');
		}
	}
	else
	{

		if ($force)
		{
			git_exec_live($path, 'git push --force');
		}
		else
		{
			git_exec_live($path, 'git push');
		}
	}


}
catch (Exception $e)
{
	echo "\n\n[[*ERR*]] ".$e->getMessage()."\n";
}