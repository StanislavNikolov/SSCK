#!/bin/env bash

fullPath=$1
task=$2
notFullPath=${fullPath%.*}

CXXFLAGS="-O2 -std=c++11"
echo "g++ $CXXFLAGS $fullPath -o $notFullPath"

(gcc -E $CXXFLAGS $fullPath | grep -qi fstream) && (echo "The source contains unsafe code! (SSCK_ERR_100)" && exit)
g++ $CXXFLAGS $fullPath -o $notFullPath
./checkers/$task $notFullPath
