import request from "superagent";

const serverURL = 'http://localhost:4200'

//表單:切換登入或登出
export function toggleForm(formType) {
    return {
        type: "TOGGLE_FORM",
        payload: formType
    };
}
//表單:帳號驗證
export function accountValidate(account) {
    return {
        type: "ACCOUNT_VALIDATE",
        payload: account
    };
}
//表單:密碼驗證
export function passwordValidate(password) {
    return {
        type: "PASSWORD_VALIDATE",
        payload: password
    };
}
//帳號登入
export function loginByAccount(account, password) {
    return {
        type: "LOGIN_BY_ACCOUNT",
        payload: request.post(serverURL + '/loginByAccount')
            .withCredentials()
            .type('form')
            .send({account, password})
    };
}

//帳號註冊
export function signupByAccount(account, password) {
    return {
        type: "SIGNUP_BY_ACCOUNT",
        payload: request.post(serverURL + '/signupByAccount')
            .withCredentials()
            .type('form')
            .send({account, password})
    };
}

// 初始化資料
export function getInitData() {
    return {
        type: "GET_INIT_DATA",
        payload: request.get(serverURL + '/getInitData')
            .withCredentials()
    };
}

//表單:暱稱驗證
export function nicknameValidate(nickname) {
    return {
        type: "NICKNAME_VALIDATE",
        payload: nickname
    };
}
//設定性別
export function setUserGender(gender){
    return {
        type: "SET_USER_GENDER",
        payload: gender
    };
}
//設定使用者暱稱與性別
export function setUserInfo(nickname, gender, token, account){
    return {
        type: "SET_USER_INFO",
        payload: request.post(serverURL + '/setUserInfo/' + account)
            .withCredentials()
            .set('x-access-token', token)
            .set("Content-Type", "application/json")
            .type('form')
            .send({nickname, gender})
    };
}
// 設定使用者的大頭照
export function setUserAvatar(img){
    return {
        type: "SET_USER_AVATAR",
        payload: img
    };
}
// 原本的webURL無法直接顯示，要先轉為BLOB
export function getUserAvatarBlob(imgSrc) {
    return {
        type:'GET_USER_AVATAR_BLOB',
        payload: request.get(imgSrc)
            .responseType('blob')
    }
}
// 上傳到伺服器
export function uploadUserAvatar(avatar, token, account){
    console.log(avatar);
    return {
        type: "UPLOAD_USER_AVATAR",
        payload: request.post(serverURL + '/setUserAvatar/' + account)
            .withCredentials()
            .set('x-access-token', token)
            .attach('image',avatar)
    };
}

export function setUserBgImg(img){
    return {
        type: "SET_USER_BG_IMG",
        payload: img
    };
}

export function getUserBgImgBlob(imgSrc) {
    return {
        type:'GET_USER_BG_IMG_BLOB',
        payload: request.get(imgSrc)
            .responseType('blob')
    }
}

export function uploadUserBgImg(bgImg, token, account){
    return {
        type: "UPLOAD_USER_BG_IMG",
        payload: request.post(serverURL + '/setUserBgImg/' + account)
            .withCredentials()
            .set('x-access-token', token)
            .attach('image',bgImg)
    };
}

export function goNextStep(step){
    return{
        type: "GO_NEXT_STEP",
        payload: step
    }
}

export function getUserData(account, token){
    return {
        type: "GET_USER_DATA",
        payload: request.get(serverURL + '/getUserData/' + account)
            .withCredentials()
            .set('x-access-token', token)
    };
}

export function logout() {
    return{
        type: "LOGOUT",
        payload: ''
    }
}