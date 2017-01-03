$(document).ready(function() {
  getMessages();

  $('form').submit(function(event) { 
    event.preventDefault();
    // console.log($('input[name=newMessage]').val());
    var newMessage = $('input[name=newMessage]').val();
    var message = {
      username: window.location.search.slice(10),
      text: newMessage,
      roomname: 'lobby'
    };
    submitMessage(message);
    $('.chat').remove();
    getMessages();
  });


});


var received;

var getMessages = function() {
  var chatroom = 'asdf';
  $.ajax({
    url: 'https://api.parse.com/1/classes/messages?' + encodeURIComponent('order=-createdAt'),
    // url: 'https://api.parse.com/1/classes/messages?' + encodeURIComponent({where: JSON.stringify({roomname: chatroom, order: '-createdAt'})}),
    type: 'GET',
    contentType: 'application/json',
    success: function (data) {
      received = data.results;
      for (var i = 0, counter = 0; i < 99 && counter < 21; i++) {
        if (received[i].roomname === chatroom) {
          var message = '<span class="username">' + received[i].username + '</span>';
          message += ' - ' + received[i].updatedAt + '<br>';
          message += received[i].text + '<br>';
          message += received[i].roomname;

          $('#chats').append('<div class="chat">' + message + '</div>');          
          counter++;
        }
      }
      console.log('chatterbox: Messages received', data);
    },
    error: function (data) {
      console.error('chatterbox: Failed to receive messages', data);
    }
  });
};




var submitMessage = function(message) {
  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    url: 'https://api.parse.com/1/classes/messages',
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent', data);
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
  });
};



