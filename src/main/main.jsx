import React from "react";
import {connect} from "react-redux";
import {browserHistory, Link} from 'react-router'
import {bindActionCreators} from 'redux';

import * as mainAction from '../redux/actions/mainActions'

import io from 'socket.io-client';

require('./main.scss');

function mapStateToProps(state) {
    return {
        user: state.index.user,
        token: state.index.token,
        main: state.main
    }
}

function mapDispatchToProps(dispatch) {
    return {
        togglefriendSearch: bindActionCreators(mainAction.togglefriendSearch, dispatch),
        leaveChatRoom: bindActionCreators(mainAction.leaveChatRoom, dispatch),

        setSocket: bindActionCreators(mainAction.setSocket, dispatch),
        chatInitS: bindActionCreators(mainAction.chatInitS, dispatch),
        requestFriendshipR: bindActionCreators(mainAction.requestFriendshipR, dispatch),
        reponseFriendshipR: bindActionCreators(mainAction.reponseFriendshipR, dispatch),
        //發送搜尋與接收搜尋結果
        friendSearchS: bindActionCreators(mainAction.friendSearchS, dispatch),
        friendSearchR: bindActionCreators(mainAction.friendSearchR, dispatch),
        //發出交友請求
        requestFriendshipS: bindActionCreators(mainAction.requestFriendshipS, dispatch),
        // 索取目前所有好友
        friendR: bindActionCreators(mainAction.friendR, dispatch),
        friendS: bindActionCreators(mainAction.friendS, dispatch),
        chatR: bindActionCreators(mainAction.chatR, dispatch),
        chatS: bindActionCreators(mainAction.chatS, dispatch)
    }
}
@connect(mapStateToProps, mapDispatchToProps)
export class Main extends React.Component {
    constructor(props) {
        super(props);
    }

    // 在main中聆聽所有Socket事件，並直接dispatch
    // 並免再子頁面切換重複觸發
    componentWillMount() {
        if (this.props.user.account && this.props.token) {
            let socket = io(`http://localhost:4200`);
            this.props.setSocket(socket);

            this.props.chatInitS(this.props.user.account, this.props.token);

            socket.on('requestFriendship', (msg)=> {
                this.props.requestFriendshipR(msg);
            });
            socket.on('responseFriendship', (msg)=> {
                this.props.reponseFriendshipR(msg);
            });
            socket.on('friend', (msg)=> {
                this.props.friendR(msg);
            });
            socket.on('chat', (msg)=> {
                this.props.chatR(msg);
            });
            socket.on('error', (msg)=> {
                console.error('what happne', msg.error);
            })
        } else {
            browserHistory.push('/');
        }
    }

    componentDidMount() {
    }

    render() {
        return (
            <div style={{position:'relative'}}>
                <FriendSearch main={this.props.main} user={this.props.user} token={this.props.token}
                              friendSearchS={this.props.friendSearchS} friendSearchR={this.props.friendSearchR}
                              requestFriendshipS={this.props.requestFriendshipS}
                />
                <Chatroom main={this.props.main} user={this.props.user} token={this.props.token}
                          chatS={this.props.chatS}
                />
                <div className="main-title-bar">
                    <p className="main-title-bar__title">{
                        this.props.location.pathname === '/main/friend' ? '朋友'
                            : this.props.location.pathname === '/main/chat' ? '聊天' : '設定'
                    }
                        <button className="main-title-bar__search"
                                onTouchStart={()=>
                                    this.props.main.chatroomShow?this.props.leaveChatRoom():
                                    this.props.location.pathname === '/main/friend'?this.props.togglefriendSearch():'設定'
                                }
                        >
                            {
                                this.props.main.chatroomShow ?
                                    (<div className="main-title-bar__search">
                                        <span className="main-title-bar__search-title"> 離開聊天室</span>
                                    </div>) :
                                    this.props.location.pathname === '/main/friend' ?
                                        (<div className="main-title-bar__search">
                                            <i className="material-icons">search</i>
                                            <span className="main-title-bar__search-title"> 搜尋好友 </span>
                                        </div>)
                                        : this.props.location.pathname === '/main/chat' ?
                                        (<div className="main-title-bar__search">
                                            <span className="main-title-bar__search-title"> 點擊好友進入聊天</span>
                                        </div>)
                                        : '設定'
                            }
                        </button>
                    </p>
                </div>
                <nav className="main-nav">
                    <Link to="/main/friend" className="main-nav__item" activeClassName="main-nav__item_active">
                        <i class="material-icons">perm_contact_calendar</i>
                        <p>朋友</p>
                    </Link>
                    <Link to="/main/chat" className="main-nav__item" activeClassName="main-nav__item_active">
                        <i class="material-icons">chat</i>
                        <p>聊天</p>
                    </Link>
                    <Link to="/main/setting" className="main-nav__item" activeClassName="main-nav__item_active">
                        <i class="material-icons">settings</i>
                        <p>設定</p>
                    </Link>
                </nav>
                <div className="main-container">
                    {this.props.children}
                </div>
            </div>
        )
    }
}

