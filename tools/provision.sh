#!/bin/sh

centos64() {
    install_epel http://download.fedoraproject.org/pub/epel/6/x86_64/epel-release-6-8.noarch.rpm
    
    yum -y -q --nogpgcheck update
    yum -y -q --nogpgcheck groupinstall "Development Tools"
    yum -y -q --nogpgcheck install kernel-devel
    
    /etc/init.d/vboxadd setup
}

centos70() {
    install_epel http://download.fedoraproject.org/pub/epel/7/x86_64/e/epel-release-7-5.noarch.rpm
    
    yum -y -q --nogpgcheck groups mark install "Development Tools"
    yum -y -q --nogpgcheck update
    yum -y -q --nogpgcheck install kernel-devel
    
    /etc/init.d/vboxadd setup
}

centos() {
    yum install -y -q nodejs npm
}

trusty64() {
    add-apt-repository -y ppa:chris-lea/node.js
    apt-get update
    apt-get -y upgrade
    apt-get -y install build-essential debhelper nodejs
}

ubuntu() {
    true
}

install_epel() {
    local filename=$(basename $1)
    wget -q $1
    yum -y -q --nogpgcheck install $filename
    rm $filename
}

case "$1" in
    centos64 )
        centos64
        centos
        ;;
    centos70 )
        centos70
        centos
        ;;
    trusty64 )
        trusty64
        ubuntu
        ;;
    * ) true ;;
esac
