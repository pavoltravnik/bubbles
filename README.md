# Create your own Bubble

Many people use adblockers to avoid banner advertisement and spam filters. But what about filters on social networks? Let's clean the space and enjoy your comfortable social bubble.
This is tool how to extract blocked persons on facebook.com.
If you include some json file from your friend, you can automatically block his blocked/blacklisted profiles.
**Happy blacklisting!**


Install dependencies:

`npm i`

Run bubbles and login:

`npm login`

This will open browser and allow you to login to Facebook. If asked,
save the browser, otherwise you would need to login everytime you run
it. The login credentials are saved to loginData folder, keep it safe.

It will also automatically export the list of blocked people.

Run bubbles to import blocklist:

`npm start`

Be sure, you have files in right order and right directory:
- "blocked/export/myexport.json" will be filled by json with your blocked profiles on
  fb
- "blocked/import/" folder can contain jsons of your friends (ask them) with list of profiles and they will be automatically be blocked in your profile when you run this app.

Blocking of pages coming soon.
