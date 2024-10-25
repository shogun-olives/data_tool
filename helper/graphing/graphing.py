from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from ..file_io import get_data_fn
import matplotlib.pyplot as plt
from flask import url_for
import seaborn as sn
import pandas as pd
import numpy as np
import config
import os



def get_df(project_name: str) -> pd.DataFrame:
    return pd.read_csv(get_data_fn(project_name))


def get_columns(df: pd.DataFrame) -> list:
    return df.columns.tolist()


def graph_data(
        project_name: str,
        title: str,
        x: str,
        y: str,
        type_of: str,
        regression: str,
    ) -> str:
    if x == "" or y == "" or type_of == "":
        return url_for('static', filename="./images/transparent.png")
    
    df = get_df(project_name)

    # if no data in dataframe return transparent image
    if df.empty:
        return url_for('static', filename="./images/transparent.png")
    
    fig, ax = plt.subplots()
    fig.set_size_inches(16, 9)

    df.fillna(0, inplace=True)
    df.sort_values(by=[x], inplace=True)

    if x == y:
        df[f'{x}_copy'] = df[x]
        ax = df.plot(x=x, y=f'{x}_copy', kind=type_of, ax=ax, ylabel=y, xlabel=x)
    else:
        ax = df.plot(x=x, y=y, kind=type_of, ax=ax, ylabel=y, xlabel=x)
    # set the title to title
    fig.suptitle(title)

    steps = 100
    x_min = df[x].min()
    x_max = df[x].max()
    regression_df = pd.DataFrame({x: np.linspace(x_min, x_max, steps)})
    if regression == "linear":
        model = LinearRegression()
        model.fit(df[x].values.reshape(-1, 1), df[y].values)
        ax.plot(regression_df[x], model.predict(regression_df[x].values.reshape(-1, 1)), color='red')
    elif regression == "quadratic":
        poly = PolynomialFeatures(degree=2)
        x_poly = poly.fit_transform(df[x].values.reshape(-1, 1))
        model = LinearRegression()
        model.fit(x_poly, df[y].values)
        regression_df = poly.fit_transform(regression_df[x].values.reshape(-1, 1))
        ax.plot(regression_df[:, 1], model.predict(regression_df), color='red')
    elif regression == "logarithmic":
        x_log = np.log(df[x].values).reshape(-1, 1)
        model = LinearRegression()
        model.fit(x_log, df[y].values)
        regression_df = pd.DataFrame({x: np.linspace(x_min, x_max, steps)})
        regression_df_log = np.log(regression_df[x].values).reshape(-1, 1)
        ax.plot(regression_df[x], model.predict(regression_df_log), color='red')


    # save the graph to a file in ./static/images/graph_temp
    if not os.path.exists("./static/images/graphs"):
        os.makedirs("./static/images/graphs")
    fn = f"./static/images/graphs/{title}.png"
    plt.savefig(fn)

    # TODO replace placeholder
    return url_for('static', filename=f"./images/graphs/{title}.png")