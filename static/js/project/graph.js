import { load_calc } from "../calculator/calculator.js";
import { go_back, get_project_name } from "../util.js";
import { config } from "../config.js";

// make functions global
window.go_back = go_back;

function save_graph() {
	let project_name = document.getElementById(config.projectID).value;
	let graph = document.getElementById("graph");

	if (!graph.src.endsWith("transparent.png")) {
		let x = document.getElementById("x-axis").value;
		let y = document.getElementById("y-axis").value;

		let graph_title = document.getElementById("title").value;
		if (graph_title == "") {
			graph_title = `${project_name}_${x}_${y}_graph`;
		}
		// turn image into a downloadable link
		let image = graph.src;
		let link = document.createElement("a");
		link.href = image;
		link.download = `${graph_title}.png`;
		link.click();
	}
}

function title_listener(event) {
	if (event.key === "Enter") {
		update_graph();
	}
}

function update_graph() {
	let project_name = get_project_name();

	let graph_title = document.getElementById("title").value;
	let x = document.getElementById("x-axis").value;
	let y = document.getElementById("y-axis").value;
	if (graph_title == "") {
		graph_title = `${x} vs ${y}`;
	}

	let graph_type = document.getElementById("type").value;
	let graph_regression = document.getElementById("regression").value;

	fetch(`/project/${project_name}/graph/update`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			project: project_name,
			title: graph_title,
			x_axis: x,
			y_axis: y,
			type: graph_type,
			regression: graph_regression,
		}),
	})
		.then((response) => response.json())
		.then((data) => {
			let graph = document.getElementById("graph");
			graph.src = `${data["graph"]}?t=${new Date().getTime()}`;
		});
}

window.save_graph = save_graph;

window.onload = function () {
	load_calc();

	let title = document.getElementById("title");
	title.onkeydown = title_listener;

	let selects = document.getElementsByTagName("select");
	for (let i = 0; i < selects.length; i++) {
		selects[i].onchange = update_graph;
	}
};
