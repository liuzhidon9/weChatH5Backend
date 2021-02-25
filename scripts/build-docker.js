const shelljs = require('shelljs');
const path = require('path')
const yaml = require('js-yaml');
const { readFileSync } = require('fs')
const { versionTag } = require("./utils.js")

let env = yaml.load(readFileSync(path.resolve(__dirname, "env.yaml"), 'utf8'));
console.log(env);
let DOCKER_IMAGE_TAG = versionTag()
const docker_tag = `${env.DOCKER_REGISTRY}/donviewclass-wechat-h5-backend:${DOCKER_IMAGE_TAG}`;

let ret = shelljs.exec(`docker build . -t ${docker_tag}`);
if (ret.code !== 0) {
    console.log(`error: ${ret.stderr}`);
}

ret = shelljs.exec(`docker push ${docker_tag}`);
if (ret.code !== 0) {
    console.log(`error: ${ret.stderr}`);
}

