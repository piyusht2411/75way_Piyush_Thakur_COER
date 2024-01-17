# use npm install 
for installing all packages
# run npm run dev for nodemon
for starting the server
# register API
set header ->  content-type - application/json
in body send data (name, email, phone, password)

# login API
set header ->  content-type - application/json
in body send data (email, password)

# sendmoney API
example => localhost:3000/sendMoney/userid
(put userid in parameter)
set header - authorizen - put authttoken of login user from cookies 
on body send data of (receiverId and the amount)

# getbalance API
example => localhost:3000/sendMoney/userid
(put userid in parameter)
set header - authorizen - put authttoken of login user from cookies 

# filter API
localhost:3000/hour/userID
(put userid in parameter)
may change the filter from server link like change hour to day, week,month,year
set header - authorizen - put authttoken of login user from cookies 




