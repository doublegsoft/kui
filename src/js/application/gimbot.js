/*
**              o8o
**              `"'
**   .oooooooo oooo  ooo. .oo.  .oo.
**  888' `88b  `888  `888P"Y88bP"Y88b
**  888   888   888   888   888   888
**  `88bod8P'   888   888   888   888
**  `8oooooo.  o888o o888o o888o o888o
**  d"     YD
**  "Y88888P'
*/
if (typeof gim === 'undefined') {
  gim = {};
}

gim.init = (username, userId, userType, handlers) => {
  gim.sender = {
    username: username,
    userId: userId,
    userType: userType,
  };
  gim.handlers = handlers;
};

/*!
** login on im server.
*/
gim.login = async () => {
  return true;
};

/*!
** 进入某个房间。conversationId可以为null，直接填写后续的参数。
*/
gim.enter = (conversationId, receiverId, receiverType, receiverAlias) => {
  gim.conversation = {
    conversationId: conversationId,
    receiverId: receiverId,
    receiverType: receiverType,
    receiverAlias: receiverAlias,
  };
};

gim.logout = () => {

};

gim.sendText = message => {
  if (!gim.conversation) {
    throw '您还没有进入任何会话，无法发送文本，请先调用enter函数！';
  }
  let conversation = {};
  if (gim.conversation.conversationId) {
    conversation.conversationId = gim.conversation.conversationId;
  } else {
    conversation.receiverId = gim.conversation.receiverId;
    conversation.receiverType = gim.conversation.receiverType;
    conversation.receiverAlias = gim.conversation.receiverAlias;
  }
  let requestText = {
    operation: 'sendMessage',
    userId: gim.sender.userId,
    userType: gim.sender.userType,
    payload: {
      ...conversation,
      messageType: 'TEXT',
      messageContent: message,
      senderAlias: gim.sender.username,
    },
  };
  gim.websocket.send(JSON.stringify(requestText));
};

gim.getConversations = () => {
  let requestText = {
    operation: 'getConversations',
    userId: gim.sender.userId,
    userType: gim.sender.userType,
    payload: {},
  };
  gim.websocket.send(JSON.stringify(requestText));

  return {
    op: 'getConversations',
    data: [{
      conversationId: '1',
      alias: '一号',
    },{
      conversationId: '2',
      alias: '二号',
    }],
  }
};

gim.getMessages = () => {
  if (!gim.conversation) {
    throw '您还没有进入任何会话，无法获取历史会话消息，请先调用enter函数！';
  }
  let conversation = {};
  if (gim.conversation.conversationId) {
    conversation.conversationId = gim.conversation.conversationId;
  } else {
    conversation.receiverId = gim.conversation.receiverId;
    conversation.receiverType = gim.conversation.receiverType;
    conversation.receiverAlias = gim.conversation.receiverAlias;
  }
  let requestText = {
    operation: 'getMessages',
    userId: gim.sender.userId,
    userType: gim.sender.userType,
    payload: {
      ...conversation,
    },
  };
  gim.websocket.send(JSON.stringify(requestText));
};
