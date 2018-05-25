<?php

$config =
[
	'use_sudopull' => false,
	'no_remote_query' => false,
];






if (file_exists(__DIR__ . '/config_user.php'))
	return array_merge($config, include __DIR__ . '/config_user.php');
else
	return $config;