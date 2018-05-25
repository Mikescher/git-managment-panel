<?php

$config =
[
	'use_sudopull' => false,
	'no_remote_query' => false,
];






if (file_exists(__DIR__ . '/config_user.php'))
	return array_merge(include __DIR__ . '/config_user.php', $config);
else
	return $config;