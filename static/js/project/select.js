import { load_calc } from "../calculator/calculator.js";
import { get_project_name } from "../util.js";
import { config } from "../config.js";

function project_create() {
	let project_name = get_project_name();

	// Wait until response is recieved to reload page
	fetch(`/project/create_new/${project_name}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ project: project_name }),
	}).then(() => {
		location.reload();
	});
}

function project_delete(project_name) {
	fetch(`/project/${project_name}/delete`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ project: project_name }),
	}).then(() => {
		location.reload();
	});
}

function new_project_listener_update(event) {
	if (event.key == "Enter") {
		project_create();
	}
}

// make functions globally accessible
window.project_delete = project_delete;

// Add event listener to new project
window.onload = function () {
	load_calc();
	let new_project_input = document.getElementById(config.projectID);
	new_project_input.onkeydown = new_project_listener_update;
};
