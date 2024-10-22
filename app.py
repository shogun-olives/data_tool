from helper import get_projects, project_check_exists, get_data, setup, delete, save_csv, rename
from flask import Flask, render_template, request, redirect, url_for
import config

app = Flask(__name__)


# Home dir - automatically redirects to project_select
@app.route('/')
def home():
    return redirect(url_for("project_select"))


# Project select page
@app.route('/project')
def project_select():
    return render_template(
        config.TEMPLATES_PROJECT["select"],
        projects = get_projects()
    )


# Project page
@app.route('/project/<project_name>')
@project_check_exists
def project_home(project_name: str):
    return render_template(
        config.TEMPLATES_PROJECT["home"],
        project_name = project_name
    )


# project data page
@app.route('/project/<project_name>/data')
@project_check_exists
def project_data(project_name: str):
    return render_template(
        config.TEMPLATES_PROJECT["data"],
        project_name = project_name,
        data = enumerate(get_data(project_name))
    )


# project graph page
@app.route('/<project_name>/graph')
@project_check_exists
def graph(project_name: str):
    return render_template(
        config.TEMPLATES_PROJECT["graph"],
        project_name = project_name
    )


# create new project
@app.route('/project/create_new/<project_name>', methods=['POST'])
def project_create(project_name: str):
    # Check if url was accessed properly
    data: dict = request.get_json()
    if data.get("project", None) != project_name:
        return redirect(url_for('home'))

    # create a new project and direct to it
    setup(project_name)
    return redirect(url_for('project_home', project_name=project_name))


# delete project
@app.route('/project/<project_name>/delete', methods=['POST'])
@project_check_exists
def project_delete(project_name: str):
    # check if url was accessed properly
    data: dict = request.get_json()
    if data.get("project", None) != project_name:
        return redirect(url_for('home'))
    
    # delete project
    delete(project_name)
    return redirect(url_for('project_select'))


# save data
@app.route('/project/<project_name>/save_data', methods=['POST'])
@project_check_exists
def save_data(project_name: str):
    # check if url was accessed properly
    data: dict = request.get_json()
    if data.get("project", None) != project_name:
        return redirect(url_for('home'))
    
    # save data to csv
    save_csv(project_name, data.get("csv", ""))
    return redirect(url_for('project_home', project_name=project_name))


# rename project
@app.route('/project/<project_name>/rename', methods=['POST'])
@project_check_exists
def project_rename(project_name: str):
    # check if url was accessed properly
    data: dict = request.get_json()
    if data.get("old_project_name", None) != project_name:
        return redirect(url_for('home'))
    
    # rename project
    rename(data.get("old_project_name", ""), data.get("new_project_name", ""))
    return redirect(url_for(data.get("source_location"), project_name=data.get("new_project_name", "")))

# catches all illegal accesses
@app.route('/<path:path>')
def reroute(path):
    return redirect(url_for("home"))


if __name__ == '__main__':
    app.run(debug=True)