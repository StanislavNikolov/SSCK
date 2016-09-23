#!/bin/env bash

out=`mktemp -t ssck_tmpinfo.XXXXXXXXXX`
first=true

echo '{"tasks":[' > $out

write ()
{
	if [[ $first == true ]]
	then
		echo '{"internal_name":' '"'"$1"'",' '"ff_name":' '"'"$2"'"}' >> $out
		first=false
	else
		echo ',{"internal_name":' '"'"$1"'",' '"ff_name":' '"'"$2"'"}' >> $out
	fi
}

for task in checkers/tests/*
do
	if [ -f $task/ff_name ]
	then
		write "`basename $task`" "`cat $task/ff_name`"
	else
		write "`basename $task`" "`basename $task`"
	fi
done

echo ']}' >> $out

echo -n $out
