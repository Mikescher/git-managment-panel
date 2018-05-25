var PATHS = new Map();
var DATAS = new Map();

window.onload = function ()
{
	refreshEntries();
}

function htmlspecialchars(str) {
    var map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;" // ' -> &apos; for XML only
    };
    return str.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function refreshEntries(order)
{
	let table_body = $("#tbl_main tbody");

	table_body.html("");

	$.ajax({ url: 'ajax/list_entries.php', dataType: 'json' })
	.done(function(data, textStatus, jqXHR)
	{
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
			tr    += "    <a class=\"btn_action btn_disabled\" onclick=\"doPull("+i+", false);return false;\" href=\"#\">Pull</a>";
			tr    += "    <a class=\"btn_action btn_disabled\" onclick=\"doPull("+i+", true);return false;\" href=\"#\">Force Pull</a>";
			tr    += "  </td>";
			tr    += "</tr>"
			table_body.append(tr);
			i++;
		}

		let tr = "<tr>";
		tr    += "  <td colspan=\"4\"><input id=\"input_add\"></input></td>";
		tr    += "  <td>";
		tr    += "    <a class=\"btn_action\" onclick=\"doAdd();return false;\" href=\"#\">Add</a>";
		tr    += "  </td>";
		tr    += "</tr>"
		table_body.append(tr);
		
		setTimeout(function(){ updateEntriesChain(0, i); }, 350);
		
	})
	.fail(function(jqXHR, textStatus, errorThrown)
	{
		console.error(textStatus);
		console.error(errorThrown);
		alert(textStatus);
	});
}

function doPull(pathid, force)
{
	//TODO
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
			alert(data.msg);
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
	if (curr == count) return;

	let trow_path    = $("#tab_main_row_"+curr+" > .tab_main_d_path");
	let trow_message = $("#tab_main_row_"+curr+" > .tab_main_d_msg");
	let trow_local   = $("#tab_main_row_"+curr+" > .tab_main_d_loc");
	let trow_remote  = $("#tab_main_row_"+curr+" > .tab_main_d_remo");
	let trow_actions = $("#tab_main_row_"+curr+" > .tab_main_d_act");
	let trow_status  = $("#tab_main_row_"+curr+" > .tab_main_d_path > .statind");

	$.ajax({ url: 'ajax/entry_info.php?path=' + encodeURIComponent(PATHS.get(curr)), dataType: 'json' })
	.done(function(data, textStatus, jqXHR)
	{
		DATAS.set(curr, data);

		if (data.ok)
		{
			trow_message.html(data.msg);
			trow_local.html(data.loc);
			trow_remote.html(data.remote);

			for (let btn of trow_actions.children(".btn_action")) $(btn).removeClass('btn_disabled');

			trow_status.removeClass('si_gray');
			trow_status.removeClass('si_green');
			trow_status.removeClass('si_yellow');
			trow_status.removeClass('si_red');
			trow_status.addClass((data.loc === data.remote) ? 'si_green' : 'si_yellow');
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
		setTimeout(function(){updateEntriesChain(curr+1, count);}, 150);
	});
}





