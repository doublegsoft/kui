/**
 * 聊天客户端SDK集成。
 *
 * @param opt
 *        配置项
 *
 * @constructor
 */
function Chat(opt) {
  // 聊天服务器访问地址
  this.host = opt.host || '';

  // 消息发送者资料
  this.userId = opt.userId;
  this.userType = opt.userType;

  // 固定参数，扩展用户列表专用
  this.getConversations = opt.getConversations;

  this.onInit = opt.onInit || async function() {};
  this.onSendTextMessage = opt.onSendTextMessage;
  this.onSendImageMessage = opt.onSendImageMessage;
  this.onSendAudioMessage = opt.onSendAudioMessage;
  this.onSendVideoMessage = opt.onSendVideoMessage;
  this.onSendCustomMessage = opt.onSendCustomMessage;
  this.onRevokeMessage = opt.onRevokeMessage || function(messageId) {};
  this.onMessageReceived = opt.onMessageReceived;

  // 获取未读的消息列表
  this.onUnreadMessages = opt.onUnreadMessages || function(messages) {};
  // 已读某人发的消息
  this.onReadMessages = opt.onReadMessages || function(senderId) {};
}

Chat.MESSAGE_TYPE_TEXT = 'TEXT';
Chat.MESSAGE_TYPE_IMAGE = 'IMAGE';
Chat.MESSAGE_TYPE_AUDIO = 'AUDIO';
Chat.MESSAGE_TYPE_VIDEO = 'VIDEO';
Chat.MESSAGE_TYPE_PATIENT = 'PATIENT';
Chat.MESSAGE_TYPE_CUSTOM = 'CUSTOM';

Chat.MESSAGE_STATUS_UNREAD = '01';
Chat.MESSAGE_STATUS_READ = '02';
Chat.MESSAGE_STATUS_REVOKE = '90';

Chat.prototype.init = async function(name) {
  await this.onInit();
  let self = this;
  this.scheduleName = name;
  // schedule.start(name, () => {
  //   self.fetchUnreadMessages();
  // }, 5000);

  let timUserId = this.userId + '@' + this.userType;
  let data = await xhr.promise({
    url: this.host + '/api/v3/common/script/tim/user_signature',
    params: {
      userId: timUserId,
    }
  });

  let options = {
    SDKAppID: data.appId
  };

  this.tim = TIM.create(options);
  this.tim.setLogLevel(1);
  this.tim.registerPlugin({'tim-upload-plugin': TIMUploadPlugin});
  this.tim.login({userID: timUserId, userSig: data.signature});

  // 监听事件，如：
  this.tim.on(TIM.EVENT.SDK_READY, function(event) {

  });
  this.tim.on(TIM.EVENT.MESSAGE_RECEIVED, ev => {
    for (let i = 0; i < ev.data.length; i++) {
      let timMessage = ev.data[i];
      let messageType = Chat.MESSAGE_TYPE_TEXT;
      let messageContent = null;
      if (timMessage.type === 'TIMCustomElem') {
        messageContent = JSON.parse(timMessage.payload.data).messageContent;
        // 在此处扩展自定义消息类型
        if (messageContent.imagepath) {
          messageType = Chat.MESSAGE_TYPE_IMAGE;
        } else if (messageContent.audiopath) {
          messageType = Chat.MESSAGE_TYPE_AUDIO;
        } else if (messageContent.archiveId) {
          messageType = Chat.MESSAGE_TYPE_PATIENT;
        }
      } else {
        messageContent = timMessage.payload.text;
      }
      this.onMessageReceived({
        senderId: timMessage.conversationID.substring(3),
        messageTime: moment(ev.data[i].time * 1000).format('YYYY-MM-DD HH:mm'),
        messageType: messageType,
        messageContent: messageContent,
      });
    }
  });
};

