const socket = io('http://localhost:3000');
const userList = document.getElementById('userList');


function addUserToList(id) { // Добовляем клиента в список
  const item = document.createElement('li');
  const user = document.createElement('button');
  if (socket.id == id) {
    user.style.backgroundColor = 'red'
  }
  user.innerText = id;

  item.appendChild(user);
  userList.appendChild(item);
}

function updateUserList(users) {
  userList.innerHTML = ''; 
  users.forEach(id => {
    addUserToList(id);
  });
}

socket.on('update user list', (users) => { // Обновляем список когда сервер просит
  updateUserList(users);
});
