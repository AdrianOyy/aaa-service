docker镜像打包
1 进入code所在目录
2 将app、config、lib、.eslintrc.js、app.js、Dockerfile、package.json、package-lock.json添加到压缩文件docker-aaa-server.zip
3 打开FinalShell
4 进入code所在目录cd /home/aaa-server/aaa-server/
5 上传docker-aaa-server.zip
6 解压 zip文件 unzip docker-aaa-server.zip 覆盖现有文件
7 运行docker build -t aaa-service . (aaa-service 为docker iamges名称，.指当前目录)
8 docker images 查看所有images
9 docker run --restart=always --name aaa-service -d -p 3003:7001 aaa-service(3003为对外访问接口，7001为服务接口，-d代表后台运行，去掉可查看显示日志信息)
10 docker ps -a 查看当前运行镜像

docker镜像删除（非第一次安装时，请先执行此操作）
1 docker ps -a 查看当前运行镜像
2 复制对应IMAGE为aaa-service的CONTAINER ID
3 docker rm CONTAINER ID -f
4 重复执行2、3，直到所有IMAGE为aaa-service的都被删除
4 docker images 查看所有images
5 docker rmi aaa-service