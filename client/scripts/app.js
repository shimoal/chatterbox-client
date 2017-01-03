var app = {};
app.server = 'https://api.parse.com/1/classes/messages';
app.friends = {};

app.init = function () {
  app.fetch();

  $('form').submit(function(event) { 
    //debugger;
    event.preventDefault();
    app.handleSubmit();
  });
  // $('.submit').on('click', function(event) {
  //   event.preventDefault();
  //   app.handleSubmit();
  // });

};

app.createMessage = function (chat) {
  var message = '<span class="username">' + chat.username + '</span>';
  message += ' - ' + chat.updatedAt + '<br>';
  message += chat.text + '<br>';
  message += chat.roomname;
  if (this.friends[chat.username]) {
    $('#chats').append('<div class="chat friend">' + message + '</div>');          
  } else {
    $('#chats').append('<div class="chat">' + message + '</div>');          
  }
};

app.fetch = function() {
  var chatroom = 'lobby';
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
        if (chatroom === 'All' || received[i].roomname === chatroom) {
          app.createMessage(received[i]);
          counter++;
        }
      }
      $('.username').click(function() {
        var user = $(this).html();

        app.handleUsernameClick(user);
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
  $('#roomSelect').append('<option>' + room + '</option>');
};

app.handleSubmit = function() {
  console.log('handleSubmit called');
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
  console.log('inside handleUsernameClick', user);
  this.friends[user] = user;
  $('.chat').remove();
  this.fetch();
};


$(document).ready(function() {
  app.init();
});


// TODO:
// !-show room names
// -select chat rooms
// -filter by chat room
//   -make a default (all rooms)
//   -find unique chat rooms, add to options
//   -add a chatroom function
// -fix the dates
// -make it safer
// -make it prettier
// -automatically update it
