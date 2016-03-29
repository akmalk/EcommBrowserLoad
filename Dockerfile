FROM centos:latest

RUN \
    yum update -y && yum install -y wget && \
    wget https://nodejs.org/dist/v4.3.1/node-v4.3.1-linux-x64.tar.xz && \
    tar --strip-components 1 -xJvf node-v* -C /usr/local

RUN npm install -g forever

COPY src /src
COPY logs /logs

RUN cd /src; npm install

CMD ["forever", "-l", "/forever.log", "-o", "/out.log", "-e", "/err.log", "-vf", "/src/index.js"]
