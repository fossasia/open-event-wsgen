# How to install the Open Event Web App Generator on AWS

## Phase 1

This phase involves creating the EC2 instance which will hold your app.

* Go to Amazon Web Services console and [select EC2](https://console.aws.amazon.com/ec2/).

* Click on the create button to create an instance. Select Ubuntu 14 x64 as the linux distribution.

* Follow the other steps till you reach the 6th step which is about *configuring Security groups*. There add a rule to accept all HTTP connections. See the screenshot on how
it should look like.

![ec2_security_grp](https://cloud.githubusercontent.com/assets/4047597/17800591/25add494-6602-11e6-9667-437c1626e745.png)

* Click Launch in the 7th step and you will be presented with a dialog to create a key. Create a new key and give it a name. In this tutorial, I will use the name 'mykey'.
Then download the key. Keep it safe because if you lose it, you will lose access to the server.

![ec2_create_key](https://cloud.githubusercontent.com/assets/4047597/17800590/256db530-6602-11e6-9256-30a2e7463148.png)

* Once the instance is created, you will be forwarded to the instances list. Select the newly created instance and click on Connect button. You will see a dialog with instructions on how to connect to it using ssh.

![connect_ssh_ec2](https://cloud.githubusercontent.com/assets/4047597/17800592/25e77262-6602-11e6-8acd-6bd352a30950.png)

* In the above case, the command is as follows. So open the terminal in your Downloads directory (which has the downloaded key file) and then run the command you got from the
previous step. In my case, it was -

```sh
chmod 400 mykey.pem
ssh -i "mykey.pem" ubuntu@ec2-52-41-207-116.us-west-2.compute.amazonaws.com
```

* You will be into the server's shell. You will notice a text message stating to install the language pack. So run the following command.

```sh
sudo apt-get install language-pack-en
```

