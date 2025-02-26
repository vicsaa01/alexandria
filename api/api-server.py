from dotenv import load_dotenv
import os
import flask
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
import json

# Load and access environment variables
load_dotenv()
MONGO_URI = os.getenv('MONGO_URI')

# Create a Flask app and allow CORS
app = flask.Flask(__name__)
app.config["DEBUG"] = True
app.config["MONGO_URI"] = MONGO_URI
CORS(app)

# Connect to MongoDB and get collections
mongo = PyMongo(app)
favoriteSites = mongo.db.favoriteSites

# Define routes
@app.route('/favorites', methods=['GET'])
def get_favorites():
    favorites = favoriteSites.find()
    return jsonify(favorites)

@app.route('/recent', methods=['GET'])
def get_recent():
    recent = favoriteSites.find().sort('lastViewedOn', -1).limit(10)
    return jsonify(recent)

@app.route('/most-viewed', methods=['GET'])
def get_most_viewed():
    mostViewed = favoriteSites.find().sort('views', -1).limit(10)
    return jsonify(mostViewed)