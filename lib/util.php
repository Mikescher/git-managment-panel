<?php

$CONFIG = include __DIR__ . '/../config.php';

function _pcombine2($a, $b)
{
	$a = str_replace('/', DIRECTORY_SEPARATOR, $a);
	$b = str_replace('/', DIRECTORY_SEPARATOR, $b);

	$a = rtrim($a, DIRECTORY_SEPARATOR);
	$b = trim($b, DIRECTORY_SEPARATOR);

	return $a . DIRECTORY_SEPARATOR . $b;
}

function _pcombine3($a, $b, $c)
{
	return _pcombine2($a, _pcombine2($b, $c));
}

function pcombine(...$args)
{
	$len = count($args);

	if ($len == 0) return DIRECTORY_SEPARATOR;

	$result = $args[$len-1];
	for ($i = $len-2; $i >=0; $i--)
	{
		$result = _pcombine2($args[$i], $result);
	}

	return $result;
}

function startsWith($haystack, $needle)
{
	$length = strlen($needle);
	return (substr($haystack, 0, $length) === $needle);
}

function endsWith($haystack, $needle)
{
	$length = strlen($needle);

	return $length === 0 || (substr($haystack, -$length) === $needle);
}

function endsWithIgnoreCase($haystack, $needle)
{
	$length = strlen($needle);

	return $length === 0 || (strtolower(substr($haystack, -$length)) === strtolower($needle));
}

if (!function_exists('str_contains'))
{
	function str_contains($hastack, $needle)
	{
		return (strpos($hastack, $needle) !== false);
	}
}

function unparse_url($parsed_url)
{
	$scheme   = isset($parsed_url['scheme']) ? $parsed_url['scheme'] . '://' : '';
	$host     = isset($parsed_url['host']) ? $parsed_url['host'] : '';
	$port     = isset($parsed_url['port']) ? ':' . $parsed_url['port'] : '';
	$user     = isset($parsed_url['user']) ? $parsed_url['user'] : '';
	$pass     = isset($parsed_url['pass']) ? ':' . $parsed_url['pass']  : '';
	$pass     = ($user || $pass) ? "$pass@" : '';
	$path     = isset($parsed_url['path']) ? $parsed_url['path'] : '';
	$query    = isset($parsed_url['query']) ? '?' . $parsed_url['query'] : '';
	$fragment = isset($parsed_url['fragment']) ? '#' . $parsed_url['fragment'] : '';
	return "$scheme$user$pass$host$port$path$query$fragment";
}

function array_last($arr)
{
	return $arr[count($arr)-1];
}
function simple_exec_live($cmd)
{
	$descriptorspec = [ 0 => ["pipe", "r"], 1 => ["pipe", "w"], 2 => ["pipe", "w"] ];
	$env = [ 'HOME' => '/var/www' ];

	echo ('$ ' . $cmd . "\n");
	@flush();
	@ob_flush();

	$process = proc_open($cmd . ' 2>&1', $descriptorspec, $pipes, null, $env);

	if (is_resource($process))
	{
		fclose($pipes[0]);

		while (!feof($pipes[1]))
		{
			echo fgets($pipes[1]);
			@flush();
			@ob_flush();
		}

		fclose($pipes[2]);

		$exit = proc_close($process);

		if ($exit != 0) throw new Exception("ERROR: Exitcode = " . $exit);
	}
	else
	{
		throw new Exception("ERROR: Could not run 'git pull'");
	}
}

function git_exec($cwd, $cmd)
{
	$descriptorspec = [ 0 => ["pipe", "r"], 1 => ["pipe", "w"], 2 => ["pipe", "w"] ];
	$env = [ 'HOME' => '/var/www' ];

	$process = proc_open($cmd . ' 2>&1', $descriptorspec, $pipes, $cwd, $env);

	if (is_resource($process))
	{
		fclose($pipes[0]);

		$stdout = stream_get_contents($pipes[1]);
		fclose($pipes[1]);

		stream_get_contents($pipes[2]);
		fclose($pipes[2]);

		proc_close($process);

		return $stdout;
	}
	else
	{
		throw new Exception("ERROR: Could not run 'git pull'");
	}
}


function git_exec_live($cwd, $cmd)
{
	$descriptorspec = [ 0 => ["pipe", "r"], 1 => ["pipe", "w"], 2 => ["pipe", "w"] ];
	$env = [ 'HOME' => '/var/www' ];

	echo ('$ ' . $cmd . "\n");
	@flush();
	@ob_flush();

	$process = proc_open($cmd . ' 2>&1', $descriptorspec, $pipes, $cwd, $env);

	if (is_resource($process))
	{
		fclose($pipes[0]);

		while (!feof($pipes[1]))
		{
			echo fgets($pipes[1]);
			@flush();
			@ob_flush();
		}

		fclose($pipes[2]);

		$exit = proc_close($process);

		if ($exit != 0) throw new Exception("ERROR: Exitcode = " . $exit);
	}
	else
	{
		throw new Exception("ERROR: Could not run 'git pull'");
	}
}

function remoteHead($path, $url, $branch, &$remote_warnings, &$hasFailed)
{
	if ($url == null) return '?';

	try
	{
		$cmd = "git ls-remote $url $branch";
		$lsr = trim(git_exec($path, $cmd));

		foreach (explode("\n", $lsr) as $line)
		{
			if (endsWithIgnoreCase($line, 'refs/heads/'.$branch)) return trim(explode("\t", $line)[0]);
		}

		$remote_warnings .= '$ '.$cmd."\n".$lsr."\n\n\n";
	}
	catch (Exception $e)
	{
		$remote_warnings .= '$ '.$cmd."\n".$e->getMessage()."\n\n\n";
	}

	try
	{
		$purl = parse_url($url);
		$user = explode('/', trim($purl['path'], '/'))[0];

		$purl['user'] = $user;

		$newurl = unparse_url($purl);

		$lsr = trim(git_exec($path, "git ls-remote $newurl $branch"));

		foreach (explode("\n", $lsr) as $line)
		{
			if (endsWithIgnoreCase($line, 'refs/heads/'.$branch)) return trim(explode("\t", $line)[0]);
		}

		$remote_warnings .= '$ '.$cmd."\n".$lsr."\n\n\n";
	}
	catch (Exception $e)
	{
		$remote_warnings .= '$ '.$cmd."\n".$e->getMessage()."\n\n\n";
	}

	$hasFailed = true;
	return "ERR";
}
