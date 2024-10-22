import { config } from "./config.js";
let curr_project_name = get_project_name();

export function get_project_name() {
	// Fetch project name
	return document.getElementById(config.projectID).value;
}

export function go_back() {
	let temp = location.href.substring(0, location.href.length - 1);
	location.href = location.href.substring(0, temp.lastIndexOf("/"));
}

function project_rename() {
	let project_name = get_project_name();
	fetch(`/project/${curr_project_name}/rename`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			old_project_name: curr_project_name,
			new_project_name: project_name,
			source_location: location.href,
		}),
	}).then(() => {
		curr_project_name = project_name;
		location.href = `/project/${project_name}`;
	});
}

export function project_name_listener_update(event) {
	if (event.key == "Enter") {
		project_rename();
	}
}
