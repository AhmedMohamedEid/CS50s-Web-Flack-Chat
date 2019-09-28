import os
import datetime
import time

from flask import Flask, session, render_template, jsonify, request, redirect
from flask_session import Session
from werkzeug.exceptions import default_exceptions, HTTPException, InternalServerError
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

socketio = SocketIO(app)

users = []
channel_list = []

@app.route("/", methods=['GET', 'POST'])
def index():
    if request.method == "POST":
        user_name = request.form.get('name')
        if not user_name:
            return render_template("index.html", message="Username Is Requird")
        else:
            if user_name in users:
                return render_template("index.html", name=user_name, message="This User is already exist!")
            else:
                users.append(user_name)
                session["username"] = user_name
                return redirect("/chats")
    else:
        if "username" in session:
            return redirect("/chats")

    return render_template("index.html")


@app.route("/chats", methods=['GET', 'POST'])
def chats():
    return render_template("chat.html")


class Channels ():

	def __init__(self, name):
		self.name = name
		self.messages = []

	def NewMessage(self, message, sender, channel, time):
		new_message = {'message': message, 'sender': sender, 'channel': channel, 'time': time}
		self.messages.append(new_message)
		while len(self.messages) >= 100:
			del (self.messages[0])


# Create A new Channel with ajax
@app.route("/chats_json", methods=['GET', 'POST'])
def chat_json():
    if request.method == "POST":
        channel_name = request.form.get("channel_name")
        channel_name = channel_name.strip()

        for channel in channel_list:
            if channel_name in channel.name:
                return jsonify({
                    "responce": "Chat is already exist"
                })
        # Create a New Chat
        new_channel = Channels(channel_name)
        channel_list.append(new_channel)


        chatls = []
        for chat in channel_list:
            chatls.append(chat.__dict__)

        chatls.append({'true': 'true'})

        return jsonify(chatls)

    else:
    	chatls = []

    	for object in channel_list:
    		chatls.append(object.__dict__)
            # print(object)
    	return jsonify(chatls)


@app.route("/chat", methods=['POST'])
def chat():

	chatname = request.form.get('chatname')
	# print('Chatname is ' +chatname)

	for chat in channel_list:
		if chatname in chat.name:
			return jsonify(chat.messages)


@socketio.on("new message")
def new_message(data):

	#Get new message
	message = data["new_message"]
	channel = data["channel"]
	time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
	sender = session["username"]

	package = {"message": message, "time":time, "sender": sender, 'channel': channel}

	for chat in channel_list:
		if channel == chat.name:
			chat.NewMessage(message, sender, channel, time)

	emit("broad message", package, broadcast=True)
