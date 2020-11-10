docker镜像打包
1 进入code所在目录
2 将app、config、lib、.eslintrc.js、app.js、Dockerfile、package.json、package-lock.json添加到压缩文件docker-aaa-server.zip
3 打开FinalShell
4 进入code所在目录cd /home/aaa-server/
5 上传docker-aaa-server.zip
6 删除zip文件以外的文件
7 解压 zip文件 unzip docker-aaa-server.zip 覆盖现有文件
8 运行docker build -t aaa-service . (aaa-service 为docker iamges名称，.指当前目录)
9 docker images 查看所有images
10 docker run --restart=always --name aaa-service -d -p 3003:7001 aaa-service(3003为对外访问接口，7001为服务接口，-d代表后台运行，去掉可查看显示日志信息)
11 docker ps -a 查看当前运行镜像

docker镜像删除（非第一次安装时，请先执行此操作）
1 docker ps -a 查看当前运行镜像
2 复制对应IMAGE为aaa-service的CONTAINER ID
3 docker rm CONTAINER ID -f
4 重复执行2、3，直到所有IMAGE为aaa-service的都被删除
4 docker images 查看所有images
5 docker rmi aaa-service



运行

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
-e outboundUrl=http://10.231.131.123:7000 \
-e activitiUrl=http://10.231.131.123:3004 \
-e jwtExpiresIn=10m \
-e jwtSecret=1234567abc \
-e jwtIss=SENSEPLATFORM \
-e mailHost=smtp.mxhichina.com \
-e mailPort=25 \
-e mailUser=gitlab@apjcorp.com \
-e mailPass=apj.com666 \
-e imapHost=imtp.mxhichina.com \
-e imapPort=993 \
-e imapUser=gitlab@apjcorp.com \
-e imapPass=apj.com666 \
-e transitionHost=10.231.131.123:3000 \
aaa-service
````
