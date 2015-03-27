# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  # All Vagrant configuration is done here. The most common configuration
  # options are documented and commented below. For a complete reference,
  # please see the online documentation at vagrantup.com.

  # Every Vagrant virtual environment requires a box to build off of.
  config.vm.box = "dummy"

  config.vm.provider :aws do |aws, override|
    config.nfs.functional = false

    # Configure these outside of the repo in your user-specific Vagrantfile
    # $HOME/.vagrant.d/Vagrantfile
    #
    #aws.access_key_id = "AAAAAAAAAAAAAAAAAAAA"
    #aws.secret_access_key = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    #aws.keypair_name = "user@host"
    #override.ssh.private_key_path = "/home/user/.ssh/id_rsa"

    aws.ami = "ami-35143705"

    aws.region = "us-west-2"
    aws.instance_type = "t2.micro"

    override.ssh.username = "ubuntu"

  end

  config.vm.provision :shell, :inline => "dpkg -l puppet || sudo apt-get install -qq puppet"
  config.vm.provision :shell do |shell|
      shell.inline = "(puppet module list | grep puppetlabs-apache) || (mkdir -p /etc/puppet/modules; puppet module install puppetlabs-apache;)"
  end
  config.vm.provision "puppet" do |puppet|
    puppet.module_path = "puppet_modules"
    #puppet.options = "--verbose --debug"
  end

  config.vm.network :forwarded_port, guest: 80, host: 8080
  config.vm.synced_folder ".tox/", "devenv/", disabled: true
  
end
