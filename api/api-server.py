from dotenv import load_dotenv
import os
import flask
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from flask_pymongo import PyMongo
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
JWT_KEY = os.getenv('JWT_KEY')

# Create a Flask app and allow CORS
app = flask.Flask(__name__)
app.config["DEBUG"] = True
app.config["MONGO_URI"] = MONGO_URI
CORS(app)

# Connect to MongoDB and get collections
mongo = PyMongo(app)
users = mongo.db.users
sessions = mongo.db.sessions
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
            decoded_jwt = jwt.decode(encoded_jwt, JWT_KEY, algorithms=['HS256'])
            if 'username' not in decoded_jwt:
                return None
            return decoded_jwt['username']
    except Exception as e:
        return None

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

# Validate session
@app.route('/validate-session', methods=['POST'])
def validate_session():
    session = sessions.find_one({"userID":request.json['userID'], "sessionToken":request.json['sessionToken']})
    if session is None:
        return jsonify({"isValid":False})
    else:
        return jsonify({"isValid":True})

# Login
@app.route('/login', methods=['POST'])
def login():
    ### Find user by email
    user = users.find_one({"email": request.json['email']})
    if user is None:
        return jsonify({"message":"User not found", "error":"User not found"}), 404
    ### Check if user has been blocked, unblock if more than 1 hour passed
    if user['isBlocked']:
        now = datetime.datetime.now()
        blocked_since = user['blockedSince']
        time_passed = now - blocked_since
        if time_passed.total_seconds() > 3600:
            users.update_one(
                {"_id": user['_id']},
                {"$set":{
                    'isBlocked':False
                }}
            )
        else:
            return jsonify({
                "message":"Blocked due to too many attempts (for 1 hour)",
                "error":"Blocked due to too many attempts (for 1 hour)"
            }), 401
    ### Check password and save failed attempts, block if 5 or more attempts
    if user['password'] != request.json['password']:
        try:
            user_id = user['_id']
            users.update_one({"_id": user_id}, {"$inc":{'failedAttempts':1}})
            user = users.find_one({"_id": user_id})
            if user['failedAttempts'] >= 5:
                users.update_one(
                    {"_id": user_id},
                    {"$set": {
                        'failedAttempts':0,
                        'isBlocked':True,
                        'blockedSince':datetime.datetime.now()
                    }}
                )
                return jsonify({
                    "message":"Too many failed login attempts. You can try again in 1 hour",
                    "error":"Too many failed login attempts. You can try again in 1 hour"
                }), 401
            return jsonify({"message":"Wrong password", "error":"Wrong password"}), 401
        except Exception as e:
            return jsonify({"message":"Could not log in", "error":str(e)}), 500
    ### Successful login
    userID = str(user['_id'])
    sessionToken = generate_random_token(128)
    try:
        users.update_one({"_id": user['_id']}, {"$set":{'failedAttempts':0}})
        sessions.insert_one({
            "userID":userID,
            "sessionToken":sessionToken
        })
        return jsonify({"message":"Logged in", "userID":userID, "sessionToken":sessionToken})
    except Exception as e:
        return jsonify({"message":"Could not log in", "error":str(e)}), 500

# Register
@app.route('/register', methods=['POST'])
def register():
    user = users.find_one({"email": request.json['email']})
    if user is not None:
        return jsonify({"message":"This email address has already been used", "error":"This email address has already been used"}), 403
    user = users.find_one({"username": request.json['username']})
    if user is not None:
        return jsonify({"message":"This username has already been taken", "error":"This username has already been taken"}), 403
    try:
        users.insert_one({
            "username": request.json['username'],
            "email": request.json['email'],
            "password": request.json['password'],
            "failedAttempts": 0,
            "isBlocked": False,
            "hasDarkMode": True
        })
        return jsonify({"message":"User registered"})
    except Exception as e:
        return jsonify({"message":"Could not register user", "error":str(e)}), 500

# Logout
@app.route('/logout', methods=['POST'])
def logout():
    try:
        sessions.delete_one({"userID":request.json['userID'], "sessionToken":request.json['sessionToken']})
        return jsonify({"message":"Logged out"})
    except Exception as e:
        return jsonify({"message":"Could not log out", "error":str(e)}), 500

