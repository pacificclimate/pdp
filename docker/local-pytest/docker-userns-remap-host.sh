#!/bin/bash
# This script prepares a user on the host for a Docker userns-remap.

# Establish names of docker user and group
username=${1:-dockeragent}
groupname=${2:-"$username"}
echo username $username
echo groupname $groupname

# Create the group and user
sudo groupadd "$groupname"
sudo useradd -r -g "$groupname" "$username"

# Add user to group with file access privileges
privgroupname=${3:-$(id -gn)}
sudo usermod -a -G "$privgroupname" "$username"

# Add `subuid` and `subgid` entries
uid=$(id -u "$username")
gid=$(id -g "$groupname")
lastuid=$(( uid + 65536 ))
lastgid=$(( gid + 65536 ))

sudo usermod --add-subuids "$uid"-"$lastuid" "$username"
sudo usermod --add-subgids "$gid"-"$lastgid" "$username"
