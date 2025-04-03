from dotenv import load_dotenv
import os
import flask
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from flask_pymongo import PyMongo
from flask_httpauth import HTTPBasicAuth
import string
import random
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

# Random token generator
def generate_random_token(length):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

# UserID decoder
def check_authorization(request):
    try:
        auth_header = request.headers.get('Authorization')
        if auth_header.startswith('Bearer '):
            encoded_jwt = auth_header[7:]
            decoded_jwt = jwt.decode(encoded_jwt, os.getenv('JWT_KEY'), algorithms=['HS256'])
            if 'username' not in decoded_jwt:
                return None
            return decoded_jwt['username']
    except Exception as e:
        return None

# Basic HTTP authorization
auth = HTTPBasicAuth()
@auth.get_password
def get_password(username):
    user = users.find({"_id":ObjectId(username)})
    if user is None:
        return None
    else:
        return user[0]['password']
@auth.error_handler
def unauthorized():
    return jsonify({'error': 'Unauthorized access'}), 403

########################### ROUTES (GLOBAL) ###########################

# Web favorites
@app.route('/web-favorites', methods=['GET'])
def get_web_favorites():
    favorites = sites.aggregate([
        { "$addFields": { "string_id": { "$toString": "$_id" }}},
        { "$lookup": { "from": "favoriteSites", "localField": "string_id", "foreignField": "site_id", "as": "favoriteSitesLookup" }},
        { "$project": { "url": 1, "title": 1, "totalSaves": {"$size": "$favoriteSitesLookup.tag"} }},
        { "$sort": {"totalSaves": -1}}
    ])
    return jsonify(favorites)

# Web most viewed
@app.route('/web-most-viewed', methods=['GET'])
def get_web_most_viewed():
    favorites = sites.aggregate([
        { "$addFields": { "string_id": { "$toString": "$_id" }}},
        { "$lookup": { "from": "favoriteSites", "localField": "string_id", "foreignField": "site_id", "as": "favoriteSitesLookup" }},
        { "$project": { "url": 1, "title": 1, "totalViews": {"$sum": "$favoriteSitesLookup.views"} }},
        { "$sort": {"totalViews": -1}}
    ])
    return jsonify(favorites)

########################### ROUTES (AUTHENTICATION) ###########################

# Login
@app.route('/login', methods=['POST'])
def login():
    user = users.find_one({"email": request.json['email']})
    if user is None:
        return jsonify({"message":"User not found"}), 404
    if user['password'] != request.json['password']:
        return jsonify({"message":"Wrong password"}), 403
    return jsonify({"message":"Logged in", "userID":user['_id'], "sessionToken":generate_random_token(128)}) # encrypt data

# Register
@app.route('/register', methods=['POST'])
def register():
    user = users.find_one({"email": request.json['email']})
    if user is not None:
        return jsonify({"message":"This email address has already been used"}), 403
    user = users.find_one({"username": request.json['username']})
    if user is not None:
        return jsonify({"message":"This username has already been taken"}), 403
    try:
        users.insert_one({
            "username": request.json['username'],
            "email": request.json['email'],
            "password": request.json['password']
        })
        return jsonify({"message":"User created"})
    except Exception as e:
        return jsonify({"message":"Could not create user"}) # error code

########################### ROUTES (FAVORITES) ###########################

# Return all my fav sites
@app.route('/favorites', methods=['GET'])
def get_favorites():
    user_id = check_authorization(request)
    if user_id is None:
        return jsonify({"message":"Unauthorized access"}), 403
    favorites = favoriteSites.aggregate([
        { "$addFields": { "obj_site_id": { "$toObjectId": "$site_id" }}},
        { "$lookup": { "from": "sites", "localField": "obj_site_id", "foreignField": "_id", "as": "sitesLookup" }},
        { "$unwind": "$sitesLookup" },
        { "$match": { "user_id": str(user_id) }},
        { "$project": { "tag": 1, "views": 1, "lastViewedOn": 1, "dateAdded": 1, "url": "$sitesLookup.url" }},
        { "$sort": { "tag": 1 }}
    ])
    return jsonify(favorites)

