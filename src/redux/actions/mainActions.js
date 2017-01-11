export function toggleFriendshipRequestList(){
    return({
        type: 'TOGGLE_FRIENDSHIP_REQUEST_LIST',
        payload: ''
    })
}

export function toggleFriendList(){
    return({
        type: 'TOGGLE_FRIEND_LIST',
        payload: ''
    })
}

export function togglefriendSearch(){
    return({
        type: 'TOGGLE_FRIEND_SEARCH',
        payload: ''
    })
}

// socket專用

// Requester(自)送出交友請求
export function setSocket(socket) {
    return({
        type:'SET_SOCKET',
        payload: socket
    })
}
export function chatInitS(account, token){
    return({
        type:'CHAT_INIT_S',
        payload:{
            account,
            token
        }
    })
}

export function requestFriendshipS(account, token, requestee){
    return({
        type:'REQUEST_FRIENDSHIP_S',
        payload:{
            account,
            token,
            content:{
                requestee: requestee,
                requester: account
            }
        }
    })
}

// 伺服器送來Requester的交友請求
// msg: requester(account,nickname, avatar, bgImg)
export function requestFriendshipR(msg){
    return({
        type:'REQUEST_FRIENDSHIP_R',
        payload: msg
    })
}

// Requestee(自)回覆是否答應交友請求
export function reponseFriendshipS(account, token, requester, answer){
    return({
        type:'RESPONSE_FRIENDSHIP_S',
        payload: {
            account,
            token,
            content:{
                requester: requester,
                answer
            }
        }
    })
}
// Requester(自) 收到Requestee是否答應交友的回覆
// msg: requestee, answer
export function reponseFriendshipR(msg){
    return({
        type:'RESPONSE_FRIENDSHIP_R',
        payload: msg
    })
}

// 搜尋好友
export function friendSearchS(account, token, string){
    return({
        type:'FRIEND_SEARCH_S',
        payload: {
            account,
            token,
            content:{
                string
            }
        }
    })
}

// 搜尋好友結果
// 帳號與好友清單為使用者本身，用於篩選結果
export function friendSearchR(account, friendlist, data){
    return({
        type:'FRIEND_SEARCH_R',
        payload: {...data, account, friendlist}
    })
}

// 索取已存在好友
export function friendR(msg){
    return({
        type:'FRIEND_R',
        payload: msg
    })
}

export function friendS(account, token){
    return({
        type:'FRIEND_S',
        payload: {account, token}
    })
}

// 索取對話
export function chatR(msg){
    return (dispatch, getState) => {
        let {account} = getState().index.user;
        dispatch({
            type:'CHAT_R',
            payload: {
                ...msg,
                account
            }
        })
    }
}

export function chatS(account, token, other, content){
    return({
        type:'CHAT_S',
        payload: {account, token, content:{
            sender: account,
            receiver: other,
            content
        }}
    })
}

export function enterChatRoom(other){
    return({
        type:'ENTER_CHATROOM',
        payload: other
    })
}

export function leaveChatRoom(){
    return({
        type:'LEAVE_CHATROOM',
        payload: ''
    })
}