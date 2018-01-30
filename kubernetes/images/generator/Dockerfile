FROM node:boron
MAINTAINER Niranjan Rajendran <niranjan94@yahoo.com>

ARG COMMIT_HASH
ARG BRANCH
ARG REPOSITORY

ENV COMMIT_HASH ${COMMIT_HASH:-null}
ENV BRANCH ${BRANCH:-master}
ENV REPOSITORY ${REPOSITORY:-https://github.com/fossasia/open-event-webapp.git}

ENV INSTALL_PATH /opev

RUN mkdir -p $INSTALL_PATH

WORKDIR $INSTALL_PATH

COPY . .

RUN bash setup.sh

WORKDIR $INSTALL_PATH/webapp_generator

CMD [ "npm", "start" ]