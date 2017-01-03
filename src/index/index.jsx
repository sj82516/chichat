//@flow

import React from "react";
import {connect} from "react-redux";
import { browserHistory } from 'react-router'
import {bindActionCreators} from 'redux';
import localforage from "localforage";

import * as indexAction from '../redux/actions/indexActions';

require('./index.scss');

function mapStateToProps(state) {
    return {index: state.index}
}

function mapDispatchToProps(dispatch) {
    return {
        toggleForm: bindActionCreators(indexAction.toggleForm, dispatch),
        accountValidate: bindActionCreators(indexAction.accountValidate, dispatch),
        passwordValidate: bindActionCreators(indexAction.passwordValidate, dispatch),
        loginByAccount: bindActionCreators(indexAction.loginByAccount, dispatch),
        signupByAccount: bindActionCreators(indexAction.signupByAccount, dispatch),
        getInitData: bindActionCreators(indexAction.getInitData, dispatch)
    }
}

@connect(mapStateToProps, mapDispatchToProps)
export class Index extends React.Component {
    constructor() {
        super();
    }

    // 首先檢查Server端是否有新資料,如經過oauth2重新導向後
    // 如果有使用者資料會先執行 componentWillReceiveProps()中的步驟
    componentWillMount() {
        this.props.getInitData();
        localforage.getItem('user').then((value)=> {
            if (value.account && value.password) {
                this.props.loginByAccount(value.account, value.password);
            }
        }).catch((err)=> {
            console.log(err);
        });
    }

    // 如果有新的使用者資料，儲存帳號資料於在地資料庫中
    componentWillReceiveProps(nextProps) {
        if (nextProps.index.user && nextProps.index.user.account) {
            localforage.setItem('user', nextProps.index.user).then((value)=> {
                console.log('new user info:', value);
                let path = this.props.index.user.firstTimeLogin?'/first-login':'/main';
                browserHistory.push(path);
            }).catch((err)=> {
                console.log(err);
            });
        }
    }

    // OAUTH2頁面重導
    redirectToOauth(type) {
        window.location.href = "http://localhost:4200/auth/" + type;
    }

    render() {
        return (
            <section className="index">
                <div className="index-wrapper">
                    <figure className="index__logo">
                        <img className="index__logo-image" src="/assets/img/logo.png" alt="chichat_logo"/>
                    </figure>
                    <form className="form">
                        <div className="form-wrapper">
                            <p className="form-type">
                                <span
                                    className={`form-type__btn ${this.props.index.formType=='login'?'form-type__btn_clicked':'form-type__btn_unclicked'}`}
                                    onClick={()=>this.props.toggleForm('login')}>登入</span> /
                                <span
                                    className={`form-type__btn ${this.props.index.formType=='signup'?'form-type__btn_clicked':'form-type__btn_unclicked'}`}
                                    onClick={()=>this.props.toggleForm('signup')}>註冊</span>
                            </p>
                            <div className="form-input-section">
                                <label className="form-input-section__input-label" for="account">帳號</label>
                                <input
                                    id="account" className="form-input-section__input-field" type="email"
                                    placeholder="輸入常用信箱當作帳號"
                                    onKeyUp={(evt)=>this.props.accountValidate(evt.target.value)}
                                />
                                <p className="form-input-section__err">{this.props.index.accountValidationErr}</p>
                            </div>
                            <div className="form-input-section">
                                <label className="form-input-section__input-label" for="password">密碼</label>
                                <input
                                    id="password" className="form-input-section__input-field" type="password"
                                    onKeyUp={(evt)=>this.props.passwordValidate(evt.target.value)}
                                    placeholder="6~12個英文與數字混合字串"/>
                                <p className="form-input-section__err">{this.props.index.passwordValidationErr}</p>
                            </div>
                            <p className="form-seperate-line">或是以社群帳號登入</p>
                            <div className="social-media-buttons">
                                <button className="social-media-button"
                                        onClick={(evt)=>{
                                            evt.preventDefault();
                                            this.redirectToOauth('facebook');
                                        }}>Fb
                                </button>
                                <button className="social-media-button"
                                        onClick={(evt)=>{
                                            evt.preventDefault();
                                            this.redirectToOauth('google');
                                        }}>G+
                                </button>
                                <button className="social-media-button"
                                        onClick={(evt)=>{
                                            evt.preventDefault();
                                            this.redirectToOauth('github');
                                        }}>GH
                                </button>
                            </div>
                            <button
                                className={`form-submit-button
                                    ${this.props.index.accountValidation&&this.props.index.passwordValidation?'form-submit-button':'form-submit-button_disable'}`}
                                onClick={(evt)=>{
                                    evt.preventDefault();
                                    return this.props.index.formType=='login'?
                                        this.props.loginByAccount(this.props.index.account, this.props.index.password):
                                        this.props.signupByAccount(this.props.index.account, this.props.index.password)
                                }}
                                disabled={!(this.props.index.accountValidation&&this.props.index.passwordValidation)}
                                type="submit">{this.props.index.formType == 'login' ? '登入' : '註冊'}</button>
                        </div>
                    </form>
                </div>
            </section>
        )
    }
}