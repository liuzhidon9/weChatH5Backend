let corpid = 'wwce6bed30204e09a9'
let suite_id = 'wwce578594ef317fb2'
let suite_secret = 'z-6xYmmEy78-6sx2b1z-i2km1JIc5J47ZY_jIQHzmgQ'
let token = 'EEXjzVty8S49AO16N37Eb'
let encodingAesKey = 'dTaWv79OeugsZKOPQ7IiuwpZXbp2FdNye3FXJUvI14D'

const { default: axios } = require('axios')
const fs = require('fs');
let JsonData = {
    filePath: './data.json',
    _readFile() {
        let data = fs.readFileSync(this.filePath).toString()
        let json = data ? JSON.parse(data) : {}
        return json
    }
    ,
    _updateFile(json) {
        fs.writeFileSync(this.filePath, JSON.stringify(json))
    },
    set(key, value) {
        let json = this._readFile()
        json[key] = value
        this._updateFile(json)
    },
    get(key) {
        let json = this._readFile()
        return json[key]
    }
}
async function getSuiteAccessToken(suite_ticket) {
    let res = await axios.post('https://qyapi.weixin.qq.com/cgi-bin/service/get_suite_token', {
        suite_id: suite_id,
        suite_secret: suite_secret,
        suite_ticket: suite_ticket
    })
    return res.data.suite_access_token
}

async function getPreAuthCode(accessToken) {
    let res = await axios.get('https://qyapi.weixin.qq.com/cgi-bin/service/get_pre_auth_code', {
        params: { suite_access_token: accessToken }
    })
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
    return res.data
}

async function getPermanentCode(authCode, suiteAccessToken) {
    let res = await axios.post(`https://qyapi.weixin.qq.com/cgi-bin/service/get_permanent_code?suite_access_token=${suiteAccessToken}`, {
        auth_code: authCode
    })
    return res.data
}

// 获取企业凭证
async function getCorpToken(auth_corpid, permanent_code, suiteAccessToken) {
    let res = await axios.post(`https://qyapi.weixin.qq.com/cgi-bin/service/get_corp_token?suite_access_token=${suiteAccessToken}`, {
        auth_corpid: auth_corpid,
        permanent_code: permanent_code
    })
    return res.data.access_token
}

async function getAccessToken(corpid, corpsecret) {
    let res = await axios.get(`https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${corpid}&corpsecret=${corpsecret}`)
    return res.data.access_token
}

// 获取企业的jsapi_ticket
async function getCorpTicket(access_token) {
    let res = await axios.get(`https://qyapi.weixin.qq.com/cgi-bin/get_jsapi_ticket?access_token=${access_token}`)
    return res.data.ticket
}
// 获取应用的jsapi_ticket
async function getAppTicket(access_token) {
    let res = await axios.get(`https://qyapi.weixin.qq.com/cgi-bin/ticket/get?access_token=${access_token}&type=agent_config`)
    return res.data.ticket
}

class CallbackPolicy {

    async getCorpToken() {
        let SuiteTicket = JsonData.get('suite_ticket')
        let permanentCode = JsonData.get(corpid)
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
        JsonData.set('suite_ticket', SuiteTicket)
        let suiteAccessToken = await getSuiteAccessToken(SuiteTicket)
        let preAuthCode = await getPreAuthCode(suiteAccessToken)
        let setUpAuthResult = await setUpAuth(suiteAccessToken, preAuthCode)
        console.log(setUpAuthResult);
    }

    async create_auth(xmlJson) {
        console.log('create_auth', xmlJson);
        let authCode = xmlJson.AuthCode._cdata
        let SuiteTicket = JsonData.get('suite_ticket')
        let suiteAccessToken = await getSuiteAccessToken(SuiteTicket)
        let resData = await getPermanentCode(authCode, suiteAccessToken)
        JsonData.set(resData.auth_user_info.userid, resData.permanent_code)
        JsonData.set(resData.auth_corp_info.corpid, resData.permanent_code)
    }

}
module.exports = CallbackPolicy
