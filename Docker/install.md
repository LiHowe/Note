# Install Docker

## CentOS 7

> [参考](https://www.cnblogs.com/yufeng218/p/8370670.html)

1. 更新yum包

```shell
sudu yum update
```

2. 如果有旧版本则卸载旧版本

```shell
sudo yum remove docker docker-common docker-selinux docker-engine
```

1. 安装必需软件包

```shell
sudo yum install -y yum-utils device-mapper-persistent-data lvm2
```

4. 设置yum源

```shell
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```

5. 安装docker

```shell
sudo yum install docker-ce
```

6. 启动并加入开机启动

```shell
sudo systemctl start docker
sudo systemctl enable docker
```

7. 验证安装是否成功(有client和service两部分表示docker安装启动都成功了)

```shell
docker version
```
