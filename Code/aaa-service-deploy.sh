#! /bin/sh
#接收外部参数
harbor_url=$1
harbor_project_name=$2
project_name=$3
tag=$4
port=$5
containerport=$6

imageName=$harbor_url/$harbor_project_name/$project_name:$tag

echo "$imageName"

#查询容器是否存在，存在则删除
containerId=`docker ps -a | grep -w ${project_name}:${tag}  | awk '{print $1}'`
if [ "$containerId" !=  "" ] ; then
    #停掉容器
    docker stop $containerId

    #删除容器
    docker rm $containerId
	
	echo "成功删除容器"
fi

#查询镜像是否存在，存在则删除
imageId=`docker images | grep -w $project_name  | awk '{print $3}'`

if [ "$imageId" !=  "" ] ; then
      
    #删除镜像
    docker rmi -f $imageId
	
	echo "成功删除镜像"
fi

# 登录Harbor
docker login -u Jose -p QWERasdf1234 $harbor_url

# 下载镜像
#docker pull $imageName

# 启动容器
docker run -di -p $port:$containerport --name $project_name \
-e dbType=mysql \
-e dbName=aaa_service \
-e dbHost=10.240.131.123 \
-e dbPort=3306 \
-e dbUser=admin \
-e dbPassword=APJ@com123 \
-e procedureDBName=nsr_gis_app \
-e activitiUrl=10.240.131.123:3004 \
-e transitionHost=10.240.131.123:3000 \
-e outboundUrl=10.240.131.123:8000 \
-e adPrefix=/adService \
-e cpsPrefix=/CPS \
-e CUIDPrefix=/CUID \
-e CUIDAPIKey=244575dc-0731-4340-a3a2-29f1d9f7104d \
-e procedureFn=sp_getLocationList \
-e jwtExpiresIn=1000m \
-e jwtSecret=1234567abc \
-e jwtIss=SENSEPLATFORM \
-e t1=IOS.ISMS \
-e t2=IOS.ISMS \
-e t6=IOS.ISMS \
-e frontEndUrl=http://10.240.131.123 \
-e imapFlag=Y \
-e imapUser=gitlab@apjcorp.com \
-e imapPass=apj.com666 \
-e imapHost=imap.mxhichina.com \
-e imapPort=993 \
-e mailHost=smtp.mxhichina.com \
-e mailPort=25 \
-e mailUser=gitlab@apjcorp.com \
-e mailPass=apj.com666 \
--restart=always $imageName 

echo "容器启动成功"
