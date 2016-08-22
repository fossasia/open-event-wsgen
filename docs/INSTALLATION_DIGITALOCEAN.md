# How to install the Open Event Web App Generator on [DigitalOcean.com]

This guide will show you how to deploy Open Event on Digital Ocean. The basic idea is installing Docker on Digital Ocean droplet and then running Open Event in it.

#### Phase 1

* Create a droplet with Ubuntu x64 as the image. At the time of writing this guide, Ubuntu 16.04.1 was used.

* Choose a size with **atleast 1 GB RAM**. We found 512 MB RAM to be insufficient when running Open Event inside Docker.

* Choose other options according to need and then 'Create' the droplet.

* Once droplet has been created, you will get email from DigitalOcean with its information IP Address, username and password.

![droplet_email](https://cloud.githubusercontent.com/assets/4047597/17770515/e2ea6f4c-655b-11e6-9211-78257a083e82.png)

* Open a terminal window and ssh into the server. The command is `ssh USERNAME@IP`. When run, it will ask for the password you got through email. Ctrl-Shift-V to paste the password and ENTER. An example has been given below.

```bash
ssh root@104.236.228.132
# Enter password you got in the email and enter
```

* If you are ssh'ing into your droplet for the first time, you will get a prompt to change password. The step is compulsary so change the password here.
Once this step is done, you will be running the droplet's shell.

