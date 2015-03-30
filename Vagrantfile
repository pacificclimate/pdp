
# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  # All Vagrant configuration is done here. The most common configuration
  # options are documented and commented below. For a complete reference,
  # please see the online documentation at vagrantup.com.

  config.vm.box = "ubuntu-14.04"

  config.vm.provider :aws do |aws, override|

    # Do this before hand
    # $ vagrant plugin install vagrant-aws
    # $ vagrant box add dummy https://github.com/mitchellh/vagrant-aws/raw/master/dummy.box
    override.vm.box = "dummy"

    config.nfs.functional = false

    # Configure these outside of the repo in your user-specific Vagrantfile
    # $HOME/.vagrant.d/Vagrantfile
    #
    #aws.access_key_id = "AAAAAAAAAAAAAAAAAAAA"
    #aws.secret_access_key = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    #aws.keypair_name = "user@host"
    #override.ssh.private_key_path = "/home/user/.ssh/id_rsa"

    # ubuntu/images/hvm/ubuntu-trusty-14.04-amd64-server-20150305
    aws.ami = "ami-35143705"

    aws.region = "us-west-2"
    aws.instance_type = "t2.micro"

    override.ssh.username = "ubuntu"

  end

  config.vm.provision :shell, :inline => "dpkg -l puppet || sudo apt-get install -qq puppet"
  config.vm.provision :shell do |shell|
      shell.inline = "for module in puppetlabs-apache stankevich-python ajcrowe-supervisord; do (puppet module list | grep ${module}) || (mkdir -p /etc/puppet/modules; puppet module install ${module};); done"
  end
  config.vm.provision "puppet" do |puppet|
    puppet.module_path = "puppet_modules"
    #puppet.options = "--verbose --debug"
  end

  config.vm.network :forwarded_port, guest: 80, host: 8888
  config.vm.synced_folder ".tox/", "devenv/", disabled: true

  # FIXME: This is all system specific garbage
  # /home/data/climate/hydrology/vic/gen1/
  config.vm.synced_folder "/datasets/climate-hydrology-vic-gen1", "/datasets/climate-hydrology-vic-gen1", type: "virtualbox"
  # /home/data/climate/downscale/CMIP5/
  config.vm.synced_folder "/datasets/climate-downscale-CMIP5", "/datasets/climate-downscale-CMIP5", type: "virtualbox"
  # /home/data/climate/downscale/CMIP5/BCCAQ/climdex/
  # Part of above
  # /home/data/climate/PRISM/dataportal/
  config.vm.synced_folder "/datasets/data4/climate/PRISM/dataportal", "/datasets/data4/climate/PRISM/dataportal", type: "virtualbox"

  
end
