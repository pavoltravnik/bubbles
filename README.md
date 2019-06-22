# Create your own Bubble

This is tool how to extract blocked persons on facebook.com.
If you include some json file from your friend, you can automatically block his blocked/blacklisted profiles.
**Happy blacklisting!**


Install dependencies:

`npm i`


Run bubbles:

`npm start`


Turn off your 2FA authentication. Do not forget to turn it back when you are finished with blocking! 2FA will be implemented soon.

Be sure, you have files in right order and right directory:
- "blocked/export/" will be filled by json with your blocked profiles on fb named by your email.json (f.e. pavol.travnik@protonmail.com.json)
- "blocked/import/" folder can contain jsons of your friends (ask them) with list of profiles and they will be automatically be blocked in your profile when you run this app.

If you want to just extract your profile of blacklisted people simply run:

`npm run export`

Blocking of pages coming soon.
