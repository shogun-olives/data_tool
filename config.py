# Data storage
DATA_DIR = "./data"
DELETED_DIR = "./temp"

# Template locations
TEMPLATES_PROJECT = {
    "select": "./project/select.html",
    "home": "./project/home.html",
    "data": "./project/data.html",
    "graph": "./project/graph.html",
}

RENDER_TARGETS = {
    # project category
    "project": {
        # select page
        "select": {
            "template": "./project/select.html",
            "stylesheet": "./css/project/select.css",
            "script": "./js/project/select.js",
        },
        # home page
        "home": {
            "template": "./project/home.html",
            "stylesheet": "./css/project/home.css",
            "script": "./js/project/home.js",
        },
        # data page
        "data": {
            "template": "./project/data.html",
            "stylesheet": "./css/project/data.css",
            "script": "./js/project/data.js",
        },
        # graph page
        "graph": {
            "template": "./project/graph.html",
            "stylesheet": "./css/project/graph.css",
            "script": "./js/project/graph.js",
        },
    }
}

CALCULATOR_STATUS = {
    True: "calculator-container",
    False: "calculator-container collapsed",
}

GRAPH_TYPES = {
    "scatter": "scatter",
    "line": "line",
    "bar": "bar",
    "bar horizontal": "barh",
    "histogram": "hist",
    "boxplot": "box",
}

REGRESSION_TYPES = [
    "linear",
    "quadratic",
    "logarithmic",
]