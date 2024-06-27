// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const server = app.listen(port);
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://127.0.0.1:5500',
    methods: ['GET', 'POST']
  }
});

console.log('Starting the server..')

app.use(cors());

let connectedClients = new Set();
let roomAveilability = new Map();
let roomReady = new Map();
let roomOrder = new Map();
roomAveilability.set(1,['empty']); // Добовляем одну свободную команту
roomReady.set(1,[])
roomOrder.set(1,[])

function flipUnit(unit) { // mKnight => eKnight
  if (unit.startsWith('e')) {
    return 'm' + unit.substring(1);
  } else if (unit.startsWith('m')) {
    return 'e' + unit.substring(1);
  }
}
io.on('connection', (socket) => {

  console.log(`"${socket.id}" joins the server`);
  connectedClients.add(socket.id); // Нового клиента добовляем в таблицу с пользователями
  io.emit('update user list', Array.from(connectedClients)); // Просим каждого пользователя обновить их список

  socket.on('request duel', (senderID, recieverID) => {
    console.log(`"${senderID}" asks "${recieverID}" on a duel`)
    io.to(recieverID).emit('ask duel', senderID);
  });

  socket.on('duel accepted', (senderID, receiverID) => {
    console.log(`Duel between "${senderID}" and "${receiverID}" was accepted`);
    const senderSocket = io.sockets.sockets.get(senderID);
    const receiverSocket = io.sockets.sockets.get(receiverID);
    let last_key;
    for (let [key,value] of roomAveilability) { // Подключаем обоих к первой свободной комнате, если таковых нету, создаём новую
      if (value[0] == 'empty') {
        roomAveilability.set(key,[senderID,receiverID]);
        senderSocket.join(String(key));
        receiverSocket.join(String(key));
        connectedClients.delete(senderID);
        connectedClients.delete(receiverID);
        io.emit('update user list', Array.from(connectedClients));
        console.log(`Players joining room ${key}`);
        console.log(roomAveilability)
        io.to(String(key)).emit('fight')
        return;
      } 
      last_key = key;
    }
    roomAveilability.set(last_key+1,[senderID,receiverID]);
    senderSocket.join(String(last_key+1));
    receiverSocket.join(String(last_key+1));
    connectedClients.delete(senderID);
    connectedClients.delete(receiverID);
    io.emit('update user list', Array.from(connectedClients));
    console.log(`Players joining room ${last_key+1}`);
    console.log(roomAveilability);
    io.to(String(last_key+1)).emit('fight')
  });

  socket.on('getstate', (gameState) => {
    //console.log(gameState);
    let room = parseInt(Array.from(socket.rooms)[1]); // номер комнаты
    let curRoomStatus = roomReady.get(room);
    let curRoomOrder = roomOrder.get(room);
    
    curRoomStatus.push(gameState.moves); // сохраняем исключительно мувы ибо инфа о состоянии бойцов должна совпадать
    curRoomOrder.push(socket.id)
    if (curRoomStatus.length == 2) {
      console.log(curRoomStatus)
      
      // оба игрока сделали ход
      /* Так как мувы добовляются не одновреммено иф выполняется исключительно после хода второго игрока
      Мы можем гарантировать то, второй мувсет принадлежит игроку от чьего сокета приходит сигнал
      Структура данных:
      [
        {
          knight: { skill: null, target: null },
          mage: { skill: null, target: null },
          archer: { skill: null, target: null }
        },
        {
          knight: { skill: null, target: null },
          mage: { skill: null, target: null },
          archer: { skill: null, target: null }
        }
      ]
      ПЕРВЫМ ХОДИТ enemy ИЗ gameState
      */
      let p1Knight = new Map([
        ['HP', parseInt(gameState.enemyKnightState.HP)],
        ['POISON', parseInt(gameState.enemyKnightState.POISON)],
        ['WEAKEN', parseInt(gameState.enemyKnightState.WEAKEN)],
        ['FRAGILE', parseInt(gameState.enemyKnightState.FRAGILE)],
        ['PIERCE', parseInt(gameState.enemyKnightState.PIERCE)],
        ['SHIELD', parseInt(gameState.enemyKnightState.SHIELD)],
        ['POWER', parseInt(gameState.enemyKnightState.POWER)]
      ]);
      
      let p1Mage = new Map([
        ['HP', parseInt(gameState.enemyMageState.HP)],
        ['POISON', parseInt(gameState.enemyMageState.POISON)],
        ['WEAKEN', parseInt(gameState.enemyMageState.WEAKEN)],
        ['FRAGILE', parseInt(gameState.enemyMageState.FRAGILE)],
        ['PIERCE', parseInt(gameState.enemyMageState.PIERCE)],
        ['SHIELD', parseInt(gameState.enemyMageState.SHIELD)],
        ['POWER', parseInt(gameState.enemyMageState.POWER)]
      ]);
      
      let p1Archer = new Map([
        ['HP', parseInt(gameState.enemyArcherState.HP)],
        ['POISON', parseInt(gameState.enemyArcherState.POISON)],
        ['WEAKEN', parseInt(gameState.enemyArcherState.WEAKEN)],
        ['FRAGILE', parseInt(gameState.enemyArcherState.FRAGILE)],
        ['PIERCE', parseInt(gameState.enemyArcherState.PIERCE)],
        ['SHIELD', parseInt(gameState.enemyArcherState.SHIELD)],
        ['POWER', parseInt(gameState.enemyArcherState.POWER)]
      ]);
      
      let p2Knight = new Map([
        ['HP', parseInt(gameState.knightState.HP)],
        ['POISON', parseInt(gameState.knightState.POISON)],
        ['WEAKEN', parseInt(gameState.knightState.WEAKEN)],
        ['FRAGILE', parseInt(gameState.knightState.FRAGILE)],
        ['PIERCE', parseInt(gameState.knightState.PIERCE)],
        ['SHIELD', parseInt(gameState.knightState.SHIELD)],
        ['POWER', parseInt(gameState.knightState.POWER)]
      ]);
      
      let p2Mage = new Map([
        ['HP', parseInt(gameState.mageState.HP)],
        ['POISON', parseInt(gameState.mageState.POISON)],
        ['WEAKEN', parseInt(gameState.mageState.WEAKEN)],
        ['FRAGILE', parseInt(gameState.mageState.FRAGILE)],
        ['PIERCE', parseInt(gameState.mageState.PIERCE)],
        ['SHIELD', parseInt(gameState.mageState.SHIELD)],
        ['POWER', parseInt(gameState.mageState.POWER)]
      ]);
      
      let p2Archer = new Map([
        ['HP', parseInt(gameState.archerState.HP)],
        ['POISON', parseInt(gameState.archerState.POISON)],
        ['WEAKEN', parseInt(gameState.archerState.WEAKEN)],
        ['FRAGILE', parseInt(gameState.archerState.FRAGILE)],
        ['PIERCE', parseInt(gameState.archerState.PIERCE)],
        ['SHIELD', parseInt(gameState.archerState.SHIELD)],
        ['POWER', parseInt(gameState.archerState.POWER)]
      ]);
      
      
      let p1output = [];
      let p2output = [];

      function calculateDamage(u1,value) {
        let k2, m2, a2, target;
        if (u1 == p1Knight || u1 == p1Archer || u1 == p1Mage){
          k2 = p2Knight;
          m2 = p2Archer;
          a2 = p2Mage;
        } else {
          k2 = p1Knight;
          m2 = p1Archer;
          a2 = p1Mage;
        }
        switch (u1) {
          case p1Knight:
            target = curRoomStatus[0].knight.target;
            break;
          case p1Mage:
            target = curRoomStatus[0].mage.target;
            break;
          case p1Archer:
            target = curRoomStatus[0].archer.target;
            break;
          case p2Knight:
            target = curRoomStatus[1].knight.target;
            break;
          case p2Mage:
            target = curRoomStatus[1].mage.target;
            break;
          case p2Archer:
            target = curRoomStatus[1].archer.target;
            break;
        }
        target = flipUnit(target);
        value = value*(1 - 0.5*u1.get('WEAKEN') + 0.5*u1.get('POWER') ); // Outgoing dmg

        switch (target) {
          case 'eKnight':
            return (value * (1 + 0.5*k2.get('FRAGILE')) - k2.get('SHIELD')*(1-k2.get('PIERCE')));
          case 'eMage':
            return (value * (1 + 0.5*m2.get('FRAGILE')) - m2.get('SHIELD')*(1-m2.get('PIERCE')));
          case 'eArcher':
            return (value * (1 + 0.5*a2.get('FRAGILE')) - a2.get('SHIELD')*(1-a2.get('PIERCE')));
        }
      }
      function doKnight(player,pKnight,poutput_x,poutput_y) {
        switch (curRoomStatus[player].knight.skill) {
          case 'skillAtk': // dmg trgt 15
            poutput_x.push(['mKnight', 'damage', curRoomStatus[player].knight.target, calculateDamage(pKnight, 15)]);
            poutput_y.push(['eKnight', 'damage', flipUnit(curRoomStatus[player].knight.target), calculateDamage(pKnight, 15)]);
            break;
        
          case 'skillDef': // shld trgt 10
            poutput_x.push(['mKnight', 'applyStatus', curRoomStatus[player].knight.target, 'shield', 10]);
            poutput_y.push(['eKnight', 'applyStatus', flipUnit(curRoomStatus[player].knight.target), 'shield', 10]);
            break;
        
          case 'skill1': // dmg trgt 30 slfdmg 20
            poutput_x.push(['mKnight', 'damage', curRoomStatus[player].knight.target, calculateDamage(pKnight, 30)]);
            poutput_y.push(['eKnight', 'damage', flipUnit(curRoomStatus[player].knight.target), calculateDamage(pKnight, 30)]);
            poutput_x.push(['mKnight', 'damage', 'mKnight', 20]);
            poutput_y.push(['eKnight', 'damage', 'eKnight', 20]);
            break;
        
          case 'skill2': // rage trgt 2 
            poutput_x.push(['mKnight', 'applyStatus', curRoomStatus[player].knight.target, 'power', 2]);
            poutput_x.push(['mKnight', 'applyStatus', curRoomStatus[player].knight.target, 'fragile', 2]);
            poutput_y.push(['eKnight', 'applyStatus', flipUnit(curRoomStatus[player].knight.target), 'power', 2]);
            poutput_y.push(['eKnight', 'applyStatus', flipUnit(curRoomStatus[player].knight.target), 'fragile', 2]);
            break;
        
          case 'skill3': // dmg trgt 100 kms
            poutput_x.push(['mKnight', 'damage', curRoomStatus[player].knight.target, calculateDamage(pKnight, 100)]);
            poutput_y.push(['eKnight', 'damage', flipUnit(curRoomStatus[player].knight.target), calculateDamage(pKnight, 100)]);
            poutput_x.push(['mKnight', 'damage', 'mKnight', 100]);
            poutput_y.push(['eKnight', 'damage', 'eKnight', 100]);
            break;
        
          default:
            break;
        }
      };
      function doMage(player,pMage,poutput_x,poutput_y) {
        switch (curRoomStatus[player].mage.skill) {
          case 'skillAtk': // dmg trgt 5
            poutput_x.push(['mMage', 'damage', curRoomStatus[player].mage.target, calculateDamage(pMage, 15)]);
            poutput_y.push(['eMage', 'damage', flipUnit(curRoomStatus[player].mage.target), calculateDamage(pMage, 15)]);
            break;
        
          case 'skillDef': // shld trgt 10
            poutput_x.push(['mMage', 'applyStatus', curRoomStatus[player].mage.target, 'shield', 10]);
            poutput_y.push(['eMage', 'applyStatus', flipUnit(curRoomStatus[player].mage.target), 'shield', 10]);
            break;
        
          case 'skill1': // psn trgt 10
            poutput_x.push(['mMage', 'applyStatus', curRoomStatus[player].mage.target, 'poison', 10]);
            poutput_y.push(['eMage', 'applyStatus', flipUnit(curRoomStatus[player].mage.target), 'poison', 10]);
            break;
        
          case 'skill2': // dmg trgt -20
            poutput_x.push(['mMage', 'damage', curRoomStatus[player].mage.target, -20]);
            poutput_y.push(['eMage', 'damage', flipUnit(curRoomStatus[player].mage.target), -20]);
            break;
        
          case 'skill3': // dmg trgt 30 weaken 2
            poutput_x.push(['mMage', 'damage', curRoomStatus[player].mage.target, calculateDamage(pMage, 30)]);
            poutput_y.push(['eMage', 'damage', flipUnit(curRoomStatus[player].mage.target), calculateDamage(pMage, 30)]);
            poutput_x.push(['mMage', 'applyStatus', curRoomStatus[player].mage.target, 'weaken', 2]);
            poutput_y.push(['eMage', 'applyStatus', flipUnit(curRoomStatus[player].mage.target), 'weakn', 2]);
            break;
        
          default:
            break;
        }
      };
      function doArcher(player,pArcher,poutput_x,poutput_y) {
        switch (curRoomStatus[player].knight.skill) {
          case 'skillAtk': //
            poutput_x.push(['mArcher', 'damage', curRoomStatus[player].archer.target, calculateDamage(pArcher, 10)]);
            poutput_y.push(['eArcher', 'damage', flipUnit(curRoomStatus[player].archer.target), calculateDamage(pArcher, 10)]);
            break;
        
          case 'skillDef': // 
            poutput_x.push(['mArcher', 'applyStatus', curRoomStatus[player].archer.target, 'shield', 5]);
            poutput_y.push(['eArcher', 'applyStatus', flipUnit(curRoomStatus[player].archer.target), 'shield', 5]);
            break;
        
          case 'skill1': // 
            poutput_x.push(['mArcher', 'damage', curRoomStatus[player].archer.target, calculateDamage(pArcher, 30)]);
            poutput_y.push(['eArcher', 'damage', flipUnit(curRoomStatus[player].archer.target), calculateDamage(pArcher, 30)]);
            poutput_x.push(['mArcher', 'applyStatus', 'mArcher', 'weaken', 2]);
            poutput_x.push(['eArcher', 'applyStatus', 'eArcher', 'weaken', 2]);
            break;
        
          case 'skill2': // 
            poutput_x.push(['mArcher', 'damage', curRoomStatus[player].archer.target, calculateDamage(pArcher, 5)]);
            poutput_y.push(['eArcher', 'damage', flipUnit(curRoomStatus[player].archer.target), calculateDamage(pArcher, 5)]);
            poutput_x.push(['mArcher', 'applyStatus', curRoomStatus[player].archer.target, 'pierce', 2]);
            poutput_y.push(['eArcher', 'applyStatus', flipUnit(curRoomStatus[player].archer.target), 'pierce', 2]);
            break;
        
          case 'skill3': // 
            poutput_x.push(['mArcher', 'damage', curRoomStatus[player].archer.target, calculateDamage(pArcher, 5)]);
            poutput_y.push(['eArcher', 'damage', flipUnit(curRoomStatus[player].archer.target), calculateDamage(pArcher, 5)]);
            poutput_x.push(['mArcher', 'applyStatus', curRoomStatus[player].archer.target, 'poison', 5]);
            poutput_y.push(['eArcher', 'applyStatus', flipUnit(curRoomStatus[player].archer.target), 'poison', 2]);
            poutput_x.push(['mArcher', 'applyStatus', curRoomStatus[player].archer.target, 'weaken', 5]);
            poutput_y.push(['eArcher', 'applyStatus', flipUnit(curRoomStatus[player].archer.target), 'weaken', 2]);
          
            break;
        
          default:
            break;
        }
      };
      doKnight(0,p2Knight,p1output,p2output);
      doKnight(1,p1Knight,p2output,p1output);
      doMage(0,p2Knight,p1output,p2output);
      doMage(1,p1Knight,p2output,p1output);
      doArcher(0,p2Knight,p1output,p2output);
      doArcher(1,p1Knight,p2output,p1output);

      io.to(roomOrder.get(room)[0]).emit('recieve actions',p1output);
      io.to(roomOrder.get(room)[1]).emit('recieve actions',p2output);
      console.log(p1output);
      console.log(p2output);
      
      curRoomStatus.length = 0; // чистим список
      curRoomOrder.length = 0;
      roomReady.set(room,[]);
      roomOrder.set(room,[]);

      console.log(roomReady);
      console.log(roomOrder);
      console.log(roomAveilability);
      
    }
  });

  socket.on('disconnect', () => {
    console.log(`"${socket.id}" leaves the server`);
    for (let [key,value] of roomAveilability) {
      if (value.includes(socket.id)) { // Когда человек выходит, мы находим в списке команту в которой он находиться
        value = value.filter(item => item !== socket.id); // Избавляемся от Нашего ID
        const remainingSocket = io.sockets.sockets.get(value[0]);
        roomAveilability.set(key,['empty']); 
        remainingSocket.leave(String(key));
        connectedClients.add(value[0])
        console.log(`"${remainingSocket.id}" was forced to leave room ${key}`)
        console.log(roomAveilability);
      }
    }
    connectedClients.delete(socket.id); 
    io.emit('update user list', Array.from(connectedClients));
  });
});
