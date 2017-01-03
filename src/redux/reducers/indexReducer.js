
const defaultState = {
    formType: 'login',

    account: '',
    accountValidation: false,
    accountValidationErr: '',

    password: '',
    passwordValidation: false,
    passwordValidationErr: '',

    nickname: '',
    nicknameValidation: false,
    nicknameValidationErr: '',

    gender: true,

    fetching: false,
    fetched: false,

    //每個步驟的fetching與fetched狀態要分開比較好
    fetchingStep1: false,
    fetchedStep1: false,

    avatarBlob: null,
    avatar: null,

    bgImgBlob: null,
    bgImg: null,

    step:1,

    user: {
        _id: '',
        account: null,
        password: null,
        type: null,
        nickname: '',
        gender: true,
        avatar: '',
        bgImg: '',
        firstTimeLogin: true,
        friendlist: []
    },
    //jwt token
    token: '',

    error: null
}

export default function reducer(state = defaultState, action) {
    switch (action.type) {
        //表單相關
        case 'TOGGLE_FORM': {
            return {
                ...state, formType: action.payload,
                //如果使用者切換狀態，那麼除了 帳號格式錯誤 之外都應該清除
                accountValidation: state.accountValidationErr != "帳號必須為正確Email格式",
                accountValidationErr: state.accountValidationErr == "帳號必須為正確Email格式" ? '帳號必須為正確Email格式' : ''
            }
        }

        case 'ACCOUNT_VALIDATE': {
            const emailRE = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return {
                ...state, accountValidation: emailRE.test(action.payload),
                account: action.payload,
                accountValidationErr: emailRE.test(action.payload) ? '' : '帳號必須為正確Email格式'
            }
        }
        case 'PASSWORD_VALIDATE': {
            const passwordRE = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,10}$/;
            return {
                ...state, passwordValidation: passwordRE.test(action.payload),
                password: action.payload,
                passwordValidationErr: passwordRE.test(action.payload) ? '' : '密碼必須包含至少一個英文與數字，長度限制6~10字'
            }
        }

        //帳號登入
        case 'LOGIN_BY_ACCOUNT_PENDING': {
            return {...state, fetching: true}
        }
        case 'LOGIN_BY_ACCOUNT_FULFILLED': {
            let res = JSON.parse(action.payload.text);
            if (res.error == 'accountNotFound') {
                return {
                    ...state, fetching: false,
                    accountValidation: false,
                    accountValidationErr: '帳號不存在！'
                }
            } else if (res.error == 'passwordWrong') {
                return {
                    ...state, fetching: false,
                    passwordValidation: false,
                    passwordValidationErr: '密碼有誤！'
                }
            }
            return {...state, fetching: false, user: res.data.user, token: res.data.token}
        }
        case 'LOGIN_BY_ACCOUNT_REJECTED': {
            return {...state, fetching: false, error: action.payload}
        }

        //帳號註冊
        case 'SIGNUP_BY_ACCOUNT_PENDING': {
            return {...state, fetching: true}
        }
        case 'SIGNUP_BY_ACCOUNT_FULFILLED': {
            let res = JSON.parse(action.payload.text);
            if (res.error == 'accountRepeat' || res.error == 'passwordWrong') {
                return {
                    ...state, fetching: false,
                    accountValidation: false,
                    accountValidationErr: '帳號已存在！請嘗試登入或換新帳號'
                }
            }
            return {...state, fetching: false, user: res.data.user, token: res.data.token}
        }
        case 'SIGNUP_BY_ACCOUNT_REJECTED': {
            return {...state, fetching: false, error: action.payload}
        }

        //取得初始化資料
        case 'GET_INIT_DATA_PENDING': {
            return {...state, fetching: true}
        }
        case 'GET_INIT_DATA_FULFILLED': {
            let res = JSON.parse(action.payload.text);
            if (res.error == 'noData') {
                return {...state, fetching: false}
            }
            return {...state, fetching: false, user: res.data.user, token: res.data.token}
        }
        case 'GET_INIT_DATA_REJECTED': {
            return {...state, fetching: false, error:action.payload}
        }

        //驗證暱稱
        case 'NICKNAME_VALIDATE': {
            const nicknameRE = /^[\u4e00-\u9fa5_a-zA-Z0-9]{3,20}$/;
            return {
                ...state, nicknameValidation: nicknameRE.test(action.payload),
                nickname: action.payload,
                nicknameValidationErr: nicknameRE.test(action.payload) ? '' : '暱稱必須為長度3~20的包含中英文、數字的名稱'
            }
        }
        // 設定性別
        case 'SET_USER_GENDER':{
            return {...state, gender: action.payload}
        }

        // 設定使用者資料(暱稱與性別)
        case 'SET_USER_INFO_PENDING':{
            return {...state, fetchingStep1: true}
        }
        case 'SET_USER_INFO_FULFILLED':{
            let res = JSON.parse(action.payload.text);
            // 如果參數錯誤或是帳號找不到等錯誤，頁面回到首頁重新登入
            if (res.error == 'paramsInvalid' || res.error == 'accountNotFound' || res.error == 'tokenInvalid') {
                return {
                    ...state, ...defaultState
                }
            }else if(res.error == 'nicknameRepeated'){
                return {...state, fetchingStep1: false, fetchedStep1:true, nicknameValidation: false, nicknameValidationErr:'暱稱重複！'}
            }
            return {...state, fetchingStep1: false, fetchedStep1:true, step:2, user:{...state.user, nickname:state.nickname, gender:state.gender}}
        }
        case 'SET_USER_INFO_REJECTED': {
            return {...state, fetchingStep1: false, fetchedStep1:true, error: action.payload}
        }

        // 設定大頭照裁切圖
        case 'SET_USER_AVATAR':{
            return {...state, avatar:action.payload}
        }
        // 將原本的照片連結轉為Blob型別
        case 'GET_USER_AVATAR_BLOB_FULFILLED':{
            return {...state, avatar:action.payload.body}
        }

        // 照片裁切後上傳Server，Server儲存照片並更新連結
        case 'UPLOAD_USER_AVATAR_FULFILLED':{
            let res = JSON.parse(action.payload.text);
            if(res.error){
                return {...state, error:res.error}
            }
            return {...state, step:3}
        }

        // 下一步
        case 'GO_NEXT_STEP':{
            return {...state, step:action.payload}
        }

        // 設定背景圖片
        case 'SET_USER_BG_IMG':{
            return {...state, bgImg:action.payload}
        }
        // 將原本的照片連結轉為Blob型別
        case 'GET_USER_BG_IMG_BLOB_FULFILLED':{
            return {...state, bgImg:action.payload.body}
        }

        // 照片裁切後上傳Server，Server儲存照片並更新連結
        case 'UPLOAD_USER_BG_IMG_FULFILLED':{
            let res = JSON.parse(action.payload.text);
            if(res.error){
                return {...state, error:res.error}
            }
            return {...state, step:4}
        }

        // 取得使用者更新的資料
        case 'GET_USER_DATA_FULFILLED':{
            let res = JSON.parse(action.payload.text);
            if (res.error == 'noData') {
                return {...state, fetching: false, error:'error'}
            }
            return {...state, fetching: false, user: res.data.user, token: res.data.token}
        }

        //登出
        case 'LOGOUT': {
            return {...state, ...defaultState}
        }
        default:
            return state
    }
}