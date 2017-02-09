#!/bin/env bash

fullPath=$1
task=$2
checker=$3
binary=${fullPath%.*}

CXXFLAGS="-O2 -std=c++14"

#echo "Compiling with C compiler flags: $CXXFLAGS"
if timeout 20 c++ $CXXFLAGS $fullPath -o $binary
	then echo -n ""
	else echo "<font color=\"brown\">Compilation failed!</font>"; exit;
fi

./checkers/$checker $binary $task
