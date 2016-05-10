#!/bin/env bash

fullPath=$1
task=$2
checker=$3
notFullPath=${fullPath%.*}

CXXFLAGS="-O2 -std=c++14"

echo "Compiling with C compiler flags: $CXXFLAGS"
if timeout 20 c++ $CXXFLAGS $fullPath -o $notFullPath
	then echo "Compilation succesful"
	else echo "<font color=\"brown\">Compilation failed!</font>"; exit;
fi

./checkers/$checker $notFullPath $task
