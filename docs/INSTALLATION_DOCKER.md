
# Deploying Open Event Web App with Docker

> Docker is much more efficient than VM in allocating shared resources between various containers as shown in figure. To deploy Open Event Web App we need to create docker container. There are two ways to build it. First way is fork the open-event-webapp project in github. Then you can signup in dockerhub and create autobuild docker container. The second way is to manually build docker file from command prompt of your computer. The following instructions needs to be executed in cloud shell or linux machine.

```
sudo apt-get update
sudo apt-get upgrade
sudo apt-get -y install docker.io
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
sudo docker build https://github.com/fossasia/open-event-webapp.git
```


The first three commands install docker software to the machine. Next three lines give required permissions and execution abilities to docker. Final command builds docker container from github. Thus, We have successfully made docker container. We can deploy it on the cloud by using following command.

```
sudo docker run -d -p 80:80 -p 443:443 open-event-webapp
```