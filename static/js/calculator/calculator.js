import { config } from "../config.js";
let updated = false;

function calculator_toggle() {
	var calculator = document.getElementById(config.calculatorContainerID);
	calculator.classList.toggle("collapsed");
	// fetch request to update session
	fetch("/calculator/toggle", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({}),
	});
}

function calculator_add_row() {
	var calculator = document.getElementById(config.calculatorID);
	var row = document.createElement("div");
	row.className = "calculator-row";

	var input = document.createElement("input");
	input.className = "calculator-input";
	input.placeholder = "calculate";
	input.oninput = calculator_input_listener;
	input.onkeydown = calculator_navigation_listener;

	var output = document.createElement("p");
	output.className = "calculator-output";

	row.appendChild(input);
	row.appendChild(output);

	calculator.appendChild(row);
}

function calculator_navigation_listener(event) {
	let input = event.target;
	let row = input.parentElement;
	let calculator = document.getElementById(config.calculatorID);
	// If the key input is uparrow, then go to the input box above
	if (event.key === "ArrowUp") {
		if (row.previousElementSibling) {
			row.previousElementSibling.children[0].focus();
		}
	}

	// If the key input is downarrow, then go to the input box below
	if (event.key === "ArrowDown" || event.key === "Enter") {
		if (row.nextElementSibling) {
			row.nextElementSibling.children[0].focus();
		}
	}
}

function calculator_input_listener(event) {
	updated = true;
	let row = event.target.parentElement;
	let input = event.target;
	let calculator = document.getElementById(config.calculatorID);
	let rows = calculator.getElementsByClassName("calculator-row");
	let lastRow = rows[rows.length - 1];

	if (input.value === "" && row != lastRow) {
		let prev = row.previousElementSibling;
		let next = row.nextElementSibling;
		calculator.removeChild(input.parentElement);
		if (next) {
			next.children[0].focus();
		} else if (prev) {
			prev.children[0].focus();
		}
		return;
	}

	let output = row.getElementsByClassName("calculator-output")[0];
	output.innerHTML = calculate(input.value);

	if (row === lastRow) {
		calculator_add_row();
	}
}

function get_inputs() {
	let calculator = document.getElementById(config.calculatorID);
	let rows = calculator.getElementsByClassName("calculator-row");
	let expressions = [];
	for (let i = 0; i < rows.length - 1; i++) {
		let input = rows[i].getElementsByClassName("calculator-input")[0];
		expressions.push(input.value);
	}
	return expressions;
}

function send_calculator_data() {
	updated = false;
	let expressions = get_inputs();
	// fetch request to update session
	fetch("/calculator/update", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ data: expressions }),
	});
}

function calculate(expression) {
	// Map for math functions and how they should be replaced
	const functionMap = {
		sin: { eval: (x) => `Math.sin(${x})` },
		cos: { eval: (x) => `Math.cos(${x})` },
		tan: { eval: (x) => `Math.tan(${x})` },
		arcsin: { eval: (x) => `Math.asin(${x})` },
		arccos: { eval: (x) => `Math.acos(${x})` },
		arctan: { eval: (x) => `Math.atan(${x})` },
		log: {
			eval: (x, y) =>
				y === undefined
					? `Math.log10(${x})`
					: `Math.log(${y}) / Math.log(${x})`,
		},
		ln: { eval: (x) => `Math.log(${x})` },
	};

	// Replace "pi" with Math.PI and "e" with Math.E
	expression = expression
		.replace(/\bpi\b/g, "Math.PI")
		.replace(/\be\b/g, "Math.E");

	// General function replacement
	expression = expression.replace(
		/([a-z]+)\(([^()]+)\)/g,
		(match, func, args) => {
			if (functionMap[func]) {
				const splitArgs = args.split(",").map((arg) => arg.trim());
				// Dynamically call the appropriate replacement function
				return functionMap[func].eval(...splitArgs);
			} else {
				throw new ReferenceError(`${func} is not defined`);
			}
		}
	);

	// Replace '^' with 'Math.pow' for exponentiation
	expression = expression.replace(
		/(\d+)\^(\d+)/g,
		(_, base, exp) => `Math.pow(${base}, ${exp})`
	);

	try {
		// Use eval to compute the result
		const result = eval(expression);
		if (result > 1e-15 || result < -1e-15) {
			return result;
		}
		return 0;
	} catch (error) {
		if (error instanceof SyntaxError) {
			return "Invalid Syntax";
		} else if (error instanceof ReferenceError) {
			return error.message;
		} else {
			return "Invalid Expression";
		}
	}
}

window.calculator_toggle = calculator_toggle;

export function load_calc() {
	updated = false;
	let calculator = document.getElementById(config.calculatorID);
	let rows = calculator.getElementsByClassName("calculator-row");
	for (let row of rows) {
		let input = row.getElementsByClassName("calculator-input")[0];
		let output = row.getElementsByClassName("calculator-output")[0];
		output.innerHTML = calculate(input.value);

		input.oninput = calculator_input_listener;
		input.onkeydown = calculator_navigation_listener;
		output.value = calculate(input.value);
	}
}

// Uploads to server every 2 seconds
setInterval(() => {
	if (updated) {
		send_calculator_data();
	}
}, 1000);

// before unload
window.addEventListener("beforeunload", function (event) {
	if (updated) {
		send_calculator_data();
		event.preventDefault();
	}
});
