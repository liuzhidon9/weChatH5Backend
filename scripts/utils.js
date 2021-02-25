const shelljs = require('shelljs');
exports.versionTag = function () {
    // eslint-disable-next-line
    let MODIFIED_COUNT = shelljs.exec(`git status --porcelain | grep -cP 'M*'`).trim()
    let COMMIT_TIME = shelljs.exec(`git show -s --format='%cd' --date=format:%y%m%d $(git rev-parse HEAD)`).trim()
    let GIT_REV = shelljs.exec("git rev-parse --short HEAD").trim()
    let GIT_STATUS = parseInt(MODIFIED_COUNT) === 0 ? "OK" : "TS"
    return `${COMMIT_TIME}_${GIT_STATUS}_${GIT_REV}`
}