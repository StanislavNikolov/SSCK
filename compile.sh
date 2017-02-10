#!/bin/env bash

fullPath=$1
task=$2
checker=$3
binary=${fullPath%.*}

CXXFLAGS="-O2 -std=c++14"

#echo "Compiling with C compiler flags: $CXXFLAGS"
if timeout 20 c++ $CXXFLAGS $fullPath -o $binary
	then
		: # nop
	else
		echo "<font color=\"brown\">Compilation failed</font>"
		echo "__SSCK_RES_PACK__"
		echo "0"
		exit 1
fi

./checkers/$checker $binary $task
