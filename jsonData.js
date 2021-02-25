const fs = require('fs');
class JsonData {
    constructor(filePath) {
        this.filePath = filePath
    }
    _readFile() {
        let data = fs.readFileSync(this.filePath).toString()
        let json = data ? JSON.parse(data) : {}
        return json
    }

    _updateFile(json) {
        fs.writeFileSync(this.filePath, JSON.stringify(json))
    }
    set(key, value) {
        let json = this._readFile()
        json[key] = value
        this._updateFile(json)
    }
    get(key) {
        let json = this._readFile()
        return json[key]
    }
}


module.exports = JsonData