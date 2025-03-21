from dotenv import load_dotenv
import os
import flask
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from flask_pymongo import PyMongo
from flask_httpauth import HTTPBasicAuth
import jwt
import json
import requests
from bson import ObjectId
import datetime
from bs4 import BeautifulSoup

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
users = mongo.db.users
sites = mongo.db.sites
favoriteSites = mongo.db.favoriteSites
lists = mongo.db.lists
addedTo = mongo.db.addedTo

# Basic HTTP authorization
auth = HTTPBasicAuth()

@auth.get_password
def get_password(username):
    user = users.find({"username":username})
    if user is None:
        return None
    else:
        return user[0]['password']

@auth.error_handler
def unauthorized():
    return make_response(jsonify({'error': 'Unauthorized access'}), 403)

# Define routes
# Getters
@app.route('/favorites', methods=['GET'])
def get_favorites():
    favorites = favoriteSites.aggregate([
        { "$addFields": { "obj_site_id": { "$toObjectId": "$site_id" }}},
        { "$lookup": { "from": "sites", "localField": "obj_site_id", "foreignField": "_id", "as": "sitesLookup" }},
        { "$unwind": "$sitesLookup" },
        { "$match": { "user_id": user_id }},
        { "$project": { "tag": 1, "views": 1, "lastViewedOn": 1, "dateAdded": 1, "url": "$sitesLookup.url" }},
        { "$sort": { "tag": 1 }}
    ])
    return jsonify(favorites)

@app.route('/recent', methods=['GET'])
@auth.login_required
def get_recent():
    auth_header = request.headers.get('Authorization')
    if auth_header.startswith('Bearer '):
        encoded_jwt = auth_header[7:]
        decoded_jwt = jwt.decode(encoded_jwt, os.getenv('JWT_KEY'), algorithms=['HS256'])
        user_id = decoded_jwt['userID'] # check if userID field exists
        recent = favoriteSites.aggregate([
            { "$addFields": { "obj_site_id": { "$toObjectId": "$site_id" }}},
            { "$lookup": { "from": "sites", "localField": "obj_site_id", "foreignField": "_id", "as": "sitesLookup" }},
            { "$unwind": "$sitesLookup" },
            { "$match": { "user_id": str(user_id) }},
            { "$project": { "tag": 1, "views": 1, "lastViewedOn": 1, "dateAdded": 1, "url": "$sitesLookup.url" }},
            { "$sort": { "lastViewedOn": -1 }},
            { "$limit": 10 }
        ])
        return jsonify(recent)
    return make_response(jsonify({'error': 'Unauthorized access'}), 403)

@app.route('/most-viewed', methods=['GET'])
def get_most_viewed():
    mostViewed = favoriteSites.aggregate([
        { "$addFields": { "obj_site_id": { "$toObjectId": "$site_id" }}},
        { "$lookup": { "from": "sites", "localField": "obj_site_id", "foreignField": "_id", "as": "sitesLookup" }},
        { "$unwind": "$sitesLookup" },
        { "$match": { "user_id": 0 }},
        { "$project": { "tag": 1, "views": 1, "lastViewedOn": 1, "dateAdded": 1, "url": "$sitesLookup.url" }},
        { "$sort": { "views": -1 }},
        { "$limit": 10 }
    ])
    return jsonify(mostViewed)

@app.route('/my-lists', methods=['GET'])
def get_my_lists():
    myLists = lists.find({"user_id":user_id}).sort('name', 1)
    return jsonify(myLists)

@app.route('/list', methods=['GET'])
def get_list():
    myList = lists.find_one({"_id": ObjectId(request.args.get('id'))})
    return jsonify(myList)

@app.route('/list-items', methods=['GET'])
def get_list_items():
    listItems = favoriteSites.aggregate([
        { "$addFields": {
            "string_id": { "$toString": "$_id" },
            "obj_site_id": { "$toObjectId": "$site_id" }
        }},
        { "$lookup":
            { "from": "addedTo", "localField": "string_id", "foreignField": "favorite_id", "as": "addedToLookup" }
        },
        { "$lookup":
            { "from": "sites", "localField": "obj_site_id", "foreignField": "_id", "as": "sitesLookup" }
        },
        { "$unwind": "$addedToLookup" },
        { "$unwind": "$sitesLookup" },
        { "$match": { "addedToLookup.list_id": request.args.get('id') }},
        { "$project": { "tag": 1, "views": 1, "lastViewedOn": 1, "dateAdded": "$addedToLookup.dateAdded", "url": "$sitesLookup.url" }},
    ])
    return jsonify(listItems)



