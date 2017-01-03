import React from "react";
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import {browserHistory} from 'react-router'
import Cropper from 'react-crop';
import * as indexAction from '../redux/actions/indexActions';


require('./firstLogin.scss');

function mapStateToProps(state) {
    return {index: state.index}
}

@connect(mapStateToProps)
export class FirstLogin extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        if (!this.props.index.token && !this.props.index.user.account) browserHistory.push('/')
    }

    render() {
        return (
            <div className="first-login">
                <div className="first-login-header">
                    <div className="first-login-header__title">
                        輸入基本資料
                    </div>
                    <div className="first-login-header__subtitle">
                        讓大家更快認識你，也可選擇進入後修改
                    </div>
                </div>
                <div className="first-login-step-container">
                    {this.props.children}
                </div>
                <div className="first-login-footer">
                    <div className="first-login-footer-steps-mask"
                         style={{width:`calc( (${this.props.index.step} - 1) * (100vw / 3 - 40px) + 10vw + 48px )`}}>
                        <span className="first-login-footer-step-space-mask"/>
                        <span className="first-login-footer-step-space-mask"/>
                        <span className="first-login-footer-step-space-mask"/>
                        <span className="first-login-footer-step-mask">1</span>
                        <span className="first-login-footer-step-mask">2</span>
                        <span className="first-login-footer-step-mask">3</span>
                        <span className="first-login-footer-step-mask">4</span>
                    </div>
                    <div className="first-login-footer-steps">
                        <span className="first-login-footer-step-space"/>
                        <span className="first-login-footer-step-space"/>
                        <span className="first-login-footer-step-space"/>
                        <span className="first-login-footer-step">1</span>
                        <span className="first-login-footer-step">2</span>
                        <span className="first-login-footer-step">3</span>
                        <span className="first-login-footer-step">4</span>
                    </div>
                </div>
            </div>
        )
    }
}

// 設定暱稱與性別
@connect(mapStateToProps, (dispatch)=> {
    return {
        nicknameValidate: bindActionCreators(indexAction.nicknameValidate, dispatch),
        setUserInfo: bindActionCreators(indexAction.setUserInfo, dispatch),
        setUserGender: bindActionCreators(indexAction.setUserGender, dispatch),
        goNextStep: bindActionCreators(indexAction.goNextStep, dispatch)
    }
})
export class Step1 extends React.Component {
    constructor() {
        super();
    }

    componentDidMount() {
        this.props.nicknameValidate(this.props.index.user.nickname);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.index.step != 1) {
            browserHistory.push('/first-login/step' + nextProps.index.step);
        }
    }

    render() {
        return (
            <form className="first-login-step1-form">
                <div className="form-input-section">
                    <label className="form-input-section__input-label" for="nickname">獨一無二的暱稱</label>
                    <input className="form-input-section__input-field" type="text" name="nickname"
                           placeholder="輸入3~10個中英文字組成暱稱" defaultValue={this.props.index.user.nickname}
                           onChange={(evt)=>this.props.nicknameValidate(evt.target.value)}
                    />
                    <p className="form-input-section__err">{this.props.index.nicknameValidationErr}</p>
                </div>
                <div className="form-input-section">
                    <label className="form-input-section__input-label" for="gender">性別</label>
                    <label className="form-input-section__input-radio-label" for="gender">男</label>
                    <input className="form-input-section__input-radio" type="radio" name="gender" value="男"
                           onClick={()=>{this.props.setUserGender(true)}}
                           defaultChecked={this.props.index.user.gender}/>
                    <label className="form-input-section__input-radio-label" for="gender">女</label>
                    <input className="form-input-section__input-radio" type="radio" name="gender" value="女"
                           onClick={()=>{this.props.setUserGender(false)}}
                           defaultChecked={!this.props.index.user.gender}/>
                </div>
                <button
                    className={`first-login-form__next-button ${!this.props.index.nicknameValidation?'first-login-form__next-button_disabled':''}`}
                    disabled={!this.props.index.nicknameValidation}
                    onClick={(evt)=>{
                            evt.preventDefault();
                            this.props.setUserInfo(this.props.index.nickname,this.props.index.gender, this.props.index.token,  this.props.index.user.account)
                        }}
                >下一步
                </button>
            </form>
        )
    }
}

