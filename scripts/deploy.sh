#!/bin/bash
set -e # exit with nonzero exit code if anything fails

# Install dependencies
apt-get install sshpass

# Connect and Deploy
sshpass -e ssh root@45.55.208.46  -o StrictHostKeyChecking=no "echo 'hello'"
