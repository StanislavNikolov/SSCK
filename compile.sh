#!/bin/bash

fullPath=$1
task=$2
notFullPath=${fullPath%.*}

CXXFLAGS="-O2 -std=c++11"
echo "g++ $CXXFLAGS $fullPath -o $notFullPath"

g++ $CXXFLAGS $fullPath -o $notFullPath
./checkers/$task $notFullPath
