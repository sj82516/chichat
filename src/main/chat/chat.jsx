import React from "react";
import {connect} from "react-redux";
import {browserHistory} from 'react-router'
import {bindActionCreators} from 'redux';

import * as mainAction from '../../redux/actions/mainActions'
require('./chat.scss');

function mapStateToProps(state) {
    return {
        user: state.index.user,
        token: state.index.token,
        main: state.main
    }
}

function mapDispatchToProps(dispatch) {
    return {
        enterChatRoom: bindActionCreators(mainAction.enterChatRoom, dispatch)
    }
}
@connect(mapStateToProps, mapDispatchToProps)
export class Chat extends React.Component {
    constructor() {
        super();
    }

    componentDidMount() {
    }

    render() {
        return (
            <div>
                {
                    this.props.main.friendList.map((fq)=>

                        <ChatUnit friend={fq}
                                    key={fq.account}
                                  lastMsg={this.props.main.chatList[fq.account][this.props.main.chatList[fq.account].length-1]}
                                    enterChatRoom={this.props.enterChatRoom}
                        />
                    )
                }
            </div>
        )
    }
}

class ChatUnit extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="user-block" style={{position:'relative'}} onTouchStart={()=>this.props.enterChatRoom(this.props.friend)}>
                <div className="user-block__avatar-section">
                    <img className="user-block__avatar" src={this.props.friend.avatar}/>
                    <span className="user-block__avatar_online-status"/>
                </div>
                <div className="chat-block__info">
                    <p className="chat-block__nickname">{this.props.friend.nickname}</p>
                    <p className="chat-block__last-msg-content">{this.props.lastMsg.content}</p>
                </div>
                <p className="chat-block__last-msg-time">{this.props.lastMsg.createAt}</p>
            </div>
        )
    }
}