########################### ROUTES (FAVORITES) ###########################

# Return all my fav sites
@app.route('/favorites', methods=['GET'])
def get_favorites():
    user_id = check_authorization(request)
    if user_id is None:
        return jsonify({"message":"Unauthorized access", "error":"Unauthorized access"}), 401
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
        return jsonify({"message":"Unauthorized access", "error":"Unauthorized access"}), 401
    recent = favoriteSites.aggregate([
        { "$addFields": { "obj_site_id": { "$toObjectId": "$site_id" }}},
        { "$lookup": { "from": "sites", "localField": "obj_site_id", "foreignField": "_id", "as": "sitesLookup" }},
        { "$unwind": "$sitesLookup" },
        { "$match": { "user_id": str(user_id) }},
        { "$project": { "tag": 1, "views": 1, "lastViewedOn": 1, "dateAdded": 1, "url": "$sitesLookup.url" }},
        { "$sort": { "lastViewedOn": -1 }}
    ])
    return jsonify(recent)

# Return most viewed
@app.route('/most-viewed', methods=['GET'])
def get_most_viewed():
    user_id = check_authorization(request)
    if user_id is None:
        return jsonify({"message":"Unauthorized access", "error":"Unauthorized access"}), 401
    mostViewed = favoriteSites.aggregate([
        { "$addFields": { "obj_site_id": { "$toObjectId": "$site_id" }}},
        { "$lookup": { "from": "sites", "localField": "obj_site_id", "foreignField": "_id", "as": "sitesLookup" }},
        { "$unwind": "$sitesLookup" },
        { "$match": { "user_id": str(user_id) }},
        { "$project": { "tag": 1, "views": 1, "lastViewedOn": 1, "dateAdded": 1, "url": "$sitesLookup.url" }},
        { "$sort": { "views": -1 }}
    ])
    return jsonify(mostViewed)

# View site
@app.route('/view-site', methods=['POST'])
def view_site():
    user_id = check_authorization(request)
    if user_id is None:
        return jsonify({"message":"Could not view site", "error":"Unauthorized access"}), 401
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
        return jsonify({"message":"Could not add favorite", "error":"Unauthorized access"}), 401
    try:
        mySite = sites.find_one({"url": request.json['url']})
        if mySite is None:
            sites.insert_one({
                "url": request.json['url'],
                "title": request.json['title']
            })
        site_id = str(sites.find_one({"url": request.json['url']})['_id'])
        duplicates_count = favoriteSites.count_documents({"user_id": user_id, "site_id": site_id})
        if duplicates_count > 0:
            return jsonify({"message":"Could not add favorite", "error":"You have already saved this site"}), 403
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
        return jsonify({"message":"Could not update tag", "error":"Unauthorized access"}), 401
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
        return jsonify({"message":"Could not remove favorite", "error":"Unauthorized access"}), 401
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
    # Get list as object
    listAsCursor = lists.aggregate([
        { "$addFields": { "obj_user_id": { "$toObjectId": "$user_id" }}},
        { "$lookup": { "from": "users", "localField": "obj_user_id", "foreignField": "_id", "as": "usersLookup" }},
        { "$unwind": "$usersLookup" },
        { "$match": { "_id": ObjectId(request.args.get('id')) }},
        { "$project": { "name": 1, "user_id": 1, "dateAdded": 1, "isPrivate": 1, "username": "$usersLookup.username" }}
    ])
    listAsArray = list(listAsCursor)
    listAsObj = listAsArray[0]
    # Check if owner
    user_id = check_authorization(request)
    if user_id is not None and user_id == listAsObj['user_id']:
        return jsonify({"list":listAsObj,"isOwner":True})
    # Check if private
    if listAsObj['isPrivate']:
        return jsonify({"message":"You can not view somebody else's private list", "error":"Unauthorized access"}), 401
    else:
        return jsonify({"list":listAsObj,"isOwner":False})

