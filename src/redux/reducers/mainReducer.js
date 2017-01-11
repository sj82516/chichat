import _ from "lodash";

const defaultState = {
    navState: 'friend',

    friendshipRequestListShow: false,
    friendshipRequestList: [],
    friendListShow: false,
    friendList: [],

    friendSearchShow: false,
    friendSearchList: [],

    chatroomShow: false,
    other: null,
    chatList: {},
    socket: null,
};

export default function reducer(state = defaultState, action) {
    switch (action.type) {
        case 'TOGGLE_FRIEND_LIST': {
            return {...state, friendListShow: !state.friendListShow}
        }
        case 'TOGGLE_FRIENDSHIP_REQUEST_LIST': {
            return {...state, friendshipRequestListShow: !state.friendshipRequestListShow}
        }
        case 'TOGGLE_FRIEND_SEARCH': {
            return {...state, friendSearchShow: !state.friendSearchShow}
        }

        case 'ENTER_CHATROOM':{
            return {...state, other: action.payload, chatroomShow:true}
        }
        case 'LEAVE_CHATROOM':{
            return {...state, other: null, chatroomShow:false}
        }

        case 'SET_SOCKET': {
            return {...state, socket: action.payload}
        }
        case 'CHAT_INIT_S': {
            state.socket.emit('chatInit', action.payload);
            return state;
        }
        case 'REQUEST_FRIENDSHIP_S': {
            state.socket.emit('requestFriendship', action.payload);
            return {
                ...state, friendSearchList: state.friendSearchList.map((fs)=> {
                    if (fs.account == action.payload.content.requestee) {
                        return {...fs, state: fs.state == 0 ? 1 : fs.state}
                    }
                    return fs;
                })
            };
        }
        case 'REQUEST_FRIENDSHIP_R': {
            let repeated = false;
            // 判斷是否有重複
            if (action.payload.data.requester.length == 1 && state.friendshipRequestList.length > 1) {
                state.friendshipRequestList.map((fq)=> {
                    if (fq.account == action.payload.data.requester.account) {
                        repeated = true
                    }
                })
            }
            return repeated ?
            {...state} : {
                ...state,
                friendshipRequestList: state.friendshipRequestList.concat(action.payload.data.requester)
            }
        }
        case 'RESPONSE_FRIENDSHIP_S': {
            state.socket.emit('responseFriendship', action.payload);
            return {
                ...state,
                friendshipRequestList: state.friendshipRequestList.filter(user => user.account !== action.payload.content.requester)
            };
        }
        case 'RESPONSE_FRIENDSHIP_R': {
            // 剔除回應的該用戶
            return {
                ...state,
                friendshipRequestList: state.friendshipRequestList.filter(user => user.account !== action.payload.data.requester)
            }
        }
        case 'FRIEND_SEARCH_S': {
            state.socket.emit('friendSearch', action.payload);
            return state;
        }
        case 'FRIEND_SEARCH_R': {
            // 搜尋好友清單中，需要分成四種狀態: 1.未申請 2.已申請 3.已加好友 4.自己
            return {
                ...state, friendSearchList: action.payload.data.result.map((fs)=> {
                    //搜到自己
                    if (fs.account == action.payload.account) {
                        return {...fs, state: 4};
                    }
                    //搜到好友
                    if (_.find(state.friendList, {account: fs.account})) {
                        return {...fs, state: 3};
                    }
                    //對方已經發出好友申請
                    console.log(_.find(state.friendshipRequestList, {account: fs.account}))
                    if (_.find(state.friendshipRequestList, {account: fs.account})) {
                        return {...fs, state: 2};
                    }
                    return {...fs, state: 0};
                })
            };
        }
        case 'FRIEND_R': {
            let chatList = {...state.chatList};
            action.payload.data.friendList.map((f)=>{
                let other = f.account;
                chatList[other] = chatList[other]?[...chatList[other]]:[];
            });
            return {...state, friendList: [...action.payload.data.friendList], chatList}
        }
        case 'FRIEDN_S': {
            state.socket.emit('friend', action.payload)
            return state;
        }
        // 取得所有的聊天訊息
        case 'CHAT_R': {
            let chatList = {...state.chatList};
            action.payload.data.chatList.forEach((element, index, array)=> {
                //  將訊息依照對方帳號分類
                let other = element.sender === action.payload.account ? element.receiver : element.sender;
                let date = new Date(element.createAt);
                let dateFormat = (date.getMonth() + 1) + '/' +date.getDate() + ' ' + date.getHours() + ':'+ date.getHours();
                chatList[other] = chatList[other]?[...chatList[other]]:[];
                chatList[other].push({...element, createAt: dateFormat});
            });
            console.log('chat list');
            return {...state, chatList }
        }
        case 'CHAT_S': {
            let chatList = {...state.chatList};
            state.socket.emit('chat', action.payload);
            let date = new Date();
            let dateFormat = (date.getMonth() + 1) + '/' +date.getDate() + ' ' + date.getHours() + ':'+ date.getHours()
            chatList[action.payload.content.receiver].push({
                ...action.payload.content,
                createAt: dateFormat,
                _id: Math.random().toString(36).substring(7)
            });
            return {...state, chatList};
        }
        default:
            return state
    }
}