
const JsonData = require('../jsonData')
var express = require('express')
var app = express()
var cors = require('cors')
let port = 3000
var bodyParser = require('body-parser')
const { chmod } = require('shelljs')
app.use(cors())
// parse various different custom JSON types as JSON
app.use(bodyParser.json({ type: 'application/json' }))

// parse some custom thing into a Buffer
app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }))

// parse an HTML body into a string
app.use(bodyParser.text({ type: 'text/html' }))

let jsonData = new JsonData('../data.json')

app.get('/get_permanent_code', (req, res) => {
    let permanent_code = jsonData.get('DaoZhao')
    res.json({ permanent_code: permanent_code })
})
app.post('/update_permanent_code',(req,res)=>{
    console.log(req.body);
    let body = req.body
    // jsonData.set(body.corpid,body.permanent_code)
    res.json({message:"ok"})
})

app.listen(port, () => { console.log(`http://localhost:${port}`); })