<?php

include_once __DIR__ . '/../lib/util.php';

try
{
	$path = $_GET['path'];

	$content_head = file_get_contents(pcombine($path, '.git', 'HEAD'));

	if (startsWith($content_head, 'ref: '))
    {
        $branch = array_last(explode('/', substr($content_head, 5)));
		$head_local = trim(file_get_contents(pcombine($path, '.git', trim(substr($content_head, 5)))));
    }
    else
    {
		$branch = 'master'; // guess
		$head_local = $content_head; // Detached HEAD
    }

    $cfg = parse_ini_file(pcombine($path, '.git', 'config'), true);

	$remotename = null;
	$remoteurl  = null;
	foreach ($cfg as $ck => $cd)
    {
        if (startsWith($ck, 'remote '))
        {
			$remotename = trim(substr($ck, 6), " \t\"");
			$remoteurl = $cd['url'];
		}
	}

	$message = trim(git_exec($path, 'git log -1 --pretty=%B'));

	$head_remote = ($remoteurl==null) ? '?' : trim(explode("\t", trim(git_exec($path, "git ls-remote $remoteurl $branch")))[0]);

	echo json_encode(
	[
        'ok' => true,
		'err' => 'none',
		'msg' => $message,
		'loc' => $head_local,
		'remote' => $head_remote,
		'url' => $remoteurl,
		'branch' => $branch,
    ]);
}
catch (Exception $e)
{
	echo json_encode(['ok' => false, 'err' => $e->getMessage()]);
}