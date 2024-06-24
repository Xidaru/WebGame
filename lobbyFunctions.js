export function onLobbySelect(id) {
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




