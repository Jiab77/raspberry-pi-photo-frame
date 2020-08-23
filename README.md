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

## Increase RAM

The default RAM size is not enough to run the project smoothly, so you need to increase the available memory size with __Zram__.

Create the loading script:

```bash
sudo nano /usr/bin/zram.sh
```

And place this content:

```bash
#!/bin/bash

echo -e "\nExpanding available memory with zRAM...\n"
cores=$(nproc --all)
modprobe zram num_devices=$cores
modprobe zstd
modprobe lz4hc_compress

swapoff -a

totalmem=`free | grep -e "^Mem:" | awk '{print $2}'`
#mem=$(( ($totalmem / $cores)* 1024 ))
mem=$(( ($totalmem * 4 / 3 / $cores)* 1024 ))

core=0
while [ $core -lt $cores ]; do
    echo zstd > /sys/block/zram$core/comp_algorithm 2>/dev/null ||
    echo lz4hc > /sys/block/zram$core/comp_algorithm 2>/dev/null ||
    echo lz4 > /sys/block/zram$core/comp_algorithm 2>/dev/null
    echo $mem > /sys/block/zram$core/disksize
    mkswap /dev/zram$core
    swapon -p 5 /dev/zram$core
    let core=core+1
done
```

> The [zstd](https://github.com/facebook/zstd) compression algorithm has been used for better performance results.
>
> It might not be supported on all systems, that's why I've added some other compression algorithms.

Then save it with `[Ctrl+O]` and `[Ctrl+X]`.

Make it executable:

```bash
sudo chmod -v +x /usr/bin/zram.sh
```

Then create the boot script:

```
sudo nano /etc/rc.local
```

And place this content:

```bash
#!/bin/bash

/usr/bin/zram.sh &

exit 0
```

Then save it with `[Ctrl+O]` and `[Ctrl+X]`.

Make it executable:

```bash
sudo chmod -v +x /etc/rc.local
```

To finish, run the script to create the additional memory. To see the available memory and the compression stats, run the following commands:

```bash
# Manual start
sudo /usr/bin/zram.sh

# Show memory compression stats
zramctl

# Show available memory
free -mlht
```

## Clone the project

```bash
git clone https://github.com/Jiab77/raspberry-pi-photo-frame.git
```

### Settings

#### Demo

By default it will display pictures from [Lorem Picsum](https://picsum.photos/).

Edit the file `main.js` to the following settings:

```js
// Demo settings
var loadDemo = true;
var demoDuration = 60000;
var infiniteDemo = true;
```

Effects:

* `loadDemo`: (`true`|`false`) - Enable / disable the demo mode
* `demoDuration`: (duration in milliseconds) - Change the demo duration
* `infiniteDemo`: (`true`|`false`) - Make the demo infinite or not

#### Slideshow

By default the slideshow is now infinite instead of stopping when all pictures are displayed.

Edit the file `main.js` to the following settings:

```js
// Slideshow settings
var imagesPath = '/images';
var infiniteSlideshow = true;
var slideshowAnimationEnter = 'fade in';
var slideshowAnimationLeave = 'fade out';
var slideshowPauseDuration = 8000;
var animationDuration = 800;
var animationLoadingTime = 800;
```

Effects:

* `imagesPath`: (`/images`) - Define the path to folder that contains pictures to display
* `infiniteSlideshow`: (`true`|`false`) - Make the slideshow infinite or stop when all pictures are displayed
* `slideshowAnimationEnter`: (`fade in`) - Picture display animation
* `slideshowAnimationLeave`: (`fade out`) - Picture hide animation
* `slideshowPauseDuration`: (duration in milliseconds) - Waiting time duration before changing picture
* `animationDuration`: (duration in milliseconds) - Display animation duration
* `animationLoadingTime`: (duration in milliseconds) - Waiting time duration before running display animation

### Create startup script

Now to autostart Chromium with the slideshow, simply create the following starting script:

```bash
#!/bin/bash

# Wait for desktop start
sleep 30

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
rsync -aHXhixv --numeric-ids --progress --partial --append-verify --size-only --stats --min-size=1 --prune-empty-dirs -e "ssh -T -c aes128-gcm@openssh.com -o Compression=no -x" ~/Images/* ubuntu@your-pi-host:~/raspberry-pi-photo-frame/images/
```

> This command will preserve date and time attributes.

Once done, make sure that the demo mode is disabled. You can now refresh your current window or re-run the starting script. :tada:

## Update the code

If you want to get the latest version, here is the simpliest way to do so:

```bash
# Stop the current browser instance
killall -KILL chromium-browser

# Move to the project folder
cd raspberry-pi-photo-frame

# Cancel your local changes
git checkout main.js

# Get the latest version
git pull

# Disable demo mode
sed -e 's/loadDemo = true/loadDemo = false/' -i main.js

# Restart the slideshow
~/start-slideshow.sh
```

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
