const PATHS = new Map();
const DATAS = new Map();

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
			tr    += "  <td class=\"tab_main_d_path\" title=\""+htmlspecialchars(item)+"\" ><div class=\"statind si_gray\"></div>"+item+"</td>"; // path
			tr    += "  <td class=\"tab_main_d_msg\"  ><span class=\"msg_light\">querying...</span></td>"; // message
			tr    += "  <td class=\"tab_main_d_loc\"  ><span class=\"msg_light\">querying...</span></td>"; // head_local
			tr    += "  <td class=\"tab_main_d_remo\" ><span class=\"msg_light\">querying...</span></td>"; // head_remote
			tr    += "  <td class=\"tab_main_d_act\"  >"; // actions
			tr    += "    <a class=\"btn_action btn_disabled\" onclick=\"if($(this).hasClass('btn_disabled'))return false; doPull("+i+", false);return false;\" href=\"#\">Pull</a>";
			tr    += "    <a class=\"btn_action btn_disabled\" onclick=\"if($(this).hasClass('btn_disabled'))return false; doPull("+i+", true);return false;\" href=\"#\">Force Pull</a>";
			tr    += "    <a class=\"btn_action btn_disabled\" onclick=\"if($(this).hasClass('btn_disabled'))return false; doOpen("+i+");return false;\" href=\"#\">Open</a>";
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
		
		setTimeout(function(){ updateEntriesChain(0, i); }, 50);
		
	})
	.fail(function(jqXHR, textStatus, errorThrown)
	{
		console.error(textStatus);
		console.error(errorThrown);
		alert(textStatus);
	});
}

function closePanelOutput()
{
	let pnl = $("#pnl_stdout");
	pnl.removeClass('stdout_visible');
	pnl.addClass('stdout_hidden');
}

function doPull(pathid, force)
{
	let pnl = $("#pnl_stdout");
	let pnl_header_x = $("#pnl_stdout > #pnl_stdout_header > a");
	let pnl_content = $("#pnl_stdout > #pnl_stdout_content");

	let trow_actions = $("#tab_main_row_"+curr+" > .tab_main_d_act");
	for (let btn of trow_actions.children(".btn_action")) $(btn).addClass('btn_disabled');

	pnl.removeClass('stdout_hidden');
	pnl.addClass('stdout_visible');
	pnl_content.removeClass('pnl_stdout_content_status_error');
	pnl_header_x.addClass('generic_hidden');

	pnl_content.html('');

	$.ajax(
	{
		url: 'ajax/pull_entry.php?force='+(force?1:0)+'&path=' + encodeURIComponent(PATHS.get(pathid)),
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

function doOpen(pathid)
{
	window.open(DATAS.get(pathid).url, "_self");
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

	trow.removeClass('tab_main_row_updatable');

	trow_message.html('<span class="msg_light">querying...</span>');
	trow_local.html('<span class="msg_light">querying...</span>');
	trow_remote.html('<span class="msg_light">querying...</span>');
	trow_status.removeClass('si_gray');
	trow_status.removeClass('si_green');
	trow_status.removeClass('si_yellow');
	trow_status.removeClass('si_red');
	trow_status.addClass('si_gray');

	for (let btn of trow_actions.children(".btn_action")) $(btn).addClass('btn_disabled');

	$.ajax({ url: 'ajax/entry_info.php?path=' + encodeURIComponent(PATHS.get(curr)), dataType: 'json' })
	.done(function(data, textStatus, jqXHR)
	{
		DATAS.set(curr, data);

		if (data.ok)
		{
			trow_message.html(data.msg);
			trow_message.attr('title', data.msg);
			trow_local.html(data.loc.substr(data.loc.length-8));
			trow_remote.html(data.remote.substr(data.remote.length-8));

			for (let btn of trow_actions.children(".btn_action")) $(btn).removeClass('btn_disabled');

			trow_status.removeClass('si_gray');
			trow_status.removeClass('si_green');
			trow_status.removeClass('si_yellow');
			trow_status.removeClass('si_red');
			trow_status.addClass((data.loc === data.remote) ? 'si_green' : 'si_yellow');

			if (data.loc !== data.remote) trow.addClass('tab_main_row_updatable');
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