// 設定大頭照
@connect(mapStateToProps, (dispatch) => {
    return {
        setUserAvatar: bindActionCreators(indexAction.setUserAvatar, dispatch),
        getUserAvatarBlob: bindActionCreators(indexAction.getUserAvatarBlob, dispatch),
        uploadUserAvatar: bindActionCreators(indexAction.uploadUserAvatar, dispatch),
        goNextStep: bindActionCreators(indexAction.goNextStep, dispatch)
    }
})
export class Step2 extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        if (this.props.index.user.avatar) this.props.getUserAvatarBlob(this.props.index.user.avatar);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.index.step != 2) {
            browserHistory.push('/first-login/step' + nextProps.index.step);
        }
    }

    onChange(evt) {
        this.props.setUserAvatar(evt.target.files[0]);
    }

    async crop() {
        let image = await this.refs.crop.cropImage();
        console.log(this.refs.file);
        this.props.uploadUserAvatar(image, this.props.index.token, this.props.index.user.account);
        //this.props.uploadUserAvatar(image, this.props.index.token,  this.props.index.user.account);
    }

    clear() {
        this.refs.file.value = null;
        this.props.setUserAvatar(null);
    }

    imageLoaded(img) {
        if (img.naturalWidth && img.naturalHeight) {
            this.crop()
        }
    }

    render() {
        return (
            <div>
                <h1 className="form-input-section__input-label">設定大頭照</h1>
                <input className="image-crop-area__upload-button" ref='file' type='file'
                       onChange={(evt)=>this.onChange(evt)}/>
                <div className="image-crop-area">
                    {
                        this.props.index.avatar &&
                        <div className="image-crop-area_cropper">
                            <Cropper
                                ref='crop'
                                //image 只吃File和Blob型態，webURL要轉換
                                image={this.props.index.avatar}
                                width={250}
                                height={250}
                                onImageLoaded={(evt)=>this.imageLoaded}
                            />
                        </div>
                    }
                </div>

                <button className="image-crop-area__button" onClick={(evt)=>this.crop()}>Crop</button>
                <button className="image-crop-area__button" onClick={(evt)=>this.clear()}>Clear</button>

                <button className="first-login-form__next-button"
                        onClick={()=>this.props.goNextStep(3)}
                >之後設定
                </button>
            </div>
        )
    }
}

//設定背景照
@connect(mapStateToProps, (dispatch) => {
    return {
        getUserBgImgBlob: bindActionCreators(indexAction.getUserBgImgBlob, dispatch),
        setUserBgImg: bindActionCreators(indexAction.setUserBgImg, dispatch),
        uploadUserBgImg: bindActionCreators(indexAction.uploadUserBgImg, dispatch),
        goNextStep: bindActionCreators(indexAction.goNextStep, dispatch)
    }
})
export class Step3 extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        if (this.props.index.user.bgImg) this.props.getUserBgImgBlob(this.props.index.user.bgImg);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.index.step != 3) {
            browserHistory.push('/first-login/step' + nextProps.index.step);
        }
    }

    onChange(evt) {
        this.props.setUserBgImg(evt.target.files[0]);
    }

    async crop() {
        let image = await this.refs.crop.cropImage();
        console.log(this.refs.file);
        this.props.uploadUserBgImg(image, this.props.index.token, this.props.index.user.account);
    }

    clear() {
        this.refs.file.value = null;
        this.props.setUserBgImg(null);
    }

    imageLoaded(img) {
        if (img.naturalWidth && img.naturalHeight) {
            this.crop()
        }
    }


    render() {
        return (
            <div>
                <h1 className="form-input-section__input-label">設定背景圖片</h1>
                <input className="image-crop-area__upload-button" ref='file' type='file'
                       onChange={(evt)=>this.onChange(evt)}/>
                <div className="image-crop-area">
                    {
                        this.props.index.bgImg &&
                        <div className="image-crop-area_cropper">
                            <Cropper
                                ref='crop'
                                //image 只吃File和Blob型態，webURL要轉換
                                image={this.props.index.bgImg}
                                width={250}
                                height={200}
                                onImageLoaded={(evt)=>this.imageLoaded}
                            />
                        </div>
                    }
                </div>

                <button className="image-crop-area__button" onClick={(evt)=>this.crop()}>Crop</button>
                <button className="image-crop-area__button" onClick={(evt)=>this.clear()}>Clear</button>

                <button className="first-login-form__next-button"
                        onClick={()=>this.props.goNextStep(4)}
                >之後設定
                </button>
            </div>
        )
    }
}

@connect(mapStateToProps, (dispatch) => {
    return {
        getUserData: bindActionCreators(indexAction.getUserData, dispatch)
    }
})
export class Step4 extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.props.getUserData(this.props.index.user.account, this.props.index.token);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.index.step != 4) {
            browserHistory.push('/first-login/step' + nextProps.index.step);
        }
    }

    render() {
        return (
            <div>
                <h3 className="user-info__title">目前的個人資料</h3>
                <h3 className="user-info__title">如果有誤可以至“設定頁”更新</h3>
                <div className="user-info__area">
                    <h4 className="user-info__nickname">{this.props.index.user.nickname}</h4>
                    <img className="user-info__avatar" src={this.props.index.user.avatar}/>
                    <img className="user-info__bgImg" src={this.props.index.user.bgImg}/>
                </div>
                <button className="first-login-form__next-button"
                        onClick={()=>browserHistory.push('/main')}
                >進入主頁
                </button>
            </div>
        )
    }
}