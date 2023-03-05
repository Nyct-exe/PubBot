# Discord Bot For WetherSpoons
a bot which allows to start pub events to get free drinks from discord friends by tracking the pub they're are at and when they leave.
Additionally implements simple moderation to prevent users from abusing PubBot and overall spam.

How to Run:
Initialize the database first and then you can start the bot.
1. node ./dbInit.js
2. node ./index.js

TODO:
1. Actually add a wordlist for the appreciation checks.
2. Make so that once it joins a server it creates its own channel where it operates.
3. Allow users to create pub events which would tag all people who owe the person who started drinks.
