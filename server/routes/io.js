const {RedisDB} = require('../db.connection');
const jwt = require('jsonwebtoken');
const jwtSecret = "jwtsecreate";
const FriendshipModel = require('../schema/friendship.schema');
const UserModel = require('../schema/user.schema');
const MessageModel = require('../schema/message.schema');


module.exports = function handleSocket(io) {

    io.on('connection', (socket)=> {
        //使用者剛進入主頁面，會主動發起創建 chatInit 建立連線
        //Socket IO 預設每個用戶都有預設的Room，儲存sokcet.id mapping account於Redis中
        socket.on('chatInit', (msg)=> {
            console.log('chatInit', msg);
            if (!verifyAuth(msg.account, msg.token)) {
                return socket.emit('error', {error: 'AuthError'});
            }
            socket.join(msg.account);
            //取出好友請求
            FriendshipModel.find({requestee: msg.account}).exec().then((fqs)=> {
                return UserModel.find({
                    account: {$in: fqs.map((user)=> user.requester)}
                }, {account: 1, nickname: 1, avatar: 1, bgImg: 1})
            }).then(users => {
                io.sockets.in(msg.account).emit('requestFriendship', {data: {requester: users}});
            }).catch(err=>console.error('chatInit friendship', err));

            //取出所有好友
            UserModel.find({account: msg.account}, {friendList: 1}).exec().then(users=> {
                console.log('chatInit friend', users[0].friendList);
                let friendListWithAccount = users[0].friendList.map(f=>f.friendAccount);
                return UserModel.find({account: {$in: friendListWithAccount}}, {
                    account: 1,
                    nickname: 1,
                    avatar: 1,
                    bgImg: 1
                }).exec()
            }).then(users=> {
                console.log('chatInit friend', users);
                io.sockets.in(msg.account).emit('friend', {data: {friendList: users}});
            }).catch(err=>console.error('chatInit friend', err));

            //取出所有訊息
            MessageModel.find({$or: [{sender: msg.account}, {receiver: msg.account}]}).sort({"createAt":1}).exec().then(messages=> {
                console.log('message',messages);
                io.sockets.in(msg.account).emit('chat', {data: {chatList: messages}});
            }).catch(err => console.error('chatInit msg', err));
        });

        // 由Requester發送 交友請求
        socket.on('requestFriendship', (msg)=> {
            if (!verifyAuth(msg.account, msg.token)) {
                return socket.emit('error', {error: 'AuthError'});
            }
            FriendshipModel.find({
                requester: msg.account,
                requestee: msg.content.requestee
            }).exec().then((friendship)=> {
                if (friendship.length == 0) {
                    console.log('new requestFriendship', friendship);
                    return FriendshipModel.create({requester: msg.account, requestee: msg.content.requestee})
                }
                // 找出Requester的資料，送給Requestee
            }).then((reply)=> {
                console.log('requestFriendship', reply);
                return UserModel.find({account: msg.account}).select({
                    account: 1,
                    avatar: 1,
                    nickname: 1,
                    bgImg: 1
                }).exec()
            }).then((user)=> {
                console.log('requestee', msg.content.requestee);
                if (user[0].account) {
                    io.sockets.in(msg.content.requestee).emit('requestFriendship', {data: {requester: user}});
                }
            }).catch((err)=> {
                console.log('requestFriendship Err', err);
            })
        });

        //由Requestee發送 回應交友請求
        socket.on('responseFriendship', (msg)=> {
            console.log(msg);
            if (!verifyAuth(msg.account, msg.token)) {
                return socket.emit('error', {error: 'AuthError'});
            }
            FriendshipModel.findOneAndRemove({
                requestee: msg.account,
                requester: msg.content.requester
            }).exec().then((reply)=> {
                if (msg.content.answer) {
                    return Promise.all([
                        UserModel.findOneAndUpdate({account: msg.account},
                            {$pushAll: {friendList: [{friendAccount: msg.content.requester}]}},
                            {new: true, fields: {friendList: 1}}).exec(),
                        UserModel.findOneAndUpdate({account: msg.content.requester},
                            {$pushAll: {friendList: [{friendAccount: msg.account}]}},
                            {new: true, fields: {friendList: 1}}).exec()
                    ])
                }
                //取出用戶的朋友清單後，還要先取出account，在搜尋一次
            }).then(friendLists => {
                let friendListR = friendLists[0].friendList.map((f)=>f.friendAccount);
                let friendListS = friendLists[1].friendList.map((f)=>f.friendAccount);

                console.log('responseFriendship', friendListR, friendListS);
                return Promise.all([
                    UserModel.find({account: {$in: friendListR}},
                        {account: 1, nickname: 1, avatar: 1, bgImg: 1}).exec(),
                    UserModel.find({account: {$in: friendListS}},
                        {account: 1, nickname: 1, avatar: 1, bgImg: 1}).exec()
                ])
            }).then(friendListWithInfo=> {
                console.log('responseFriendship', friendListWithInfo);
                io.sockets.in(msg.account).emit('friend', {data: {friendList: friendListWithInfo[0]}})
                io.sockets.in(msg.content.requester).emit('friend', {data: {friendList: friendListWithInfo[1]}})
            }).catch(error=> {
                console.log('responseFriendship Err', error)
            })
        });

        //搜尋好友
        socket.on('friendSearch', (msg)=> {
            if (!verifyAuth(msg.account, msg.token)) {
                return socket.emit('error', {error: 'AuthError'});
            }
            console.log(msg.content.string);
            if (msg.content.string == '') {
                return io.to(msg.account).emit('friendSearch', {data: {result: []}})
            }
            UserModel.find({$or: [{account: new RegExp('^' + msg.content.string, "i")}, {nickname: new RegExp('^' + msg.content.string, "i")}]})
                .select({account: 1, avatar: 1, nickname: 1, bgImg: 1})
                .exec().then(searchResult => {
                console.log(searchResult);
                io.sockets.in(msg.account).emit('friendSearch', {data: {result: searchResult}})
            })
        });

        //
        socket.on('friend', (msg)=> {
            console.log('friend', msg);
            if (!verifyAuth(msg.account, msg.token)) {
                return socket.emit('error', {error: 'AuthError'});
            }
            UserModel.find({account: msg.account}).exec().then((users)=> {
                console.log('friend:', users);
                if (!users[0]) {
                    socket.emit('error', {error: 'DBError'});
                }
                let friendList = users[0].friendList.map(f => f.account);
                return UserModel.find({account: {$in: friendList}}, {
                    account: 1,
                    nickname: 1,
                    avatar: 1,
                    bgImg: 1
                }).exec()
            }).then((users)=> {
                socket.emit('friend', {data: {friendList: users}});
            })
        });

        socket.on('chat', (msg)=> {
            if (!verifyAuth(msg.account, msg.token)) {
                return socket.emit('error', {error: 'AuthError'});
            }
            console.log('chat', msg);
            MessageModel.create({
                sender: msg.content.sender,
                receiver: msg.content.receiver,
                content: msg.content.content,
                createdAt: new Date()
            }).then((chat)=> {
                console.log(chat);
                io.sockets.in(chat.receiver).emit('chat', {data: {chatList: [chat]}});
            }).catch(err=>console.error('chat', err))
        })
    })
};

//檢查jwt token與帳號是否一致
//回傳Boolean
function verifyAuth(account, token) {
    let decoded = jwt.verify(token, jwtSecret);
    return account == decoded.data
}

//Redis Key的命名大眾規則
//用途：Unique Key: 資料格式
function formRedisKeyInfo(account) {
    return "socket:" + account + ":info"
}