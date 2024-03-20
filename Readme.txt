Use 
username : admin 
password : admin 

to log in - 

After a lot of difficulties because my computer still gives me SSH and keychain issues to conenct to the oracle database, I was able to connect by delpoying the backend and access the database
form the IP of the bakcend deployed in the cloud.

Some notes about the app : 

When you change your stock to view the details, you need to pulse the historical data to update the graph and show the historical values.  
Second if your stock does exist, the symbol wont be added, be sure to put symbol that exists.

If you want to test the app on you local computer, and you encounter issues related to authentification and CORS, please use the a local database, i already creted one, you will just have to uncomment the sql alchemy app configuration and change 
the path in you computer to get to mydatabase.db - I am not able to test it by directly accesing the oracle databse as, as you know, my computer does 
allow me to connect to oracle. The user id is correctly assigned, and the cookies also.
Otherwise, if you still have issues with cors, which you won't, please hardcode the userid 1 that i commented out. You still see the cookies. 