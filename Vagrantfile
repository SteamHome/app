# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|

  config.vm.box = "puphpet/ubuntu1404-x64"
  config.ssh.forward_agent = true

  config.vm.network :forwarded_port, guest: 80, host: 8080
  config.vm.network :forwarded_port, guest: 8000, host: 8000
  config.vm.network :forwarded_port, guest: 5984, host: 5984
  config.vm.network :forwarded_port, guest: 3000, host: 3000
  config.vm.network "private_network", ip: "192.168.10.10"

	# Run The Base Provisioning Script
	config.vm.provision :shell, path: ".setup/privileged.sh"
  config.vm.provision :shell, path: ".setup/unprivileged.sh", privileged: false

end
