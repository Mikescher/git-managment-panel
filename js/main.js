const PATHS = new Map();
const DATAS = new Map();

const UPDATE_PARALLEL = true;

window.onload = function ()
{
	refreshEntries();
};

function htmlspecialchars(str) {
	const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;" // ' -> &apos; for XML only
    };
    return str.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// https://stackoverflow.com/a/2450976/1761622
function shuffle(array) {
	let currentIndex = array.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

function escapeHtml (string) {
	const entityMap = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;',
		'/': '&#x2F;',
		'`': '&#x60;',
		'=': '&#x3D;'
	};
	return String(string).replace(/[&<>"'`=\/]/g, function (s) {
		return entityMap[s];
	})
	.replace(/\r\n/g, '\n')
	.replace(/\n/g, '<br/>\n');
}

function refreshEntries()
{
	let table_body = $("#tbl_main tbody");

	$.ajax({ url: 'ajax/list_entries.php', dataType: 'json' })
	.done(function(data, textStatus, jqXHR)
	{
		table_body.html("");

		PATHS.clear();
		DATAS.clear();
		
		let i = 0;
		for (let item of data)
		{
			PATHS.set(i, item);

			let tr = "<tr id=\"tab_main_row_"+i+"\">";
			tr    += "  <td class=\"tab_main_d_path\" title=\""+htmlspecialchars(item)+"\" ><div class=\"statind si_gray\"></div>"+getLastPathComponent(item)+"</td>"; // path
			tr    += "  <td class=\"tab_main_d_msg\"  ><span class=\"msg_light\">querying...</span></td>"; // message
			tr    += "  <td class=\"tab_main_d_loc\"  ><span class=\"msg_light\">querying...</span></td>"; // head_local
			tr    += "  <td class=\"tab_main_d_remo\" ><span class=\"msg_light\">querying...</span></td>"; // head_remote
			tr    += "  <td class=\"tab_main_d_act\"  >"; // actions
			tr    += "    <a class=\"btn_action btn_disabled\"                onclick=\"if($(this).hasClass('btn_disabled'))return false; doPull("+i+", false);return false;\" alt=\"git pull\"         title=\"git pull\"                           href=\"#\"><i class=\"fas fa-angle-double-down\"></i></a>";
			tr    += "    <a class=\"btn_action btn_disabled btn_force\"      onclick=\"if($(this).hasClass('btn_disabled'))return false; doPull("+i+", true); return false;\" alt=\"git pull --force\" title=\"git pull --force\"                   href=\"#\"><i class=\"fas fa-angle-double-down\"></i></a>";
			tr    += "    <a class=\"btn_action btn_disabled\"                onclick=\"if($(this).hasClass('btn_disabled'))return false; doStatus("+i+");     return false;\" alt=\"git status\"       title=\"git status\"                         href=\"#\"><i class=\"fas fa-question\"         ></i></a>";
			tr    += "    <a class=\"btn_action btn_disabled\"                onclick=\"if($(this).hasClass('btn_disabled'))return false; doPush("+i+", false);return false;\" alt=\"git push\"         title=\"git push\"                           href=\"#\"><i class=\"fas fa-angle-double-up\"  ></i></a>";
			tr    += "    <a class=\"btn_action btn_disabledi btn_force\"     onclick=\"if($(this).hasClass('btn_disabled'))return false; doPush("+i+", true); return false;\" alt=\"git push --force\" title=\"git push --force\"                   href=\"#\"><i class=\"fas fa-angle-double-up\"  ></i></a>";
			tr    += "    <a class=\"btn_action btn_disabled btn_action_url\" onclick=\"if($(this).hasClass('btn_disabled'))return false;                      return true; \" alt=\"Open repository\"  title=\"Open repository\"  target=\"_blank\" href=\"#\"><i class=\"fas fa-code\"             ></i></a>";
			tr    += "    <a class=\"btn_action btn_disabled\"                onclick=\"if($(this).hasClass('btn_disabled'))return false; doRefresh("+i+");    return false;\" alt=\"Refresh\"          title=\"Refresh\"                            href=\"#\"><i class=\"fas fa-sync-alt\"         ></i></a>";
			tr    += "  </td>";
			tr    += "</tr>"
			table_body.append(tr);
			i++;
		}

		let tr = "<tr>";
		tr    += "  <td colspan=\"4\"><input id=\"input_add\"></td>";
		tr    += "  <td>";
		tr    += "    <a class=\"btn_action\" onclick=\"if($(this).hasClass('btn_disabled'))return false; doAdd();return false;\" href=\"#\">Add</a>";
		tr    += "  </td>";
		tr    += "</tr>"
		table_body.append(tr);

		if (UPDATE_PARALLEL)
		{
			let to = [];
			for (let jj=0; jj<i; jj++) to.push(50 + 100*jj);
			shuffle(to);
			for (let jj=0; jj<i; jj++) setTimeout(function(){ updateEntriesChain(jj, -1); }, to[jj]);
		}
		else
		{
			setTimeout(function(){ updateEntriesChain(0, i); }, 50);
		}
		
	})
	.fail(function(jqXHR, textStatus, errorThrown)
	{
		console.error(textStatus);
		console.error(errorThrown);
		alert(textStatus);
	});
}