# Return most recent
@app.route('/recent', methods=['GET'])
def get_recent():
    user_id = check_authorization(request)
    if user_id is None:
        return jsonify({"message":"Unauthorized access"}), 403
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

# Return most viewed
@app.route('/most-viewed', methods=['GET'])
def get_most_viewed():
    user_id = check_authorization(request)
    if user_id is None:
        return jsonify({"message":"Unauthorized access"}), 403
    mostViewed = favoriteSites.aggregate([
        { "$addFields": { "obj_site_id": { "$toObjectId": "$site_id" }}},
        { "$lookup": { "from": "sites", "localField": "obj_site_id", "foreignField": "_id", "as": "sitesLookup" }},
        { "$unwind": "$sitesLookup" },
        { "$match": { "user_id": str(user_id) }},
        { "$project": { "tag": 1, "views": 1, "lastViewedOn": 1, "dateAdded": 1, "url": "$sitesLookup.url" }},
        { "$sort": { "views": -1 }},
        { "$limit": 10 }
    ])
    return jsonify(mostViewed)

# View site
@app.route('/view-site', methods=['POST'])
def view_site():
    user_id = check_authorization(request)
    if user_id is None:
        return jsonify({"message":"Unauthorized access"}), 403
    try:
        favoriteSites.find_one_and_update(
            { "_id": ObjectId(request.args.get('id')), "user_id": user_id },
            { "$inc": {"views": 1}, "$set": {"lastViewedOn": str(datetime.datetime.now())[0:16]} }
        )
        return jsonify({"message":"Site viewed"})
    except Exception as e:
        return jsonify({"message":"Could not view site", "error":str(e)}), 500

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
        return jsonify({"error":"Could not fetch title from URL"}), 404

# Add new favorite site
@app.route('/add-favorite', methods=['POST'])
def add_favorite():
    user_id = check_authorization(request)
    if user_id is None:
        return jsonify({"message":"Unauthorized access"}), 403
    try:
        mySite = sites.find_one({"url": request.json['url']})
        if mySite is None:
            sites.insert_one({
                "url": request.json['url'],
                "title": request.json['title']
            })
        site_id = str(sites.find_one({"url": request.json['url']})['_id'])
        # Duplicate check not working ???
        duplicates_count = lists.count_documents({"user_id": user_id, "site_id": site_id, "tag": request.json['tag']})
        if duplicates_count > 0:
            return jsonify({"message":"You have already saved this site with this tag"}) # error code
        else:
            favoriteSites.insert_one({
                "user_id": user_id,
                "site_id": site_id,
                "tag": request.json['tag'],
                "views": 0,
                "lastViewedOn": None,
                "dateAdded": str(datetime.datetime.now())[0:16]
            })
            return jsonify({"message":"Favorite added"})
    except Exception as e:
        return jsonify({"message":"Could not add favorite", "error":str(e)}), 500

# Edit tag of favorite site
@app.route('/edit-tag', methods=['POST'])
def edit_tag():
    user_id = check_authorization(request)
    if user_id is None:
        return jsonify({"message":"Unauthorized access"}), 403
    try:
        favoriteSites.find_one_and_update(
            { "_id": ObjectId(request.json['favorite_id']), "user_id": user_id },
            { "$set": { "tag": request.json['new_tag'] }}
        )
        return jsonify({"message":"Tag updated"})
    except Exception as e:
        return jsonify({"message":"Could not update tag", "error":str(e)}), 500

# Remove favorite site
@app.route('/remove-favorite', methods=['POST'])
def remove_favorite():
    user_id = check_authorization(request)
    if user_id is None:
        return jsonify({"message":"Unauthorized access"}), 403
    try:
        favoriteSites.delete_one({ "_id": ObjectId(request.json['favorite_id']), "user_id": user_id })
        addedTo.delete_many({ "favorite_id": request.json['favorite_id']})
        return jsonify({"message":"Favorite removed"})
    except Exception as e:
        return jsonify({"message":"Could not remove favorite", "error":str(e)}), 500