# View site
@app.route('/view-site', methods=['GET'])
def view_site():
    favoriteSites.find_one_and_update(
        { "_id": ObjectId(request.args.get('id')) },
        { "$inc": {"views": 1}, "$set": {"lastViewedOn": str(datetime.datetime.now())[0:16]} }
    )
    return jsonify({"message":"Site viewed"})

# Proxy to get title of a site given a URL
@app.route('/get-site-info', methods=['GET'])
def get_site_info():
    url = request.args.get('url')
    try:
        site = requests.get(url)
        html_content = BeautifulSoup(site.content, 'html.parser')
        title = html_content.find('title').get_text()
        return jsonify({"title":title})
    except Exception as e:
        return jsonify({"error":"Could not fetch title from URL"})



# Add new favorite site
@app.route('/add-favorite', methods=['POST'])
def add_favorite():
    try:
        mySite = sites.find_one({"url": request.json['url']})
        if mySite is None:
            sites.insert_one({
                "url": request.json['url'],
                "title": request.json['title']
            })
        site_id = str(sites.find_one({"url": request.json['url']})['_id'])
        # Duplicate check not working ???
        duplicates_count = lists.count_documents({"user_id": request.json['user_id'], "site_id": site_id, "tag": request.json['tag']})
        if duplicates_count > 0:
            return jsonify({"message":"You have already saved this site with this tag"})
        else:
            favoriteSites.insert_one({
                "user_id": request.json['user_id'],
                "site_id": site_id,
                "tag": request.json['tag'],
                "views": 0,
                "lastViewedOn": None,
                "dateAdded": str(datetime.datetime.now())[0:16]
            })
            return jsonify({"message":"Favorite added"})
    except Exception as e:
        return jsonify({"message":"Could not add favorite", "error":str(e)})

# Edit tag of favorite site
@app.route('/edit-tag', methods=['POST'])
def edit_tag():
    try:
        favoriteSites.find_one_and_update(
            { "_id": ObjectId(request.json['favorite_id']) },
            { "$set": { "tag": request.json['new_tag'] }}
        )
        return jsonify({"message":"Tag updated"})
    except Exception as e:
        return jsonify({"message":"Could not update tag", "error":str(e)})

# Remove favorite site
@app.route('/remove-favorite', methods=['POST'])
def remove_favorite():
    try:
        favoriteSites.delete_one({ "_id": ObjectId(request.json['favorite_id'])})
        addedTo.delete_many({ "favorite_id": request.json['favorite_id']})
        return jsonify({"message":"Favorite removed"})
    except Exception as e:
        return jsonify({"message":"Could not remove favorite", "error":str(e)})



# Create new list
@app.route('/create-list', methods=['POST'])
def create_list():
    try:
        duplicates_count = lists.count_documents({"user_id": request.json['user_id'], "name": request.json['name']})
        if duplicates_count > 0:
            return jsonify({"message":"You already have a list with this name"})
        else:
            lists.insert_one({
                "user_id": request.json['user_id'],
                "name": request.json['name'],
                "isPrivate": request.json['isPrivate'],
                "dateAdded": str(datetime.datetime.now())[0:16]
            })
            return jsonify({"message":"List created"})
    except Exception as e:
        return jsonify({"message":"Could not create list", "error":str(e)})

# Remove list
@app.route('/remove-list', methods=['POST'])
def remove_list():
    try:
        lists.delete_one({ "_id": ObjectId(request.json['id'])})
        addedTo.delete_many({ "list_id": request.json['id']})
        return jsonify({"message":"List removed"})
    except Exception as e:
        return jsonify({"message":"Could not remove list", "error":str(e)})

# Add site to list
@app.route('/add-to-list', methods=['POST'])
def add_to_list():
    try:
        duplicates_count = addedTo.count_documents({"favorite_id": request.json['favorite_id'], "list_id": request.json['list_id']})
        if duplicates_count > 0:
            return jsonify({"message":"Site already added to list"})
        else:
            addedTo.insert_one({
                "favorite_id": request.json['favorite_id'],
                "list_id": request.json['list_id'],
                "dateAdded": str(datetime.datetime.now())[0:16]
            })
            return jsonify({"message":"Site added to list"})
    except Exception as e:
        return jsonify({"message":"Could not add site to list", "error":str(e)})

# Remove site from list
@app.route('/remove-from-list', methods=['POST'])
def remove_from_list():
    try:
        addedTo.delete_one({ "favorite_id": request.json['favorite_id'], "list_id": request.json['list_id']})
        return jsonify({"message":"Site removed from list"})
    except Exception as e:
        return jsonify({"message":"Could not remove site from list", "error":str(e)})



# Run the app
if __name__ == '__main__':
    app.run(debug=True) # Debug mode