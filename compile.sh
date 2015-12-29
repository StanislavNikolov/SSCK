#!/bin/env bash

fullPath=$1
task=$2
checker=$3
notFullPath=${fullPath%.*}

CXXFLAGS="-O2 -std=c++14"

if c++ -E $CXXFLAGS $fullPath | grep -qi fstream
then
	echo "The source contains unsafe code! (SSCK_ERR_100)"
	# exit
fi

echo "Compiling with C compiler flags: $CXXFLAGS"
if timeout 20 c++ $CXXFLAGS $fullPath -o $notFullPath
	then echo "Compilation succesful"
	else echo "Compilation failed (probably invalid source code)!"; exit;
fi

./checkers/$checker $notFullPath $task