Chat.prototype.getConversations = async function() {
  let messages = await xhr.promise({
    url: this.host + '/api/v3/common/script/stdbiz/pim/conversation_message/find',
    params: {
      status: Chat.MESSAGE_STATUS_UNREAD,
      receiverId: this.userId,
    }
  });
  let senders = {};
  for (let i = 0; i < messages.length; i++) {
    let msg = messages[i];
    let key = msg.senderId + '#' + msg.senderType;
    if (senders[key]) {
      let sender = senders[key];
      sender.createTime = msg.createTime;
      sender.messages.push(msg);
    } else {
      let sender = {messages: []};
      senders[key] = sender;
      sender.id = key;
      sender.createTime = msg.createTime;
      sender.name = msg.senderType;
      sender.senderId = msg.senderId;
      sender.senderType = msg.senderType;
      sender.messages.push(msg);
    }
  }
  let ret = [];
  for (let key in senders) ret.push(senders[key]);
  return ret;
};

Chat.prototype.fetchMessages = async function(senderId, senderType, status) {
  let self = this;
  let messages = await xhr.promise({
    url: this.host + '/api/v3/common/script/stdbiz/pim/conversation_message/find',
    params: {
      _and_condition: ' and (' +
        '  (convomsg.rcvrid = \'' + senderId  + '\' and convomsg.rcvrtyp = \'' + senderType + '\' and ' +
        '   convomsg.sndrid = \'' + this.userId  + '\' and convomsg.sndrtyp = \'' + this.userType + '\') or ' +
        '  (convomsg.rcvrid = \'' + this.userId  + '\' and convomsg.rcvrtyp = \'' + this.userType + '\' and ' +
        '   convomsg.sndrid = \'' + senderId  + '\' and convomsg.sndrtyp = \'' + senderType + '\') ' +
        ') ',
      _order_by: 'createTime asc',
    },
  });
  let timestampedMessages = [];
  let startTime = null;

  for (let i = 0; i < messages.length; i++) {
    let msg = messages[i];
    let createTime = moment(msg.createTime).format('YYYY-MM-DD HH:mm');
    if (createTime != startTime) {
      startTime = createTime;
      timestampedMessages.push({
        createTime: createTime,
        groupingMessages: [{
          direction: (msg.senderId == this.userId) ? 'outgoing' : 'incoming',
          messages: [],
        }],
      });
    }
    let latest = timestampedMessages[timestampedMessages.length - 1];
    let lastDirected = latest.groupingMessages[latest.groupingMessages.length - 1];
    let direction = '';
    if (msg.senderId == this.userId) {
      direction = 'outgoing';
    } else {
      direction = 'incoming';
    }
    if (lastDirected.direction === direction) {
      lastDirected.messages.push(msg);
    } else {
      latest.groupingMessages.push({
        direction: direction,
        messages: [msg],
      })
    }
  }
  return timestampedMessages;
};

Chat.prototype.fetchUnreadMessages = function() {
  let self = this;
  xhr.promise({
    url: this.host + '/api/v3/common/script/stdbiz/pim/conversation_message/find',
    params: {
      status: Chat.MESSAGE_STATUS_UNREAD,
      receiverId: this.userId,
      receiverType: this.userType,
    },
  }).then((data) => {
    self.onUnreadMessages(data);
  });
};

Chat.prototype.sendMessage = async function (receiverId, receiverType, messageType, messageContent, conversationId) {
  conversationId = conversationId || (this.userId + '&' + receiverId);
  if (typeof messageContent === 'string') {
    messageContent = messageContent.replace("\\", "\\\\");
  }
  return xhr.promise({
    url: this.host + '/api/v3/common/script/stdbiz/pim/conversation_message/save',
    params: {
      conversationId: conversationId,
      senderId: this.userId,
      senderType: this.userType,
      receiverId: receiverId,
      receiverType: receiverType,
      messageType: messageType,
      messageTime: 'now',
      messageContent: messageContent,
      createTime: 'now',
      status: Chat.MESSAGE_STATUS_UNREAD,
      '||stdbiz/pim/conversation/merge': {
        conversationId: conversationId,
        conversationName: conversationId,
        unreadCount: 1,
        lastConversationTime: 'now',
      }
    }
  });
};

