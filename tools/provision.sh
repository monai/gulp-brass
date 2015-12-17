#!/bin/sh

centos71() {
    yum -y install https://rpm.nodesource.com/pub_4.x/el/7/x86_64/nodesource-release-el7-1.noarch.rpm
    yum -y install kernel-devel
    systemctl start vboxadd
}

centos() {
    yum install -y mc vim nodejs rpm-build
    npm install -g gulp
}

case "$1" in
    centos71 )
        centos71
        centos
        ;;
    * ) true ;;
esac