// 搜尋帳號或暱稱
class FriendSearch extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    componentWillUpdate(nextProps, nextState) {
        // 如果原socket不存在就需要更新
        if (nextProps.main.socket && !this.props.main.socket) {
            nextProps.main.socket.on('friendSearch', (msg)=> {
                console.log('friendSearch');
                this.props.friendSearchR(this.props.user.account, this.props.user.friendlist, msg);
            })
        }
    }

    render() {
        return (
            <div className={`search-user-block ${this.props.main.friendSearchShow?'search-user-block_show':''}`}>
                <div className="search-user-bar">
                    <input className="search-user-input" type="text" placeholder="輸入帳號或暱稱"
                           onChange={(evt)=>this.props.friendSearchS(this.props.user.account, this.props.token, evt.target.value)}
                    />
                </div>
                <div className="search-user-results">
                    {
                        this.props.main.friendSearchList.map((fs)=> {
                            return <FriendshipRequest requestee={fs} key={fs.account}
                                                      account={this.props.user.account} token={this.props.token}
                                                      requestFriendshipS={this.props.requestFriendshipS}
                            />
                        })
                    }
                </div>
            </div>
        )
    }
}

// 發出交友請求
class FriendshipRequest extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="user-block">
                <img className="user-block__avatar" src={this.props.requestee.avatar}/>
                <span className="user-block__nickname">{this.props.requestee.nickname}</span>
                <button className={`friendship-response-btn ${
                    this.props.requestee.state == 4 ? 'friendship-response-btn_self':
                    this.props.requestee.state==3? 'friendship-response-btn_friend':
                    this.props.requestee.state==2?'friendship-response-btn_requested':
                    this.props.requestee.state==1?'friendship-response-btn_requested':'friendship-response-btn_available'
                }`}
                        onTouchStart={()=>this.props.requestee.state==0?this.props.requestFriendshipS(this.props.account, this.props.token, this.props.requestee.account):''}
                        disabled={!(this.props.requestee.state==0)}
                >{
                    this.props.requestee.state == 4 ? '這是你自己' :
                        this.props.requestee.state == 3 ? '已加好友' :
                            this.props.requestee.state == 2 ? '對方已邀請' :
                                this.props.requestee.state == 1 ? '已申請' : '加好友'
                }
                </button>
            </div>
        )
    }
}

// 聊天室
class Chatroom extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    render() {
        return (
            <div className={`chatroom-block ${this.props.main.chatroomShow?'chatroom-block_show':''}`}>
                <p className="chatList-room__title">
                    {this.props.main.other ? this.props.main.other.nickname : ''}
                </p>
                <div className="chatList-room">
                    {
                        this.props.main.other ? this.props.main.chatList[this.props.main.other.account].map((msg)=> {
                            return (
                                <div key={msg._id} className="message-block"
                                    style={{justifyContent: msg.sender === this.props.user.account?'flex-end':'flex-start'}}
                                >
                                    {
                                        msg.sender === this.props.user.account ? '':
                                            (<div className="user-block__avatar-section message-block__avatar-section">
                                                <img className="user-block__avatar" src={this.props.main.other.avatar}/>
                                                <span className="user-block__avatar_online-status"/>
                                            </div>)
                                    }
                                    <div className="message-content"
                                         style={{alignItems: msg.sender === this.props.user.account?'flex-end':'flex-start'}}
                                    >
                                        <p className="message-content__text">{msg.content}</p>
                                        <p className="message-content__time">{msg.createAt}</p>
                                    </div>
                                </div>
                            )
                        }) : (<div></div>)
                    }
                </div>
                <div className="chatroom-send-message">
                    <input className="chatroom-send-message__input" placeholder="說些什麼呢"
                           ref={(input) => { this.chatContent = input; }}/>
                    <button className="chatroom-send-message__button" onTouchStart={()=>{
                            let input = this.chatContent.value;
                            this.chatContent.value = '';
                            return this.props.chatS(this.props.user.account, this.props.token, this.props.main.other.account, input)
                        }
                    }>發送
                    </button>
                </div>
            </div>
        )
    }
}