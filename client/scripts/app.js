var app = {};
app.server = 'https://api.parse.com/1/classes/messages';
app.friends = {};
app.selectedRoom = 'All';
app.chatrooms = {All: true};
app.allMessages;

app.init = function () {
  app.fetch();
  // setInterval(function() {
  //   app.fetch();
  //   app.renderMessages(app.allMessages);
  // }, 3000);
};

app.createMessage = function (chat) {
  var message = '<span class="username">' + app.escape(chat.username) + '</span>';
  message += ' - ' + app.convertTime(chat.updatedAt) + '<br>';
  message += app.escape(chat.text) + '<br>';
  message += '<span class="roomname">' + app.escape(chat.roomname) + '</span>';
  // message = app.escape(message);
  if (this.friends[chat.username]) {
    $('#chats').append('<div class="chat friend">' + message + '</div>');          
  } else {
    $('#chats').append('<div class="chat">' + message + '</div>');          
  }
};

app.convertTime = function(time) {
  var timestamp = new Date(time);
  var timeString = '';
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  timeString += months[timestamp.getMonth()];
  timeString += ' ' + timestamp.getDate();
  timeString += ', ' + timestamp.getFullYear();
  timeString += ' ' + timestamp.getHours();
  timeString += ':' + timestamp.getMinutes();
  timeString += ':' + timestamp.getSeconds();
  return timeString;
};

app.fetch = function() {
  $.ajax({
    url: this.server,
    // url: 'https://api.parse.com/1/classes/messages?' + encodeURIComponent({where: JSON.stringify({roomname: chatroom, order: '-createdAt'})}),
    // advance url for filtering on chatroom
    data: {order: '-createdAt'},
    type: 'GET',
    contentType: 'application/json',
    success: function (data) {
      app.allMessages = data.results;
      app.renderMessages(app.allMessages);
      $('.username').on('click', function() {
        var user = $(this).html();

        app.handleUsernameClick(user);
      });
      app.renderRoom();
      console.log('chatterbox: Messages received', data);
    },
    error: function (data) {
      console.error('chatterbox: Failed to receive messages', data);
    }
  });
};

app.renderMessages = function (messages) {
  for (var i = 0, counter = 0; i < messages.length; i++) {
    //app.chatrooms[received[i].roomname] = true; ///pull out
    if (app.selectedRoom === 'All' || messages[i].roomname === app.selectedRoom) {
      app.createMessage(messages[i]);
    }
  }
};

app.send = function(message) {
  $.ajax({
    url: this.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent', data);
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.clearMessages = function() {
  $('#chats').html('');
};

app.renderMessage = function(message) {
  this.send(message);
  $('#chats').prepend('<div class="chat">' + message + '</div>');
};

app.renderRoom = function() {

  _.each(app.allMessages, function(chat, key) { 
    var escapedRoom = app.escape(chat.roomname);
    if (!app.chatrooms[escapedRoom]) {
      $('#roomSelect').append('<option value=' + JSON.stringify(escapedRoom) + '>' + escapedRoom + '</option>');
      app.chatrooms[escapedRoom] = true;
    }
  });

};

app.handleSubmit = function() {
  var newMessage = $('#message').val();
  var message = {
    username: app.escape(window.location.search.slice(10)),
    text: newMessage,
    roomname: app.selectedRoom
  };
  this.renderMessage(message);   
  $('.chat').remove();
  this.fetch(); 
};

app.escape = function (string) {
  // &, <, >, ", ', `, , !, @, $, %, (, ), =, +, {, }, [, and ]
  string = string || '';
  var newString = string.replace(/&/g, '&amp').replace(/</g, '&lt').replace(/>/g, '&gt').replace(/'/g, '&#x27').replace(/\//g, '&#x2F');
  return newString;
};

app.handleUsernameClick = function(user) {
  this.friends[user] = user;
  $('.chat').remove();
  this.fetch();
  console.log('username clicked');
};


$(document).ready(function() {
  app.init();

  $('form').submit(function(event) {
    //debugger;
    event.preventDefault();
    app.handleSubmit();
  });

  $('#roomSelect').change(function(event) {
    
    app.selectedRoom = $('#roomSelect').val();
    console.log(app.selectedRoom);
    app.clearMessages();
    app.renderMessages(app.allMessages);

    if ($('#roomSelect').val() === 'newroom') {
      var myNewRoom = prompt('What would you like to name your chatroom?');
      app.chatrooms[myNewRoom] = true;
      app.selectedRoom = myNewRoom;
    }
  });
});



// TODO:
// !-show room names
// !-add friendslist
//   !-make usernames clickable
//   !-make friend chats highlight
// -select chat rooms
// -filter by chat room
//   -make a default (all rooms)
//   -find unique chat rooms, add to options
//   -add a chatroom function
// -fix the dates
// -make it safer
// -make it prettier
// -automatically update it
