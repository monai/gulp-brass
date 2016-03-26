# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.define "centos72" do |config|
    config.vm.box = "boxcutter/centos72"
    config.vm.provision "shell", inline: $script
  end
end

$script = <<SCRIPT
yum -y group install "Development Tools"
yum -y install https://rpm.nodesource.com/pub_5.x/el/7/x86_64/nodesource-release-el7-1.noarch.rpm
yum install -y mc vim nodejs rpm-build
systemctl start vboxadd
SCRIPT
