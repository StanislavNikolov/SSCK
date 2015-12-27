#!/bin/env bash

fullPath=$1
task=$2
notFullPath=${fullPath%.*}

CXXFLAGS="-O2 -std=c++14"

if c++ -E $CXXFLAGS $fullPath | grep -qi fstream
then
	echo "The source contains unsafe code! (SSCK_ERR_100)"
	#exit
fi

echo "c++ $CXXFLAGS $fullPath -o $notFullPath"
c++ $CXXFLAGS $fullPath -o $notFullPath
./checkers/$task $notFullPath $task
