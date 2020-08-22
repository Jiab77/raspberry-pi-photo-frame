# Raspberry Pi Photo Frame

Using a Raspberry Pi as photo frame with a nice Web UI

## Installation

I've prefered to use Ubuntu Server as base instead of a complete Lubuntu desktop but it should work if you're using Lubuntu desktop instead.

Here is the Raspberry Pi image I've used:

* http://cdimage.ubuntu.com/ubuntu/releases/18.04.5/release/ubuntu-18.04.5-preinstalled-server-armhf+raspi3.img.xz

> You can try with other available images from [here](http://cdimage.ubuntu.com/ubuntu/releases/).

Flash it on your sdcard with the tool you prefer and plug it into your Raspberry Pi.

> I won't explain how to setup the network on your Raspberry Pi.

Once you've configured your network access, run the following commands to install the desktop base:

```bash
# Update everything
sudo apt update --fix-missing -y && sudo apt dist-upgrade -y && sudo apt autoremove --purge -y

# Install git and nodejs
sudo apt install git nodejs

# Install Lubuntu core
sudo apt install lubuntu-core

# Install chromium
sudo apt install chromium-browser chromium-browser-l10n

# Reboot to apply changes
sudo reboot
```

Download [NoMachine](https://www.nomachine.com/) to control remotely the Raspberry Pi from [here](https://www.nomachine.com/download/linux&id=29&s=Raspberry) and copy the `.deb` package with `scp`:

```bash
# Copy the package
scp nomachine_6.11.2_1_armhf.deb ubuntu@your-pi-host:~/

# Connect to the host
ssh ubuntu@your-pi-host

# Install the package
sudo dpkg -i nomachine_6.11.2_1_armhf.deb
```

> This package is for the ARMv7 version.

## Clone the project

```bash
git clone https://github.com/Jiab77/raspberry-pi-photo-frame.git
```

### Disable demo mode

By default it will display pictures from [Lorem Picsum](https://picsum.photos/).

Edit the file `main.js` and change `loadDemo` from `true` to `false` as shown:

```js
// Demo settings
var loadDemo = false;
var demoDuration = 60000;
```

You can also change the demo duration if you leave `loadDemo` as `true` by changing the value of `demoDuration`. The value is in milliseconds.

### Create startup script

Now to autostart Chromium with the slideshow, simply create the following starting script:

```bash
#!/bin/bash

# Start server
cd raspberry-pi-photo-frame
NODE_WEB_HOST=0.0.0.0 node server/server.js &

# Wait for server to start
sleep 5

# Start browser
chromium-browser --temp-profile --incognito --app=http://127.0.0.1:8001

# Kill server
killall -KILL node
```

Save it as `start-slideshow.sh` and make it executable with: `chmod -v +x start-slideshow.sh`.

### Add the script in desktop autostart

According to the documentation, you simply add a new line in `~/.config/lxsession/LXDE/autostart`:

```bash
# Add new startup line
echo "@${HOME}/start-slideshow.sh" | tee -a ~/.config/lxsession/LXDE/autostart

# Verify the result
cat ~/.config/lxsession/LXDE/autostart
```

> The path might differ on your side.

Restart to see the result.

> To remove from autostart, simply delete or comment the line from `~/.config/lxsession/LXDE/autostart`:
>
> ```bash
> sed -e 's|@'${HOME}'/start-slideshow.sh|# @'${HOME}'/start-slideshow.sh|' -i ~/.config/lxsession/LXDE/autostart
> ```
>
> Then restart.

## Add your pictures

To add your pictures to the project, simply create the `images` folder at the root of the project:

```bash
# Move to the project folder
cd raspberry-pi-photo-frame

# Create the images folders
mkdir -v images
```

Now you can copy your pictures inside:

```bash
# Move to your local pictures folder
cd ~/Images

# Copy them to your pi host
scp -r ~/Images/* ubuntu@your-pi-host:~/raspberry-pi-photo-frame/images/
```

Once done, make sure that the demo mode is disabled. You can now refresh your current window or re-run the starting script. :tada:

## Preview

![image](https://user-images.githubusercontent.com/9881407/90090657-df1cf700-dd24-11ea-9743-a841420c4545.png)

## Development

The web server used is based on NodeJS and you can read the documentation [here](./server/README.md).

```bash
# Clone the repo
git clone https://github.com/Jiab77/raspberry-pi-photo-frame.git

# Move to the project folder
cd raspberry-pi-photo-frame

# Start the server
node server/server.js
```

Simply hit `[Ctrl + C]` to stop it.
