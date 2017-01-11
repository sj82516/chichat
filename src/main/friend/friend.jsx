import React from "react";
import {connect} from "react-redux";
import {browserHistory} from 'react-router'
import {bindActionCreators} from 'redux';

import * as mainAction from '../../redux/actions/mainActions'
require('./friend.scss');

function mapStateToProps(state) {
    return {
        user: state.index.user,
        token: state.index.token,
        main: state.main
    }
}
function mapDispatchToProps(dispatch) {
    return {
        toggleFriendshipRequestList: bindActionCreators(mainAction.toggleFriendshipRequestList, dispatch),
        toggleFriendList: bindActionCreators(mainAction.toggleFriendList, dispatch),
        reponseFriendshipS: bindActionCreators(mainAction.reponseFriendshipS, dispatch),
        enterChatRoom: bindActionCreators(mainAction.enterChatRoom, dispatch)
    }
}

@connect(mapStateToProps, mapDispatchToProps)
export class Friend extends React.Component {
    constructor() {
        super();
    }

    componentDidMount() {
    }

    render() {
        return (
            <div>
                <section className="friend-list">
                    <div className="friend-list__title">
                        <span className="friend-list__title-text">好友申請</span>
                        <span className="friend-list__title-num">{this.props.main.friendshipRequestList.length}</span>
                        <i className={`material-icons friend-list__title-show-button ${ this.props.main.friendshipRequestListShow?'friend-list__title-show-button_show':''}`}
                           onTouchStart={()=>this.props.toggleFriendshipRequestList()}
                        >keyboard_arrow_right</i>
                    </div>
                    <div
                        className={`friend-list__section ${this.props.main.friendshipRequestListShow?'friend-list__section_show':''}`}>
                        {
                            this.props.main.friendshipRequestList.map((fq)=> {

                                return <FriendshipResponse requester={fq}
                                                           user={this.props.user}
                                                           token={this.props.token}
                                                           reponseFriendshipS={this.props.reponseFriendshipS}
                                                           key={fq.account}/>
                            })
                        }
                    </div>
                </section>
                <section className="friend-list">
                    <div className="friend-list__title">
                        <span className="friend-list__title-text">好友列表</span>
                        <span className="friend-list__title-num">{this.props.main.friendList.length}</span>
                        <i className={`material-icons friend-list__title-show-button ${this.props.main.friendListShow?'friend-list__title-show-button_show':''}`}
                           onTouchStart={()=>this.props.toggleFriendList()}
                        >keyboard_arrow_right</i>
                    </div>
                    <div
                        className={`friend-list__section ${this.props.main.friendListShow?'friend-list__section_show':''}`}>
                        {
                            this.props.main.friendList.map((fq)=>

                                <FriendUnit friend={fq}
                                            key={fq.account}
                                            enterChatRoom={this.props.enterChatRoom}
                                />
                            )
                        }
                    </div>
                </section>
            </div>
        )
    }
}

// 回覆交友請求
// 需要傳入 user.id, user.avatar , user.nickname
class FriendshipResponse extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="user-block">
                <img className="user-block__avatar" src={this.props.requester.avatar}/>
                <span className="user-block__nickname">{this.props.requester.nickname}</span>
                <button className="friendship-response-btn friendship-response-btn_accept"
                        onTouchStart={()=>this.props.reponseFriendshipS(this.props.user.account,this.props.token, this.props.requester.account, true)}
                >接受
                </button>
                <button className="friendship-response-btn friendship-response-btn_reject"
                        onTouchStart={()=>this.props.reponseFriendshipS(this.props.user.account,this.props.token, this.props.requester.account, false)}
                >拒絕
                </button>
            </div>
        )
    }
}

//好友清單中的好友元件，傳入user
class FriendUnit extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="user-block" onTouchStart={()=>this.props.enterChatRoom(this.props.friend)}>
                <div className="user-block__avatar-section">
                    <img className="user-block__avatar" src={this.props.friend.avatar}/>
                    <span className="user-block__avatar_online-status"/>
                </div>
                <span className="user-block__nickname">{this.props.friend.nickname}</span>
            </div>
        )
    }
}