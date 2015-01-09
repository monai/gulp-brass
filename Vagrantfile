# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  
  config.vm.define "centos64" do |centos64|
    centos64.vm.box = "box-cutter/centos64"
    
    centos64.vm.provision "shell", path: "tools/provision.sh", args: "centos64"
  end
  
  config.vm.define "centos70" do |centos70|
    centos70.vm.box = "box-cutter/centos70"
    
    centos70.vm.provision "shell", path: "tools/provision.sh", args: "centos70"
  end
  
  config.vm.define "trusty64" do |trusty64|
    trusty64.vm.box = "ubuntu/trusty64"
    
    trusty64.vm.provision "shell", path: "tools/provision.sh", args: "trusty64"
  end
  
end
