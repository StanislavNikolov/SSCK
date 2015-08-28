#!/bin/bash

fullPath=$1
task=$2
notFullPath=${fullPath%.*}

echo "Compiling file $fullPath at $notFullPath"

g++ -O2 -std=gnu++11 $fullPath -o $notFullPath
./checkers/$task $notFullPath