function getLastPathComponent(str)
{
	var parts = str.split('/');
	return parts.pop() || parts.pop(); // handle potential trailing slash
}

function doRefresh(pathid)
{
	updateEntriesChain(pathid, -1);
}

function closePanelOutput()
{
	let pnl = $("#pnl_stdout");
	pnl.removeClass('stdout_visible');
	pnl.addClass('stdout_hidden');
}

function doPull(pathid, force)
{
	git_cmd('ajax/pull_entry.php?force='+(force?1:0)+'&path=' + encodeURIComponent(PATHS.get(pathid)), pathid);
}

function doPush(pathid, force)
{
	git_cmd('ajax/push_entry.php?force='+(force?1:0)+'&path=' + encodeURIComponent(PATHS.get(pathid)), pathid);
}

function doStatus(pathid)
{
	git_cmd('ajax/status_entry.php?path=' + encodeURIComponent(PATHS.get(pathid)), pathid);
}

function git_cmd(uri, pathid)
{
	let pnl = $("#pnl_stdout");
	let pnl_header_x = $("#pnl_stdout > #pnl_stdout_header > a");
	let pnl_content = $("#pnl_stdout > #pnl_stdout_content");

	let trow_actions = $("#tab_main_row_"+pathid+" > .tab_main_d_act");
	for (let btn of trow_actions.children(".btn_action")) $(btn).addClass('btn_disabled');

	pnl.removeClass('stdout_hidden');
	pnl.addClass('stdout_visible');
	pnl_content.removeClass('pnl_stdout_content_status_error');
	pnl_header_x.addClass('generic_hidden');

	pnl_content.html('');

	$.ajax(
	{
		url: uri,
		dataType: 'text',
		xhrFields:
		{
			onprogress: function(e)
			{
				let response = e.currentTarget.response;

				pnl_content.html(escapeHtml(response));

				console.log('__on_progress__');
			}
		}
	})
	.done(function(data, textStatus, jqXHR)
	{
		pnl_content.html(escapeHtml(data));
		pnl_header_x.removeClass('generic_hidden');

		if (data.includes('[[*ERR*]]'))
		{
			pnl_content.addClass('pnl_stdout_content_status_error');
		}
		else
		{
			setTimeout(function(){ updateEntriesChain(pathid, -1); }, 50);
		}
	})
	.fail(function(jqXHR, textStatus, errorThrown)
	{
		console.error(textStatus);
		console.error(errorThrown);

		pnl_content.append('<br/><br/>Ajax Error:' + errorThrown);

		pnl_content.addClass('pnl_stdout_content_status_error');
		pnl_header_x.removeClass('generic_hidden');
	})
	.always(function()
	{
		for (let btn of trow_actions.children(".btn_action")) $(btn).removeClass('btn_disabled');
	});
}

function doAdd()
{
	let newpath = $("#input_add").val();

	$.ajax({ url: 'ajax/add_entry.php?path=' + encodeURIComponent(newpath), dataType: 'json' })
	.done(function(data, textStatus, jqXHR)
	{
		if (data.ok)
		{
			refreshEntries();
		}
		else
		{
			console.error(data);
			alert(data.err);
		}
	})
	.fail(function(jqXHR, textStatus, errorThrown)
	{
		console.error(textStatus);
		console.error(errorThrown);
		alert(textStatus);
	});
}

