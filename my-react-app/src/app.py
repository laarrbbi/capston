from flask import Flask
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def homepage():
    return 'Hello, World!'


@app.route('/continue-watching')
def continue_watching():
    series = watch_again()
    watched_episodes = series["series"][0]["episodes"]

    response = requests.get("https://api.tvmaze.com/shows/33352/episodes")
    if response.status_code == 200:
        data = response.json()
        ids = [d['id'] for d in data]
        print(ids)
        print(watched_episodes)
        diff = []
        for episode_id in ids:
            if episode_id not in watched_episodes:
                diff.append(episode_id)

        print(diff)
    else:
        print(f"Failed to get data: {response.status_code}")

    return diff


def watch_again():
    return {
        "series": [
            {
                "title": "The rings of power",
                "id": 33352,
                "episodes": [2141182]
            }
        ]
    }

if __name__ == '__main__':
    app.run(debug=True)