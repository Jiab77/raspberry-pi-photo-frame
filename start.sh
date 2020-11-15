#!/bin/bash

# Wait for desktop start
# sleep 30

# Start server
cd ~/raspberry-pi-photo-frame
NODE_WEB_HOST=0.0.0.0 node server/server.js &

# Wait for server to start
# sleep 5

# Start browser
# chromium-browser --temp-profile --incognito --app=http://127.0.0.1:8001

# Start electron
node_modules/electron/dist/electron .

# Kill server
echo -e "\nKilling server...\n"
killall -KILL node