function updateEntriesChain(curr, count)
{
	if (curr === count) return;

	let trow    = $("#tab_main_row_"+curr);
	let trow_path    = $("#tab_main_row_"+curr+" > .tab_main_d_path");
	let trow_message = $("#tab_main_row_"+curr+" > .tab_main_d_msg");
	let trow_local   = $("#tab_main_row_"+curr+" > .tab_main_d_loc");
	let trow_remote  = $("#tab_main_row_"+curr+" > .tab_main_d_remo");
	let trow_actions = $("#tab_main_row_"+curr+" > .tab_main_d_act");
	let trow_status  = $("#tab_main_row_"+curr+" > .tab_main_d_path > .statind");
	let btn_url      = $("#tab_main_row_"+curr+" > .tab_main_d_act .btn_action_url");

	trow.removeClass('tab_main_row_updatable');

	trow_message.html('<span class="msg_light">querying...</span>');
	trow_local.html('<span class="msg_light">querying...</span>');
	trow_remote.html('<span class="msg_light">querying...</span>');
	trow_status.removeClass('si_gray');
	trow_status.removeClass('si_green');
	trow_status.removeClass('si_yellow');
	trow_status.removeClass('si_red');
	trow_status.addClass('si_gray');
	btn_url.attr('href', '#');
	trow_remote.removeClass('single_col_error');

	for (let btn of trow_actions.children(".btn_action")) $(btn).addClass('btn_disabled');

	$.ajax({ url: 'ajax/entry_info.php?path=' + encodeURIComponent(PATHS.get(curr)), dataType: 'json' })
	.done(function(data, textStatus, jqXHR)
	{
		DATAS.set(curr, data);

		if (data.ok)
		{
			trow_message.text(data.msg.split('\n')[0]);
			trow_message.attr('title', data.msg);
			trow_local.html(data.loc.substr(0, 8));
			trow_remote.html(data.remote.substr(0, 8));
			btn_url.attr('href', data.url);

			for (let btn of trow_actions.children(".btn_action")) $(btn).removeClass('btn_disabled');

			trow_status.removeClass('si_gray');
			trow_status.removeClass('si_green');
			trow_status.removeClass('si_yellow');
			trow_status.removeClass('si_red');

			if (!data.remote_ok)
			{
				trow_status.addClass('si_gray');
				trow_remote.addClass('single_col_error');
				trow_remote.attr('title', data.remote_err)
			}
			else if ((data.loc !== data.remote))
			{
				trow_status.addClass('si_yellow');
				trow.addClass('tab_main_row_updatable');
			}
			else
			{
				trow_status.addClass('si_green');
			}
		}
		else
		{
			trow_message.html("<span class=\"msg_err\">ERROR</span>");
			trow_local.html("<span class=\"msg_err\">ERROR</span>");
			trow_remote.html("<span class=\"msg_err\">ERROR</span>");

			for (let btn of trow_actions.children(".btn_action")) $(btn).addClass('btn_disabled');

			trow_status.removeClass('si_gray');
			trow_status.removeClass('si_green');
			trow_status.removeClass('si_yellow');
			trow_status.removeClass('si_red');
			trow_status.addClass('si_red');
		}
	})
	.fail(function(jqXHR, textStatus, errorThrown)
	{
		console.error(textStatus);
		console.error(errorThrown);

		DATAS.set(curr, {ok: false});

		trow_message.html("<span class=\"msg_err\">ERROR</span>");
		trow_local.html("<span class=\"msg_err\">ERROR</span>");
		trow_remote.html("<span class=\"msg_err\">ERROR</span>");

		for (let btn of trow_actions.children("btn_action")) btn.addClass('btn_disabled');

		trow_status.removeClass('si_gray');
		trow_status.removeClass('si_green');
		trow_status.removeClass('si_yellow');
		trow_status.removeClass('si_red');
		trow_status.addClass('si_red');
	})
	.always(function()
	{
		if (count !== -1) setTimeout(function(){updateEntriesChain(curr+1, count);}, 1);
	});
}