Chat.prototype.sendTextMessage = async function(receiverId, receiverType, text, conversationId) {
  let timUserId = receiverId + '@' + receiverType;
  let self = this;
  let data = await this.sendMessage(receiverId, receiverType, Chat.MESSAGE_TYPE_TEXT, text, conversationId);
  let message = this.tim.createTextMessage({
    to: timUserId,
    conversationType: TIM.TYPES.CONV_C2C,
    payload: {
      id: data.conversationMessageId,
      text: text
    },
  });
  return this.tim.sendMessage(message);
};

Chat.prototype.sendImageMessage = async function(receiverId, receiverType, content, conversationId) {
  let timUserId = receiverId + '@' + receiverType;
  let self = this;
  let img = await xhr.promise({
    url: this.host + '/api/v3/common/image',
    params: {
      directoryKey: 'chat',
      filedata: content.data.substring(content.data.indexOf(',') + 1),
      fileext: content.ext,
    }
  });
  let data = await this.sendMessage(receiverId, receiverType, Chat.MESSAGE_TYPE_IMAGE, JSON.stringify({
    imagepath: img.filepath,
    thumbnail: img.thumbnail,
  }), conversationId);
  let message = this.tim.createCustomMessage({
    to: timUserId,
    conversationType: TIM.TYPES.CONV_C2C,
    payload: {
      data: JSON.stringify({
        messageType: Chat.MESSAGE_TYPE_IMAGE,
        messageContent: {
          id: data.conversationMessageId,
          imagepath: img.filepath,
          thumbnail: img.thumbnail,
        },
      }),
    },
  });
  return this.tim.sendMessage(message);
};

Chat.prototype.sendAudioMessage = async function(receiverId, receiverType, content, conversationId) {
  let timUserId = receiverId + '@' + receiverType;
  let self = this;
  let audio = await xhr.promise({
    url: this.host + '/api/v3/common/audio',
    params: {
      directoryKey: 'chat',
      filedata: content.data.substring(content.data.indexOf(',') + 1),
      fileext: 'ogg',
    }
  });
  let data = await this.sendMessage(receiverId, receiverType, Chat.MESSAGE_TYPE_AUDIO, JSON.stringify({
    audiopath: audio.filepath,
    duration: audio.duration,
  }), conversationId);
  let message = this.tim.createCustomMessage({
    to: timUserId,
    conversationType: TIM.TYPES.CONV_C2C,
    payload: {
      data: JSON.stringify({
        messageType: Chat.MESSAGE_TYPE_AUDIO,
        messageContent: {
          id: data.conversationMessageId,
          audiopath: audio.filepath,
          duration: audio.duration,
        },
      }),
    },
  });
  return this.tim.sendMessage(message);
};

Chat.prototype.sendPatientMessage = async function(receiverId, receiverType, content, conversationId) {
  let timUserId = receiverId + '@' + receiverType;
  let data = await this.sendMessage(receiverId, receiverType, Chat.MESSAGE_TYPE_PATIENT, JSON.stringify(content), conversationId);
  content.id = data.conversationMessageId;
  let message = this.tim.createCustomMessage({
    to: timUserId,
    conversationType: TIM.TYPES.CONV_C2C,
    payload: {
      data: JSON.stringify({
        messageType: Chat.MESSAGE_TYPE_PATIENT,
        messageContent: content,
      }),
    },
  });
  return this.tim.sendMessage(message);
};

Chat.prototype.readMessages = function(senderId) {
  let self = this;
  xhr.promise({
    url: this.host + '/api/v3/common/script/stdbiz/pim/conversation_message/update',
    params: {
      senderId: senderId,
      readTime: 'now',
      status: Chat.MESSAGE_STATUS_READ,
    },
  }).then(resp => {
    self.onReadMessages(resp);
  });
};

Chat.prototype.revokeMessage = function(messageId) {
  return xhr.promise({
    url: this.host + '/api/v3/common/script/stdbiz/pim/conversation_message/update',
    params: {
      messageId: messageId,
      status: Chat.MESSAGE_STATUS_REVOKE,
    }
  }).then(data => {
    this.onRevokeMessage(messageId);
  });
};

Chat.prototype.stop = function() {
  schedule.stop(this.scheduleName);
};

if (typeof module !== 'undefined') {
  module.exports = { Chat };
}