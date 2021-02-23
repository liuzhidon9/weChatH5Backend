let port = 3000
let corpid = 'wwce6bed30204e09a9'
let suite_id = 'wwce578594ef317fb2'
let suite_secret = 'z-6xYmmEy78-6sx2b1z-i2km1JIc5J47ZY_jIQHzmgQ'
let token = 'EEXjzVty8S49AO16N37Eb'
let encodingAesKey = 'dTaWv79OeugsZKOPQ7IiuwpZXbp2FdNye3FXJUvI14D'

var express = require('express')
var app = express()
const { decrypt } = require('@wecom/crypto')
const { default: axios } = require('axios')
var convert = require('xml-js');//解析xml===>json

//获取xml数据
const xmlparser = require('express-xml-bodyparser');
app.use(xmlparser());
app.use(express.static('./'))
// respond with "hello world" when a GET request is made to the homepage
app.get('/verifyUrl', function (req, res) {
    // console.log(req);
    let query = req.query
    // console.log(query);
    const { message, id } = decrypt(encodingAesKey, query.echostr);
    res.send(message)
})

app.get('/orderUrl', function (req, res) {
    let query = req.query
    // console.log(query);
    const { message, id } = decrypt(encodingAesKey, query.echostr);
    res.send(message)
})

async function getAccessToken(suite_ticket) {
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
app.post('/orderUrl', async function (req, res) {

    // console.log(req);
    let xml = decrypt(encodingAesKey, req.body.xml.encrypt[0]).message
    // console.log(xml);
    let xmlJson = JSON.parse(convert.xml2json(xml, { compact: true, spaces: 2 })).xml
    // console.log(xmlJson);
    let callbackType = xmlJson.InfoType._cdata
    if (callbackType === 'suite_ticket') {
        let accessToken = await getAccessToken(xmlJson.SuiteTicket._cdata)
        let preAuthCode = await getPreAuthCode(accessToken)
        let setUpAuthResult = await setUpAuth(accessToken, preAuthCode)
        console.log(setUpAuthResult);
    }

    res.send("success")
})
app.listen(port, () => { console.log(`http://localhost:${port}`); })