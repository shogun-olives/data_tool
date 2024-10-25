// TODO holy spagetti code

import { load_calc } from "../calculator/calculator.js";
import {
	go_back,
	get_project_name,
	project_name_listener_update,
} from "../util.js";
import { go_to_graph } from "./home.js";
import { config } from "../config.js";

let updated = false;

// Creates a new input
function input_create(col_idx, row_idx) {
	let container = document.createElement("div");
	container.className = "cell-content";

	let input = document.createElement("input");
	input.type = "text";
	input.className = "table-input-cell";
	input.oninput = table_input_listener_update;
	input.onkeydown = table_input_listener_keydown;

	if (row_idx === 0) {
		let delete_icon = document.createElement("img");
		delete_icon.src = "/static/images/trash.png";
		delete_icon.class = "icon";
		delete_icon.width = "20";
		delete_icon.height = "20";
		delete_icon.onclick = column_delete;
		container.appendChild(delete_icon);
		input.value = `Column ${col_idx}`;
	}

	container.appendChild(input);
	return container;
}

// Find next open cell in the table
function next_cell(row_idx, col_idx, table) {
	// Check if right cell is available
	let right_cell = input_at(row_idx, col_idx + 1, table);
	if (right_cell) {
		return [0, 1];
	} else {
		// If not, give first cell on next row
		return [1, 1 - col_idx];
	}
}

// Handles table navigation with keyboard
function table_input_listener_keydown(event) {
	let table = document.getElementById(config.tableID);
	let input = event.target;
	let row_idx = input.parentElement.parentElement.parentElement.rowIndex;
	let col_idx = input.parentElement.parentElement.cellIndex;

	// Handle button navigation, except for Enter
	let buttons = {
		ArrowUp: [-1, 0],
		ArrowDown: [1, 0],
		ArrowRight: [0, 1],
		ArrowLeft: [0, -1],
	};

	// Handle navigation for arrow keys
	if (event.key in buttons) {
		event.preventDefault();
		let move = buttons[event.key];
		let dest_input = input_at(row_idx + move[0], col_idx + move[1], table);
		if (dest_input) {
			dest_input.focus();
		}
	}

	// Handle Enter key separately
	if (event.key === "Enter") {
		event.preventDefault();
		let move = next_cell(row_idx, col_idx, table);
		let dest_input = input_at(row_idx + move[0], col_idx + move[1], table);
		if (dest_input) {
			dest_input.focus();
		}
	}
}

// Handles updates
function table_input_listener_update() {
	let table = document
		.getElementById(config.tableID)
		.getElementsByTagName("tbody")[0];
	let lastRow = table.rows[table.rows.length - 1]; // Get the last row
	let inputs = lastRow.getElementsByTagName("input");
	updated = true;

	for (let input of inputs) {
		if (input.value.trim() != "") {
			add_row();
		}
	}
}

// Create a new row
function add_row() {
	let table = document.getElementById(config.tableID);
	let new_row = table.insertRow();
	let columns = table.rows[0].cells.length;

	// Set the first cell to the row number
	let idx_cell = new_row.insertCell();
	idx_cell.innerHTML = table.rows.length - 1; // Subtract 1 to account for header row

	for (let i = 1; i < columns; i++) {
		// Start from 1 to skip the first cell
		let new_cell = new_row.insertCell();
		let input = input_create();
		new_cell.appendChild(input);
	}
	updated = true;
}

// Create a new column
function add_column() {
	let table = document.getElementById("table");
	let rows = table.rows;

	// Add a new cell to each row
	for (let i = 0; i < rows.length; i++) {
		let new_cell = rows[i].insertCell();
		let input = input_create(rows[0].cells.length - 1, i);
		new_cell.appendChild(input);
	}
	updated = true;
}

function column_delete(event) {
	let table = document.getElementById("table");
	let col_idx = event.target.parentElement.parentElement.cellIndex;
	console.log(col_idx);
	let rows = table.rows;

	// Delete the column
	for (let i = 0; i < rows.length; i++) {
		rows[i].deleteCell(col_idx);
	}

	if (rows[0].cells.length === 1) {
		add_column();
	}
	updated = true;
}

// Helper function to get the input at a specific row and column
function input_at(row, col, table) {
	let rows = table.rows;
	if (row >= 0 && row < rows.length) {
		let cells = rows[row].cells;
		if (col >= 0 && col < cells.length) {
			return cells[col].querySelector("input");
		}
	}
	return null;
}

function csv_from_table() {
	let table = document.getElementById(config.tableID);
	let csv = [];

	for (let i = 0; i < table.rows.length - 1; i++) {
		let row = [];
		let cells = table.rows[i].cells;

		for (let j = 1; j < cells.length; j++) {
			let cell_text = cells[j].querySelector("input")?.value || "";
			row.push(cell_text);
		}
		csv.push(row.join(","));
	}
	return csv.join("\n");
}

function csv_to_server() {
	updated = false;
	let csv_data = csv_from_table();
	let project_name = get_project_name();
	fetch(`/project/${project_name}/save_data`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ project: project_name, csv: csv_data }),
	});
}

function csv_download() {
	let project_name = get_project_name();
	let csv_data = csv_from_table();
	let blob = new Blob([csv_data], { type: "text/csv" });
	let link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = project_name + ".csv";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

window.addEventListener("beforeunload", function (event) {
	if (updated) {
		csv_to_server();
		event.preventDefault();
	}
});

// Uploads to server every 2 seconds
setInterval(() => {
	if (updated) {
		csv_to_server();
	}
}, 1000);

// make functions globally accessible
window.add_column = add_column;
window.add_row = add_row;
window.csv_download = csv_download;
window.go_back = go_back;
window.column_delete = column_delete;
window.go_to_graph = go_to_graph;

// Add event listener to the initial inputs
window.onload = function () {
	load_calc();
	// Update project name box
	let project_name_input = document.getElementById(config.projectID);
	project_name_input.onkeydown = project_name_listener_update;
	updated = false;

	// Update table inputs
	// get all inputs with the following class table-input-cell
	let initial_inputs = document.getElementsByClassName("table-input-cell");
	for (let i = 0; i < initial_inputs.length; i++) {
		initial_inputs[i].oninput = table_input_listener_update;
		initial_inputs[i].onkeydown = table_input_listener_keydown;
	}

	let initial_columns = document.getElementsByClassName("delete-icon");
	for (let i = 0; i < initial_columns.length; i++) {
		initial_columns[i].onclick = column_delete;
	}
};
