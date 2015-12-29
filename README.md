Simple Source Controller for Kiten
=======

# Introduction
SSCK is a simple scoring system designed for small contests that need to be easy to set up. It's written in JavaScript (page rendering and user management) and bash (starting the tasks with different tests/limits). All you need is a POSIX-compatible OS (GNU, OS X) and nodejs.

# Running it
I'm not good at creating tutorials. The first time you do it you may need to dive a little bit deeper, but once you kinda understand how it works, SSCK is more than simple to control.  
You need to know how to deal with those three files to change SSCK's behaviour:
 * config.json - user whitelist
 * checkers/settings/time_limit - time limits for different tasks. Used by the default (standart) checker.
 * checkers/settings/test_count - the maximum N which the standart checker uses, where N is the test name with format N.in and N.out.
You can actually **write your own checkers in whatever language you want**. SSCK will call the requiered one with its arguments the binary to be tested and the task it's submitted on. *This is still WIP.* Look at checkers/standart for a example.  

# Writing checkers
Well, simplicity does not come with no compromise. All communication between the render server(main.js), the compile/code checker script(compile.sh) and the checker(your or the default) is done throught stdin/stdout. The API(heh) is still kinda changing every day/week/commit so don't trust it. Read the code for more info(checkers/standart, the bottom of main.js).

# TODO
 * Definetly way more safety measures. The system can easily be hacked by the owner, or anybody else. Read compile.sh.
 * Use external rendering system / rewrite the current one. The code is a bit cluncky and unfriendly.
 * Improve this README. It sucks. I know.
