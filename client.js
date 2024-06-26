$(document).ready(function() {
  const socket = io('http://localhost:3000');
  const $userList = $('#userList');
  let my_room = 0;

  $("#gameDialog").dialog({
    autoOpen: false,
    width: "auto",
    height: "auto",
    modal: true,
    resizable: false,
    draggable: false,
    dialogClass: "full-screen-dialog",
    open: function(event, ui) {
      // Load the game content from an external HTML file
      $("#gameDialog").load("game.html");
    }
  });

  function gameInstance(){
    $("#gameDialog").dialog("open");
  }

  function onAskDuel(senderID) {
    $(`<div><p>"${senderID}" requests a duel</p></div>`).dialog({
      resizable: false,
      modal: true,
      buttons: {
        "Accept": {
          text: "Accept",
          "class": "ui-dialog-button",
          click: function() {
            $(this).dialog('close');
            acceptDuel(senderID);
          }
        },
        "Decline": {
          text: "Decline",
          "class": "ui-dialog-button",
          click: function() {
            $(this).dialog('close');
          }
        }
      }
    });
  }

  function onLobbySelect(id) {
    $(`<div><p>Ask "${id}" for a duel</p></div>`).dialog({
      resizable: false,
      modal: true,
      buttons: {
        "Yes": {
          text: "Yes",
          "class": "ui-dialog-button",
          click: function() {
            $(this).dialog('close');
            askJoin(id);
          }
        },
        "Cancel": {
          text: "Cancel",
          "class": "ui-dialog-button",
          click: function() {
            $(this).dialog('close');
          }
        }
      }
    });
  }

  function askJoin(id) {
    socket.emit('request duel', socket.id, id);
  }

  function acceptDuel(id) {
    socket.emit('duel accepted', socket.id, id)
  }
  
  function addUserToList(id) {
    const $item = $('<li></li>');
    const $user = $('<button></button>');
    
    if (socket.id === id) {
        $user.css('backgroundColor', 'red');
    } else {
        $user.click(function() {
            onLobbySelect(id);
        });
    }
    
    $user.text(id);
    $item.append($user);
    $userList.append($item);
}

function updateUserList(users) {
    $userList.empty(); 
    users.forEach(id => {
        addUserToList(id);
    });
}
  socket.on('ask duel', (senderID) => {
    onAskDuel(senderID);
  });
  socket.on('update user list', (users) => {
    updateUserList(users);
  });
  socket.on('fight', () => {
    gameInstance();
  })
});
