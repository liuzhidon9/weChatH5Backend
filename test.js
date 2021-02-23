var convert = require('xml-js');//解析xml===>json
let xml = "<xml><SuiteId><![CDATA[wwce578594ef317fb2]]></SuiteId><AuthCode><![CDATA[IJuzi8XcAqo7mDo-q4cK5fE2Rw63H578SqLL4B9pXvKaJpAByGhTQqXIWusOvz44FHqDKp5B-w_jUQBaEF_o0qtesT6FrMVcTCkHIguezEQ]]></AuthCode><InfoType><![CDATA[create_auth]]></InfoType><TimeStamp>1614071210</TimeStamp></xml>"
let xmlJson = JSON.parse(convert.xml2json(xml, { compact: true, spaces: 2 })).xml
console.log(xmlJson);