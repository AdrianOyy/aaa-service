### Build

````shell
docker build -t aaa-service[:tag] .
````



### Run

````cmd
docker run -dit \
--name aaa-service \
--restart always \
-p 3003:7001 \
-e dbType=mysql \
-e dbName=aaa_service \
-e dbHost=10.231.131.123 \
-e dbPort=3306 \
-e dbUser=admin \
-e dbPassword=APJ@com123 \
-e procedureDBName=nsr_gis_app \
-e activitiUrl=10.231.131.123:8888 \
-e transitionHost=10.231.131.123:3000 \
-e outboundUrl=10.231.131.123:8000 \
-e adPrefix=/adService \
-e cpsPrefix=/CPS \
-e CUIDPrefix=/CUID \
-e CUIDAPIKey=244575dc-0731-4340-a3a2-29f1d9f7104d \
-e procedureFn=sp_getLocationList \
-e jwtExpiresIn=10m \
-e jwtSecret=1234567abc \
-e jwtIss=SENSEPLATFORM \
-e imapUser=gitlab@apjcorp.com \
-e imapPass=apj.com666 \
-e imapHost=imap.mxhichina.com \
-e imapPort=993 \
-e mailHost=smtp.mxhichina.com \
-e mailPort=25 \
-e mailUser=gitlab@apjcorp.com \
-e mailPass=apj.com666 \
aaa-service
````


```shell
# cps service host
https://cps-dev-api.cldpaast71.serverdev.hadev.org.hk
```



### 参数说明

| 参数名          | 描述                                                      |
| --------------- | --------------------------------------------------------- |
| dbType          | 数据库类型                                                |
| dbName          | 数据库库名                                                |
| dbHost          | 数据库地址                                                |
| dbPort          | 数据库端口                                                |
| dbUser          | 数据库用户                                                |
| dbPassword      | 数据库密码                                                |
| procedureDBName | 存储过程数据库库名                                        |
| activitiUrl     | workflow service 地址                                     |
| transitionHost  | transition service 地址                                   |
| outboundUrl     | outbound 地址                                             |
| adPrefix        | ad service API 前缀                                       |
| cpsPrefix       | cps service API 前缀                                      |
| CUIDPrefix      | CUID service API 前缀                                     |
| CUIDAPIKey      | CUID service API key                                      |
| procedureFn     | 存储过程函数名                                            |
| jwtExpiresIn    | token 过期时间 e.g. : 10m   # 10分钟                      |
| jwtSecret       | JSON web token 加密参数（需要与 workflow service 的一致） |
| jwtIss          | token 签发机构签名                                        |
| imapUser        |                                                           |
| imapPass        |                                                           |
| imapHost        |                                                           |
| imapPort        |                                                           |
| mailHost        |                                                           |
| mailPort        |                                                           |
| imapUser        |                                                           |
| mailPass        |                                                           |





### 可选参数

| 参数名              | 默认值            | 描述                   |
| ------------------- | ----------------- | ---------------------- |
| procedureDBType | 同 dbType | 存储过程数据库类型 |
| procedureDBHost | 同 dbHost | 存储过程数据库地址 |
| procedureDBPort | 同 dbPort | 存储过程数据库端口 |
| procedureDBUser | 同 dbUser | 存储过程数据库用户 |
| procedureDBPassword | 同 dbPassword | 存储过程数据库密码 |
| rejectUnauthorized | N | 是否忽略证书 默认为N， 不填或N为忽略证书，Y为不忽略证书 |
| authAPI             | /authenticate     |  |
| findDisplayNameAPI  | /findDisplayNames |  |
| userExistsManyAPI   | /userExistsMany   |  |
| findUserAPI         | /findUser         |  |
| findUsersAPI        | /findUsers        |  |
| findGroups          | /findGroups       |  |
| getGusrsForGourpAPI | /getUsersForGroup |  |
| findUsersByCnAPI    | /findUsersByCn    |  |
| alladhocAPI         | /cps/alladhoc     |  |
|  getPublicKeyAPI		    |  /sense/Cuid/v1/getPublicKey| cuid 获取公钥 |
| loadFlag	| N |  |
| loadCron	| 0 0 23 * * * |  |
| imapFlag	| N |  |
| imapFetchIndex	| 1:* |  |
| imapNamespace	| null |  |
| imapInterval	| 60s |  |
