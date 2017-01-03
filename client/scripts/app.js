var app = {};
app.server = 'https://api.parse.com/1/classes/messages';
app.friends = {};
app.selectedRoom = 'All';
app.chatrooms = {All: true};

app.init = function () {
  app.fetch();
};

app.createMessage = function (chat) {
  var message = '<span class="username">' + chat.username + '</span>';
  message += ' - ' + app.convertTime(chat.updatedAt) + '<br>';
  message += chat.text + '<br>';
  message += '<span class="roomname">' + chat.roomname + '</span>';
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
      var received = data.results;
      for (var i = 0, counter = 0; i < 99 && counter < 21; i++) {
        app.chatrooms[received[i].roomname] = true;
        if (app.selectedRoom === 'All' || received[i].roomname === app.selectedRoom) {
          app.createMessage(received[i]);
          counter++;
        }
      }
      $('.username').on('click', function() {
        var user = $(this).html();

        app.handleUsernameClick(user);
      });
      $('#roomSelect').children().remove();
      _.each(app.chatrooms, function(val, room) {
        app.renderRoom(room);
      });

      console.log('chatterbox: Messages received', data);
    },
    error: function (data) {
      console.error('chatterbox: Failed to receive messages', data);
    }
  });
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

app.renderRoom = function(room) {
  $('#roomSelect').append('<option value=' + JSON.stringify(room) + '>' + room + '</option>');
};

app.handleSubmit = function() {
  var newMessage = $('#message').val();
  var message = {
    username: window.location.search.slice(10),
    text: newMessage,
    roomname: 'lobby'
  };
  this.renderMessage(message);   
  $('.chat').remove();
  this.fetch(); 
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
    console.log(event);
  });

  // $('[id=roomSelect] option').filter(function() {
  //   return ($(this).value === 'All');
  // }).prop('selected', true);
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
