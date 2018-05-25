var PATHS = new Map();


function refreshEntries(order)
{
	let table_body = $("#tbl_main tbody");

	table_body.html("");

	$.ajax({ url: 'ajax/list_entries.php', dataType: 'json' })
	.done(function(data, textStatus, jqXHR)
	{
		for (let item of data)
		{
			let id = PATHS.size;
			PATHS.set(id, item);

			let tr = "<tr>";
			tr    += "  <td>"+item+"</td>"; // path
			tr    += "  <td><span class=\"msg_light\">querying...</span></td>"; // message
			tr    += "  <td><span class=\"msg_light\">querying...</span></td>"; // head_local
			tr    += "  <td><span class=\"msg_light\">querying...</span></td>"; // head_remote
			tr    += "  <td>"; // actions
			tr    += "    <a class=\"btn_action btn_disabled\" onclick=\"doPull("+id+", false);\">Pull</a>";
			tr    += "    <a class=\"btn_action btn_disabled\" onclick=\"doPull("+id+", true);\">Force Pull</a>";
			tr    += "  </td>";
			tr    += "</tr>"
			table_body.append(tr);
		}

		let tr = "<tr>";
		tr    += "  <td colspan=\"4\"><input id=\"input_add\"></input></td>";
		tr    += "  <td>";
		tr    += "    <a class=\"btn_action\" onclick=\"doAdd();\">Add</a>";
		tr    += "  </td>";
		tr    += "</tr>"
		table_body.append(tr);
	})
	.fail(function(jqXHR, textStatus, errorThrown)
	{
		console.error(msg);
	});
}

function doPull(pathid, force)
{
	//TODO
}

function doAdd()
{
	//TODO
}








window.onload = function ()
{
	refreshEntries();
}