########################### ROUTES (LISTS) ###########################

# Return a list
@app.route('/list', methods=['GET'])
def get_list():
    myList = lists.aggregate([
        { "$addFields": { "obj_user_id": { "$toObjectId": "$user_id" }}},
        { "$lookup": { "from": "users", "localField": "obj_user_id", "foreignField": "_id", "as": "usersLookup" }},
        { "$unwind": "$usersLookup" },
        { "$match": { "_id": ObjectId(request.args.get('id')) }},
        { "$project": { "name": 1, "dateAdded": 1, "username": "$usersLookup.username" }}
    ])
    return jsonify(myList)

# Return all my lists
@app.route('/my-lists', methods=['GET'])
def get_my_lists():
    user_id = check_authorization(request)
    if user_id is None:
        return jsonify({"message":"Unauthorized access"}), 403
    myLists = lists.find({"user_id": str(user_id) }).sort('name', 1)
    return jsonify(myLists)

# Return list items
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

# Create new list
@app.route('/create-list', methods=['POST'])
def create_list():
    user_id = check_authorization(request)
    if user_id is None:
        return jsonify({"message":"Unauthorized access"}), 403
    try:
        duplicates_count = lists.count_documents({"user_id": user_id, "name": request.json['name']})
        if duplicates_count > 0:
            return jsonify({"message":"You already have a list with this name"})
        else:
            lists.insert_one({
                "user_id": user_id,
                "name": request.json['name'],
                "isPrivate": request.json['isPrivate'],
                "dateAdded": str(datetime.datetime.now())[0:16]
            })
            return jsonify({"message":"List created"})
    except Exception as e:
        return jsonify({"message":"Could not create list", "error":str(e)}), 500

# Remove list
@app.route('/remove-list', methods=['POST'])
def remove_list():
    user_id = check_authorization(request)
    if user_id is None:
        return jsonify({"message":"Unauthorized access"}), 403
    try:
        lists.delete_one({ "_id": ObjectId(request.json['id']), "user_id": user_id })
        addedTo.delete_many({ "list_id": request.json['id']})
        return jsonify({"message":"List removed"})
    except Exception as e:
        return jsonify({"message":"Could not remove list", "error":str(e)}), 500

# Add site to list
@app.route('/add-to-list', methods=['POST'])
def add_to_list():
    user_id = check_authorization(request)
    if user_id is None:
        return jsonify({"message":"Unauthorized access"}), 403
    try:
        list_id = request.json['list_id']
        duplicates_count = addedTo.count_documents({"favorite_id": request.json['favorite_id'], "list_id": list_id})
        if duplicates_count > 0:
            return jsonify({"message":"Site already added to list"}) # error code
        else:
            myList = lists.find_one({"_id":ObjectId(list_id), "user_id":user_id})
            if myList is not None:
                addedTo.insert_one({
                    "favorite_id": request.json['favorite_id'],
                    "list_id": list_id,
                    "dateAdded": str(datetime.datetime.now())[0:16]
                })
                return jsonify({"message":"Site added to list"})
            return jsonify({"message":"You can not modify somebody else's list"}) # error code
    except Exception as e:
        return jsonify({"message":"Could not add site to list", "error":str(e)}), 500

# Remove site from list
@app.route('/remove-from-list', methods=['POST'])
def remove_from_list():
    user_id = check_authorization(request)
    if user_id is None:
        return jsonify({"message":"Unauthorized access"}), 403
    try:
        list_id = request.json['list_id']
        myList = lists.find_one({"_id":ObjectId(list_id), "user_id":user_id})
        if myList is not None:
            addedTo.delete_one({ "favorite_id": request.json['favorite_id'], "list_id": list_id})
            return jsonify({"message":"Site removed from list"})
        return jsonify({"message":"You can not modify somebody else's list"}) # error code
    except Exception as e:
        return jsonify({"message":"Could not remove site from list", "error":str(e)}), 500

########################### RUN APP ###########################

# Run the app
if __name__ == '__main__':
    app.run(debug=True) # No debug mode