# Return all my lists
@app.route('/my-lists', methods=['GET'])
def get_my_lists():
    user_id = check_authorization(request)
    if user_id is None:
        return jsonify({"message":"Could not retrieve lists", "error":"Unauthorized access"}), 401
    myLists = lists.find({"user_id": str(user_id) }).sort('name', 1)
    return jsonify(myLists)

# Return list items
@app.route('/list-items', methods=['GET'])
def get_list_items():
    # Check if private and not owner
    listAsObj = lists.find_one({"_id": ObjectId(request.args.get('id'))})
    if listAsObj['isPrivate']:
        user_id = check_authorization(request)
        if user_id is None:
            return jsonify({"message":"You can not view somebody else's private list", "error":"Unauthorized access"}), 401
        if user_id != listAsObj['user_id']:
            return jsonify({"message":"You can not view somebody else's private list", "error":"Unauthorized access"}), 401
    # Get list items
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
        return jsonify({"message":"Could not create list", "error":"Unauthorized access"}), 401
    try:
        duplicates_count = lists.count_documents({"user_id": user_id, "name": request.json['name']})
        if duplicates_count > 0:
            return jsonify({"message":"Could not create list", "error":"You already have a list with this name"})
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
        return jsonify({"message":"Could not remove list", "error":"Unauthorized access"}), 401
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
        return jsonify({"message":"Could not add site to list", "error":"Unauthorized access"}), 401
    try:
        list_id = request.json['list_id']
        duplicates_count = addedTo.count_documents({"favorite_id": request.json['favorite_id'], "list_id": list_id})
        if duplicates_count > 0:
            return jsonify({"message":"Could not add site to list", "error":"Site already added to list"}), 403
        else:
            myList = lists.find_one({"_id":ObjectId(list_id), "user_id":user_id})
            if myList is not None:
                addedTo.insert_one({
                    "favorite_id": request.json['favorite_id'],
                    "list_id": list_id,
                    "dateAdded": str(datetime.datetime.now())[0:16]
                })
                return jsonify({"message":"Site added to list"})
            return jsonify({"message":"Could not add site to list", "error":"You can not modify somebody else's list"}), 403
    except Exception as e:
        return jsonify({"message":"Could not add site to list", "error":str(e)}), 500

# Remove site from list
@app.route('/remove-from-list', methods=['POST'])
def remove_from_list():
    user_id = check_authorization(request)
    if user_id is None:
        return jsonify({"message":"Could not remove site from list", "error":"Unauthorized access"}), 401
    try:
        list_id = request.json['list_id']
        myList = lists.find_one({"_id":ObjectId(list_id), "user_id":user_id})
        if myList is not None:
            addedTo.delete_one({ "favorite_id": request.json['favorite_id'], "list_id": list_id})
            return jsonify({"message":"Site removed from list"})
        return jsonify({"message":"Could not remove site from list", "error":"You can not modify somebody else's list"}), 403
    except Exception as e:
        return jsonify({"message":"Could not remove site from list", "error":str(e)}), 500

########################### ROUTES (SETTINGS) ###########################

@app.route('/current-settings', methods=['GET'])
def get_current_settings():
    user_id = check_authorization(request)
    if user_id is None:
        return jsonify({"message":"Could not fetch settings", "error":"Unauthorized access"}), 401
    user = users.find_one({"_id": ObjectId(user_id)})
    return jsonify({"username":user['username'],"hasDarkMode":user['hasDarkMode']})

@app.route('/change-settings', methods=['POST'])
def change_settings():
    user_id = check_authorization(request)
    try:
        if request.json['username'] == "":
            users.update_one({"_id":ObjectId(user_id)}, {"$set": {"hasDarkMode": request.json['hasDarkMode']}})
        else:
            users.update_one({"_id":ObjectId(user_id)}, {"$set": {"username": request.json['username'], "hasDarkMode": request.json['hasDarkMode']}})
        return jsonify({"message":"Your settings have been updated"})
    except Exception as e:
        return jsonify({"message":"Could not update your settings", "error":str(e)}), 500

########################### RUN APP ###########################

# Run the app
if __name__ == '__main__':
    app.run(debug=True)