<?php

include_once __DIR__ . '/../lib/util.php';

try
{
	$path  = $_GET['path'];

	$index = pcombine($path, '.git', 'index');

	$owner = posix_getpwuid(fileowner($index))['name'];

	if ($CONFIG['use_sudopull'])
	{
		simple_exec_live('sudo -H '.$CONFIG['sudopull_path'].' status "'.$path.'"');
	}
	else
	{
		git_exec_live($path, 'git status');
	}


}
catch (Exception $e)
{
	echo "\n\n[[*ERR*]] ".$e->getMessage()."\n";
}