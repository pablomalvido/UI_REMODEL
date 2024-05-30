# Setup instructions

## Install nodejs (we have version 14) 
```
sudo apt-get install curl
curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs
```
For more info check: https://www.youtube.com/watch?v=Mq0tYK0LDw8

## Check node installation (v14.21.3)
```
node --version
```

## Install Vue CLI
```
sudo npm install -g @vue/cli
```

For more info check: https://www.youtube.com/watch?v=GWRvrSqnFbM&list=PL4cUxeGkcC9hYYGbV60Vq3IXYNfDk8At1&index=4 

## Clone repository
```
git clone https://github.com/pablomalvido/UI_REMODEL.git
cd
cd UI_REMODEL
npm install
npm install --save roslib
```

## Launch rosbridge in a new terminal (the command is for melodic, if you have noetic, replace melodic for noetic)
```
sudo apt-get install ros-melodic-rosbridge-server
```

## Open a new terminal, navigate to the UI directory, run the UI and open the link (it is better to open it in Firefox)
```
cd
cd UI_REMODEL
npm run serve
```