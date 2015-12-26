Simple Source Controller for Kiten
=======

# Introduction
When a user submits a source file, it will be saved to the filesystem in the *uploadDir* directory. Then a script called *compile.sh*  will be called, which will compile it and provide some safety measures. After the (**hopefully** safe) code is compiled, a file coresponding to the task name in the *checkers* directory will be called as the binary location as its first argument. Everything written in the stdout by any of the "checker chain" programms/scripts/whatever will be returned to the user's browser.

# Scoring
Currently no real time scoring is possible, due to the fact that everything is returned directly to the browser without it being processed by the server. **TODO**

# Building it
Clone the repo. Go there and install the needed depedencies (*npm install*). Start with *node main.js*.


