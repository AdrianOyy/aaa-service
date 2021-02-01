# 设置基础镜像,如果本地没有该镜像，会从Docker.io服务器pull镜像
FROM node:12.18.2-alpine

# 创建app目录
RUN mkdir -p /home/node-app/aaa-server

# 设置工作目录
WORKDIR /home/node-app/aaa-server

# 拷贝package.json文件到工作目录
# !!重要：package.json需要单独添加。
# Docker在构建镜像的时候，是一层一层构建的，仅当这一层有变化时，重新构建对应的层。
# 如果package.json和源代码一起添加到镜像，则每次修改源码都需要重新安装npm模块，这样木有必要。
# 所以，正确的顺序是: 添加package.json；安装npm模块；添加源代码。
# COPY package.json /home/node-app/aaa-server/package.json

# 拷贝所有源代码到工作目录
COPY . /home/node-app/aaa-server

# 安装npm依赖(使用淘宝的镜像源)
# 如果使用的境外服务器，无需使用淘宝的镜像源，即改为`RUN npm i`。
RUN npm --production --registry https://registry.npm.taobao.org install


# 暴露容器端口
EXPOSE 7001

# 启动node应用
CMD [ \
"sh", "-c", "npm start \
--dbType=${dbType} \
--dbName=${dbName} \
--dbHost=${dbHost} \
--dbPort=${dbPort} \
--dbUser=${dbUser} \
--dbPassword=${dbPassword} \
--procedureDBType=${procedureDBType} \
--procedureDBName=${procedureDBName} \
--procedureDBHost=${procedureDBHost} \
--procedureDBPort=${procedureDBPort} \
--procedureDBUser=${procedureDBUser} \
--procedureDBPassword=${procedureDBPassword} \
--activitiUrl=${activitiUrl} \
--rejectUnauthorized=${rejectUnauthorized} \
--transitionHost=${transitionHost} \
--outboundUrl=${outboundUrl} \
--adPrefix=${adPrefix} \
--authAPI=${authAPI} \
--findDisplayNameAPI=${findDisplayNameAPI} \
--userExistsManyAPI=${userExistsManyAPI} \
--findUserAPI=${findUserAPI} \
--findUsersAPI=${findUsersAPI} \
--findGroupsAPI=${findGroupsAPI} \
--getGusrsForGourpAPI=${getGusrsForGourpAPI} \
--findUsersByCnAPI=${findUsersByCnAPI} \
--cpsPrefix=${cpsPrefix} \
--alladhocAPI=${alladhocAPI} \
--CUIDPrefix=${CUIDPrefix} \
--CUIDAPIKey=${CUIDAPIKey} \
--getPublicKeyAPI=${getPublicKeyAPI} \
--procedureFn=${procedureFn} \
--jwtExpiresIn=${jwtExpiresIn} \
--jwtSecret=${jwtSecret} \
--jwtIss=${jwtIss} \
--loadFlag=${loadFlag} \
--loadCron=${loadCron} \
--t1=${t1} \
--t2=${t2} \
--t6=${t3} \
--frontEndUrl=${frontEndUrl} \
--imapFlag=${imapFlag} \
--imapFetchIndex=${imapFetchIndex} \
--imapNamespace=${imapNamespace} \
--imapInterval=${imapInterval} \
--imapUser=${imapUser} \
--imapPass=${imapPass} \
--imapHost=${imapHost} \
--imapPort=${imapPort} \
--mailHost=${mailHost} \
--mailPort=${mailPort} \
--mailUser=${mailUser} \
--apiKey=${apiKey} \
--mailPass=${mailPass}" \
]
