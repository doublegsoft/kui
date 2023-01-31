
if (typeof jim === 'undefined')
  jim = {};

jim.login = function (userId, userType, onMessage) {
  let msg = {
    operation: 'login',
    userId: userId,
    userType: userType,
    payload: {
      userId: userId,
    },
  };
  jim.userId = userId;
  jim.userType = userType;
  return new Promise(function(resolve, reject) {
    jim.client = new WebSocket("wss://jim.cq-fyy.com");
    // jim.client = new WebSocket("ws://192.168.3.207:9999");
    jim.client.onopen = () => {
      jim.client.send(JSON.stringify(msg));
      jim.client.onmessage = ev => {
        let msg = JSON.parse(ev.data);
        if (msg.op === 'login') {
          console.log('succeeded to log in');
        } else if (msg.op === 'logout') {
          console.log('succeeded to log out');
        } else {
          onMessage(msg);
        }
      };
      resolve(jim.client);
    };
    jim.client.onerror = function(err) {
      console.log(err);
      reject(err);
    };
  });
};

jim.logout = function () {
  let msg = {
    operation: 'logout',
    userId: jim.userId,
    userType: jim.userType,
    payload: {
      userId: jim.userId,
    },
  };
  jim.client.send(JSON.stringify(msg));

  delete jim.client;
  delete jim.conversationId;
  delete jim.userId;
  delete jim.userType;
};

jim.enter = function (conversationId) {
  jim.conversationId = conversationId;
};

jim.exit = function () {
  delete jim.conversationId;
};

jim.getMessages = function () {
  if (!jim.userId || !jim.userType) {
    throw '您还没有登录！'
  }
  if (!jim.conversationId) {
    throw '您当前不在任何会话中！';
  }
  let msg = {
    operation: 'getMessages',
    userId: jim.userId,
    userType: jim.userType,
    payload: {
      memberId: jim.userId,
      memberType: jim.userType,
      conversationId: jim.conversationId,
    },
  };
  jim.client.send(JSON.stringify(msg));
};

jim.sendImage = function (path) {
  if (!jim.conversationId) {
    throw '您当前不在任何会话中！';
  }
  let msg = {
    operation: 'sendMessage',
    userId: jim.userId,
    userType: jim.userType,
    payload: {
      senderId: jim.userId,
      senderType: jim.userType,
      conversationId: jim.conversationId,
      messageContent: path,
      messageType: 'IMAGE',
    },
  };
  jim.client.send(JSON.stringify(msg));
};

jim.sendText = function (text) {
  if (!jim.conversationId) {
    throw '您当前不在任何会话中！';
  }
  let msg = {
    operation: 'sendMessage',
    userId: jim.userId,
    userType: jim.userType,
    payload: {
      senderId: jim.userId,
      senderType: jim.userType,
      conversationId: jim.conversationId,
      messageContent: text,
      messageType: 'TEXT',
    },
  };
  jim.client.send(JSON.stringify(msg));
};

