# Simple Source Controller for Kiten

## Introduction
SSCK is a simple scoring system designed for small contests that need to be easy to set up. It's written in JavaScript (page rendering and user management) and bash (starting the tasks with different tests/limits). All you need is a POSIX-compatible OS (GNU, OS X) and nodejs.

## Running it
Clone the repo and go to the root directory of SSCK (the one this file is placed in). Install all the depencies (npm install) and run node main.js. Thats it!  
Of course, there are no tasks, users and so on. The code is simple and clean enough, and I suck at writing tutorials so just look at the *checkers/* directory.
Basic configuration is made possible by a small json called config.json. Look at template_config.json for more info.  
You can actually **write your own checkers in whatever language you want**. SSCK will call the requiered one with its arguments the binary to be tested and the task it's submitted on. Look at checkers/standart for a example.  

## Writing checkers
Well, simplicity does not come with no compromise. All communication between the render server(main.js), the compile/code checker script(compile.sh) and the checker(your or the default) is done throught stdin/stdout. This means there are a lot of ways to break everything. There no safe-checks implemented (yet!). The API(heh) is still kinda changing every day/week/commit so don't trust it. Read the code for more info(checkers/standart, or the bottom of main.js).

## TODO
 * Definetly way more safety measures. The system can easily be hacked by the owner, or anybody else. Read compile.sh.
 * Use external rendering system / rewrite the current one. The code is a bit cluncky and unfriendly.
 * Improve this README. It sucks. I know.
