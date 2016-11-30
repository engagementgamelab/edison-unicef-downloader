# edison-unicef-project
Monitoring station configuration for Intel Edison

# prepare env

`npm install -g nodemon`

`npm install -g bower`

# dev

CSS responsive grid

http://cobyism.com/gridism/

Jade templates

http://jade-lang.com/

# start server via nodemon

    NODE_ENV=development nodemon index.js

# Features 

- hardware section
     -- check battery voltage
     -- check if IMU works
     -- check if capacitive touch sensor works
     -- check if camera works
     -- storage usage 
     

- user section
	list of packages, one package is at most 7 days of data
	- package already downloaded should show that it was downloaded
	the first package on the list is the latest informationa available     
     -- previous data downloaded shows when it was downloaded
     
     -- there is a device time showing at the top of the page
     	-- there is a synch button showing if the device time  is too from the time of the phone/laptop
     	
     	-- UI has button to finish a backup session (30 min)


`
