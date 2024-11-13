import { load_calc } from "../calculator/calculator.js";
import {
	go_back,
	get_project_name,
	project_name_listener_update,
} from "../util.js";
import { config } from "../config.js";

function go_to_data() {
	let project_name = get_project_name();
	location.href = `/project/${project_name}/data`;
}

export function go_to_graph() {
	let project_name = get_project_name();
	location.href = `/project/${project_name}/graph`;
}

// Make functions globally accessible
window.go_to_data = go_to_data;
window.go_back = go_back;
window.go_to_graph = go_to_graph;

// Add event listener to project name
window.onload = function () {
	load_calc();
	let project_name_input = document.getElementById(config.projectID);
	project_name_input.onkeydown = project_name_listener_update;
};
