FROM node:12.16.2-alpine3.11 
# alipine的默认时区不是中国 需要设置一下
RUN apk --update add tzdata \
    && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone \
    && apk del tzdata

RUN mkdir -p /usr/src/weChatBackend/
WORKDIR /usr/src/weChatBackend/
COPY ./package.json /usr/src/weChatBackend/package.json
COPY ./package-lock.json /usr/src/weChatBackend/package-lock.json
RUN cd /usr/src/weChatBackend/ && \
    npm i --registry=https://registry.npm.taobao.org

COPY ./server.js /usr/src/weChatBackend/server.js
COPY ./callbackPolicy.js /usr/src/weChatBackend/callbackPolicy.js
COPY ./jsonData.js /usr/src/weChatBackend/jsonData.js
COPY ./data.json /usr/src/weChatBackend/data.json

CMD ["server.js"]

EXPOSE 3000

