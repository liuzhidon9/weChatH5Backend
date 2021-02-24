let port = 3000
let corpid = 'wwce6bed30204e09a9'
let suite_id = 'wwce578594ef317fb2'
let suite_secret = 'z-6xYmmEy78-6sx2b1z-i2km1JIc5J47ZY_jIQHzmgQ'
let token = 'EEXjzVty8S49AO16N37Eb'
let encodingAesKey = 'dTaWv79OeugsZKOPQ7IiuwpZXbp2FdNye3FXJUvI14D'

var express = require('express')
var app = express()
var cors = require('cors')
const { decrypt } = require('@wecom/crypto')
const crypto = require('crypto');
var convert = require('xml-js');//解析xml===>json

//获取xml数据
const xmlparser = require('express-xml-bodyparser');
app.use(xmlparser());
app.use(express.static('./'))

app.use(cors())
function verifyUrl(req, res) {
    let query = req.query
    // console.log(query);
    const { message, id } = decrypt(encodingAesKey, query.echostr);
    res.send(message)
}
// respond with "hello world" when a GET request is made to the homepage
app.get('/verifyUrl', verifyUrl)
app.get('/orderUrl', verifyUrl)

const CallbackPolicy = require('./callbackPolicy')
let callbackPolicy = new CallbackPolicy()

app.post('/orderUrl', async function (req, res) {

    // console.log(req);
    let xml = decrypt(encodingAesKey, req.body.xml.encrypt[0]).message
    // console.log(xml);
    let xmlJson = JSON.parse(convert.xml2json(xml, { compact: true, spaces: 2 })).xml
    console.log(xmlJson);
    let callbackType = xmlJson.InfoType._cdata
    callbackPolicy[callbackType] ? await callbackPolicy[callbackType](xmlJson) : null
    res.send("success")
})

function genSign(url, ticket) {
    console.log('ticket', ticket, url);
    let noncestr = 'Wm3WZYTPz0wzccnW'
    let timestamp = parseInt(new Date().getTime() / 1000)
    let str = `jsapi_ticket=${ticket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${url}`
    const hash = crypto.createHash('sha1');
    hash.update(str)
    let signature = hash.digest('hex')
    return { corpid, signature, timestamp, noncestr }
}

app.get('/getConfigSign', async function (req, res) {
    let url = req.query.url
    let ticket = await callbackPolicy.getCorpTicket()
    let result = genSign(url, ticket)
    res.json(result)
})
app.get('/getAgentConfigSign', async function (req, res) {
    let url = req.query.url
    let ticket = await callbackPolicy.getAppTicket()

    let result = genSign(url, ticket)
    res.json(result)
})


app.listen(port, () => { console.log(`http://localhost:${port}`); })