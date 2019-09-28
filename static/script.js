
// <script id="newmes" type="text/x-handlebars-template">
// {% raw -%}
// <div class="incoming_msg">
//   <div class="incoming_msg_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil"> </div>
//   <div class="received_msg">
//     <div class="received_withd_msg">
//       <p>{{ sender }} @ {{ message }}</p>
//       <span class="time_date"> {{ time }}</span></div>
//   </div>
// </div>
// {%- endraw %}
// </script>
//
// <script id="in_message" type="text/x-handlebars-template">
// {% raw -%}
// <div class="outgoing_msg">
//   <div class="sent_msg">
//     <p>{{ sender }} @ {{ message }}</p>
//     <span class="time_date"> {{ time }}</span> </div>
// </div>
// {%- endraw %}
// </script>
//
// <script>


document.querySelector("#creat_channel").onclick = () => {
  let channel_name = document.querySelector("#channel_name").value;

  if (channel_name != ""){
    const request = new XMLHttpRequest();
    request.open("POST", "/chats_json");

    // Add start and end points to request data.
      const data = new FormData();
      data.append('channel_name', channel_name);

      // Send request
  		request.send(data);
      console.log(data.name)
      // Delete chatname from input form
  		document.querySelector('#channel_name').value = '';

      // Procced data
      request.onload = () => {
        console.log(request.responseText);
        const data = JSON.parse(request.responseText);
        console.log(data)
        if (Object.keys(data).length > 1) {
          create_Chat(data[(Object.keys(data).length) - 2]);
        }
        else {
          checkchatstatus(data);
        }
      };
    }else {
      alert("This field is empty");
    }
};
// onclick="clickOnChannel(${ name })"

function createChannelLine(name) {
  return `
      <div class="chat_list">
        <div class="chat_people" onclick="clickOnChannel('${ name }')">
          <div class="chat_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil"> </div>
          <div class="chat_ib">
            <h5 id="${ name }">${ name }</h5>
          </div>
        </div>
      </div>
  `;
}

function create_Chat(data) {

  var tempalet = createChannelLine(data.name);

  // Add responce to DOM
  document.querySelector('.inbox_chat').innerHTML += tempalet;

  // // Set localStorage to current chat
  localStorage.setItem('channel', data.name);
  document.querySelector(".current-chat").innerHTML = localStorage.getItem('channel');
  changeChat(data.name);
};

// // JQ
// $(document).ready(function() {
//    $("div.chat_people").click(function () {
//      alert("Hello");
//    });
// });

function clickOnChannel(chatname) {
  // alert(chatname);
  localStorage.setItem("channel", chatname);
  //
  if(localStorage.getItem("channel") != ""){
    document.querySelector(".current-chat").innerHTML = localStorage.getItem('channel');
    changeChat(chatname);
  }else {
    document.querySelector(".current-chat").innerHTML = "Please Chose Your Channel"
  }
  changeChat(chatname);

}



function changeChat(data) {

  const request = new XMLHttpRequest();
  request.open("POST", "/chat");

  // Append data
  const chatdata = new FormData();
  chatdata.append('chatname', localStorage.getItem('channel'));

  request.send(chatdata);

  // Crear all old messages
  clearMessages();

  request.onload = () => {
    console.log(request.responseText);
    const data = JSON.parse(request.responseText);
    console.log(data);
    document.querySelector(".msg_history").innerHTML = "";
        data.forEach(addMessage);
  }
}




function checkchatstatus(arg) {
  let responce = arg.responce;
  alert(responce);
}


document.addEventListener("DOMContentLoaded", () => {

  var display_name = document.querySelector("#display_name").innerHTML;
  localStorage.setItem("display_name", display_name);
  // alert(display_name);
  if(localStorage.getItem("channel") != ""){
    document.querySelector(".current-chat").innerHTML = localStorage.getItem('channel');
  }else {
    document.querySelector(".current-chat").innerHTML = "Please Chose Your Channel"
  }
	// Make a request to get messages for the first time
	const request = new XMLHttpRequest();
	request.open('GET', '/chats_json');
	request.send();

	request.onload = () =>{
		const data = JSON.parse(request.responseText);
		if (Object.keys(data).length > 0) {
			data.forEach(create_Chat)
		}
	};


  // Load the last chat
  if (localStorage.getItem('channel')) {

    const chatname = localStorage.getItem('channel');
    console.log("Chat Name is:"+chatname);
    changeChat(chatname);
  }




    // Connect to web socket
  	var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

  	// When connected, configure buttons
  	socket.on('connect', () => {

  			document.querySelector("#send").onclick = () => {
  				const message = document.querySelector('#message').value;
  				const channel = localStorage.getItem('channel');

  				socket.emit('new message', {'new_message': message, 'channel': channel});
  				document.querySelector('#message').value = "";
  			};

  			document.addEventListener("keypress", function(key) {
  				const message = document.querySelector('#message').value;
  					if ( key.keyCode == 13 && message != '') {
  						const channel = localStorage.getItem('channel');
  						socket.emit('new message', {'new_message': message, 'channel': channel});
  						document.querySelector('#message').value = "";
  					};
  				});
  			});

  	socket.on('broad message', data => {

  		// Add message
  		addMessage(data);

  	});

});


function newMessage(data) {
  return `
  <div class="outgoing_msg">
    <div class="text-right">
      <span>${ data.sender }</span>
    </div>
    <div class="sent_msg">
      <p>${ data.message }</p>
      <span class="time_date">${ data.time }</span> </div>
  </div>
  `;
}

function inMessage(data) {
  return `
  <div class="incoming_msg">
    <div class="incoming_msg_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil"> </div>
    <span>${ data.sender }</span>
    <div class="received_msg">
      <div class="received_withd_msg">
        <p>${ data.message }</p>
        <span class="time_date">${ data.time }</span></div>
    </div>
  </div>
  `;
}

function addMessage(data)	{

    // Check local storage to unsure that user in current chatroom
    if (localStorage.getItem('channel') == data.channel) {

      var temp = null;
      if (localStorage.getItem('display_name') == data.sender) {

        // Add a new post with given contents to DOM.
        temp = newMessage(data);
        document.querySelector(".msg_history").innerHTML += temp;

      }else{
        // Add a new post with given contents to DOM.
        temp = inMessage(data);
        document.querySelector(".msg_history").innerHTML += temp;

      }
      $('#chatwindow').scrollTop(500000);
    }
  };

  function clearMessages() {
    document.querySelector('#message').innerHTML = "";
  };
