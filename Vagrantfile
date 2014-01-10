# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

MEMORY=2048
CORES=2

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  config.vm.box = "precise32"

  config.vm.box_url = "http://files.vagrantup.com/precise32.box"


  config.vm.provider :virtualbox do |v|
    # Use VBoxManage to customize the VM. For example to change memory:
    v.customize ["modifyvm", :id, "--memory", MEMORY.to_i]
    v.customize ["modifyvm", :id, "--cpus", CORES.to_i]

    if CORES.to_i > 1
      v.customize ["modifyvm", :id, "--ioapic", "on"]
    end
  end

  #config.vm.synced_folder Pathname.pwd, Pathname("/srv/huboard")
  config.vm.provision :chef_solo do |chef|
    chef.cookbooks_path = "cookbooks"
    chef.add_recipe 'apt'
    chef.add_recipe 'git'
    chef.add_recipe "build-essential"
  end

  config.vm.define "theworks", :primary => true do |web| 
    web.vm.network :forwarded_port, guest: 9292, host: 9292
    web.vm.provision :chef_solo do |chef|
      chef.cookbooks_path = "cookbooks"
      chef.add_recipe 'apt'
      chef.add_recipe 'git'
      chef.add_recipe "build-essential"
      chef.add_recipe "ruby_build"
      chef.add_recipe "rbenv::system"
      chef.add_recipe "rbenv::vagrant"
      chef.add_recipe "couchdb::source"
      chef.add_recipe "memcached"
      chef.add_recipe "nodejs"

      chef.json = { 
        "rbenv" => {
          "rubies" => [ "2.0.0-p353" ],
          "global" => "2.0.0-p353",
          "gems" => {
            "2.0.0-p353" => [
              { "name" => "bundler" }
            ]
          }
        },
        "couch_db" => {
          "config" => {
            "httpd" => {
              "bind_address" => "0.0.0.0"
            }
          }
        }
      }
    end
    web.vm.provision "shell" do |s|
      s.path = "provisioning/huboard.sh"
      s.privileged = false
    end
  end
  
  config.vm.define "couch" do |couch|
    couch.vm.box = "precise32"
    couch.vm.network :forwarded_port, guest: 5984, host: 5984
    couch.vm.network :forwarded_port, guest: 11211, host: 11211
    couch.vm.provision :chef_solo do |chef|
      chef.cookbooks_path = "cookbooks"
      chef.add_recipe "couchdb::source"
      chef.add_recipe "nodejs"
      chef.add_recipe "memcached"

      chef.json = { 
        "couch_db" => {
          "config" => {
            "httpd" => {
              "bind_address" => "0.0.0.0"
            }
          }
        }
      }
    end
    couch.vm.provision "shell" do |s|
      s.path = "provisioning/couchdb.sh"
      s.privileged = false
    end
  end
end
