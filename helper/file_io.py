from flask import url_for, redirect
import config
import json
import shutil
import os


def format_name(*args: str) -> str:
    return "_".join(x.lower().replace(" ", "_") for x in args)


def get_projects():
    if not os.path.exists(config.DATA_DIR):
        return []
    return os.listdir(config.DATA_DIR)


def save_csv_helper(fn: str, data: str):
    with open(fn, "w") as f:
        f.write(data)


def save_json(fn: str, dictionary: dict):
    json_object = json.dumps(dictionary, indent = 4)
    with open(fn, "w") as outfile:
        outfile.write(json_object)


def project_check_exists(func):
    def wrap_func(*args, **kwargs):
        if kwargs["project_name"] in get_projects():
            # if project exists, execute func
            return func(*args, **kwargs)
        else:
            # otherwise, redirect home
            return redirect(url_for('home'))
    
    # set the name of the function to the name of the original function
    wrap_func.__name__ = func.__name__
    return wrap_func


def setup(project_name: str) -> bool:
    if not os.path.exists(config.DATA_DIR):
        os.mkdir(config.DATA_DIR)

    # check if project exists
    if project_name in get_projects():
        return False
    
    # create project directory
    project_dir = os.path.join(config.DATA_DIR, project_name)
    os.mkdir(project_dir)
    os.mkdir(os.path.join(project_dir, 'images'))

    # create info.json and data.csv
    info = {
        'project_name': project_name,
        'data': f'{project_name.replace(" ", "_")}_data.csv',
        'formulas': {},
        'images': {}
    }

    data = "Column 1\n"

    info_fn = os.path.join(project_dir, format_name(project_name, 'info.json'))
    data_fn = os.path.join(project_dir, format_name(project_name, 'data.csv'))
    save_json(info_fn, info)
    save_csv_helper(data_fn, data)
    
    return True


def save_csv(project_name: str, data: str) -> bool:
    # check if project exists
    if project_name not in get_projects():
        return False
    
    # check if data is empty
    if not data:
        return False
    
    # save data to csv
    fn = os.path.join(config.DATA_DIR, project_name, format_name(project_name, 'data.csv'))
    save_csv_helper(fn, data)
    
    return True


def rename(old_project_name: str, new_project_name: str) -> bool:
    # check if project exists
    if old_project_name not in get_projects():
        return False
    
    # check if new project name is already taken
    if new_project_name in get_projects():
        return False
    
    # check if new project name is empty
    if not new_project_name or not old_project_name:
        return False
    
    # rename project directory
    old_project_dir = os.path.join(config.DATA_DIR, old_project_name)
    new_project_dir = os.path.join(config.DATA_DIR, new_project_name)
    shutil.move(old_project_dir, new_project_dir)

    # update info.json
    info_fn = os.path.join(new_project_dir, format_name(old_project_name, 'info.json'))
    info = json.load(open(info_fn))
    info['project_name'] = new_project_name
    info['data'] = format_name(new_project_name, 'data.csv')
    save_json(info_fn, info)
    shutil.move(info_fn, os.path.join(new_project_dir, format_name(new_project_name, 'info.json')))

    # update data.csv
    old_data_fn = os.path.join(new_project_dir, format_name(old_project_name, 'data.csv'))
    data_fn = os.path.join(new_project_dir, format_name(new_project_name, 'data.csv'))
    shutil.move(old_data_fn, data_fn)

    return True


def delete(project_name: str) -> bool:
    # check if project exists
    if project_name not in get_projects():
        return False
    
    if not os.path.exists(config.DELETED_DIR):
        os.mkdir(config.DELETED_DIR)
    # delete project directory
    project_dir = os.path.join(config.DATA_DIR, project_name)
    deleted_dir = os.path.join(config.DELETED_DIR, project_name)
    shutil.move(project_dir, deleted_dir)
    
    return True

def get_data(project_name):
    fn = os.path.join(config.DATA_DIR, project_name, format_name(project_name, 'data.csv'))
    with open(fn, 'r') as f:
        data = f.read()
    
    data = data.split('\n')
    data = [x.split(',') for x in data]
    return data