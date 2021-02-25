let corpid = 'wwce6bed30204e09a9'
let suite_id = 'wwce578594ef317fb2'
let suite_secret = 'z-6xYmmEy78-6sx2b1z-i2km1JIc5J47ZY_jIQHzmgQ'
let token = 'EEXjzVty8S49AO16N37Eb'
let encodingAesKey = 'dTaWv79OeugsZKOPQ7IiuwpZXbp2FdNye3FXJUvI14D'

const { default: axios } = require('axios')
const JsonData = require('./jsonData')
let jsonData = new JsonData('./data.json')
function errCheck(handleName, errcode, errmsg) {
    if (parseInt(errcode) === 0 || !errcode) return
    console.log(handleName, errmsg, errcode);
    //    throw new Error(handleName+errmsg)
}
async function getSuiteAccessToken(suite_ticket) {
    let res = await axios.post('https://qyapi.weixin.qq.com/cgi-bin/service/get_suite_token', {
        suite_id: suite_id,
        suite_secret: suite_secret,
        suite_ticket: suite_ticket
    })
    errCheck('getSuiteAccessToken', res.data.errcode, res.data.errmsg)
    return res.data.suite_access_token
}

async function getPreAuthCode(accessToken) {
    let res = await axios.get('https://qyapi.weixin.qq.com/cgi-bin/service/get_pre_auth_code', {
        params: { suite_access_token: accessToken }
    })
    errCheck('getPreAuthCode', res.data.errcode, res.data.errmsg)
    return res.data.pre_auth_code
}

async function setUpAuth(accessToken, preAuthCode) {
    let res = await axios.post(`https://qyapi.weixin.qq.com/cgi-bin/service/set_session_info?suite_access_token=${accessToken}`, {
        pre_auth_code: preAuthCode,
        session_info: {
            appid: [],//允许进行授权的应用id，如1、2、3， 不填或者填空数组都表示允许授权套件内所有应用（仅旧的多应用套件可传此参数，新开发者可忽略）
            auth_type: 1//授权类型：0 正式授权， 1 测试授权。 默认值为0
        }
    })
    errCheck('setUpAuth', res.data.errcode, res.data.errmsg)
    return res.data
}

async function getPermanentCode(authCode, suiteAccessToken) {
    let res = await axios.post(`https://qyapi.weixin.qq.com/cgi-bin/service/get_permanent_code?suite_access_token=${suiteAccessToken}`, {
        auth_code: authCode
    })
    errCheck('getPermanentCode', res.data.errcode, res.data.errmsg)
    return res.data
}

// 获取企业凭证
async function getCorpToken(auth_corpid, permanent_code, suiteAccessToken) {
    let res = await axios.post(`https://qyapi.weixin.qq.com/cgi-bin/service/get_corp_token?suite_access_token=${suiteAccessToken}`, {
        auth_corpid: auth_corpid,
        permanent_code: permanent_code
    })
    errCheck('getCorpToken', res.data.errcode, res.data.errmsg)
    return res.data.access_token
}

async function getAccessToken(corpid, corpsecret) {
    let res = await axios.get(`https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${corpid}&corpsecret=${corpsecret}`)
    return res.data.access_token
}

// 获取企业的jsapi_ticket
async function getCorpTicket(access_token) {
    let res = await axios.get(`https://qyapi.weixin.qq.com/cgi-bin/get_jsapi_ticket?access_token=${access_token}`)

    errCheck('getCorpTicket', res.data.errcode, res.data.errmsg)
    return res.data.ticket
}
// 获取应用的jsapi_ticket
async function getAppTicket(access_token) {
    let res = await axios.get(`https://qyapi.weixin.qq.com/cgi-bin/ticket/get?access_token=${access_token}&type=agent_config`)
    errCheck('getAppTicket', res.data.errcode, res.data.errmsg)
    return res.data.ticket
}

// 获取企业授权信息
async function getAuthInfo(suite_access_token, auth_corpid, permanent_code) {
    let res = await axios.post(`https://qyapi.weixin.qq.com/cgi-bin/service/get_auth_info?suite_access_token=${suite_access_token}`, {
        "auth_corpid": auth_corpid,
        "permanent_code": permanent_code
    })
    return res.data
}

class CallbackPolicy {

    async getCorpToken() {
        let SuiteTicket = jsonData.get('suite_ticket')
        let permanentCode = jsonData.get(corpid)
        let suiteAccessToken = await getSuiteAccessToken(SuiteTicket)
        let accessToken = await getCorpToken(corpid, permanentCode, suiteAccessToken)
        // console.log('accessToken',accessToken);
        return accessToken
    }

    async getCorpTicket() {
        let accessToken = await this.getCorpToken()
        let jsApiTicket = await getCorpTicket(accessToken)
        return jsApiTicket
    }

    async getAppTicket() {
        let accessToken = await this.getCorpToken()
        let jsApiTicket = await getAppTicket(accessToken)
        return jsApiTicket
    }

    async suite_ticket(xmlJson) {
        let SuiteTicket = xmlJson.SuiteTicket._cdata
        jsonData.set('suite_ticket', SuiteTicket)
        let suiteAccessToken = await getSuiteAccessToken(SuiteTicket)
        let preAuthCode = await getPreAuthCode(suiteAccessToken)
        let setUpAuthResult = await setUpAuth(suiteAccessToken, preAuthCode)
        console.log(setUpAuthResult);
        let permanentCode = jsonData.get(corpid)
        let authInfo = await getAuthInfo(suiteAccessToken,corpid,permanentCode)
        console.log('authInfo',authInfo);
    }

    async create_auth(xmlJson) {
        console.log('create_auth', xmlJson);
        let authCode = xmlJson.AuthCode._cdata
        let SuiteTicket = jsonData.get('suite_ticket')
        let suiteAccessToken = await getSuiteAccessToken(SuiteTicket)
        let resData = await getPermanentCode(authCode, suiteAccessToken)
        jsonData.set(resData.auth_user_info.userid, resData.permanent_code)
        jsonData.set(resData.auth_corp_info.corpid, resData.permanent_code)
    }

}
module.exports = CallbackPolicy
