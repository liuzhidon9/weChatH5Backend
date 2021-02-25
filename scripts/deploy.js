const { readFileSync, writeFileSync } = require('fs');
const shelljs = require('shelljs');
const path = require('path')
const yaml = require('js-yaml');
const { versionTag } = require("./utils.js")
let env = yaml.load(readFileSync(path.resolve(__dirname, "env.yaml"), 'utf8'));
/**
 * 替换模板里的两个变量
 *
 * @param {string} input
 */
let DOCKER_IMAGE_TAG = versionTag()
function substitute(input) {
    input = input.replace(/DOCKER_IMAGE_TAG/g, DOCKER_IMAGE_TAG);
    input = input.replace(/DOCKER_REGISTRY/g, env.DOCKER_REGISTRY);
    return input;
}

console.log('------------------------------ deploy ------------------------------ ');
console.log("DOCKER_IMAGE_TAG ", DOCKER_IMAGE_TAG);

const deployment = substitute(readFileSync(`deployment/deployment.yaml`).toString(`utf-8`));
const ingress = substitute(readFileSync(`deployment/ingress.yaml`).toString(`utf-8`));
const service = substitute(readFileSync(`deployment/service.yaml`).toString(`utf-8`));

writeFileSync('pierced/deployment.yaml', deployment);
writeFileSync('pierced/ingress.yaml', ingress);
writeFileSync('pierced/service.yaml', service);

shelljs['KUBECONFIG'] = env.KUBECONFIG;

shelljs.exec('kubectl apply -f pierced/deployment.yaml');
shelljs.exec('kubectl apply -f pierced/service.yaml');
shelljs.exec('kubectl apply -f pierced/ingress.yaml');
shelljs.exec('kubectl delete pods -n three-class-backend -l app=wechat-h5-backend');

console.log();
console.log('------------------------------  done  ------------------------------ ');
console.log();
