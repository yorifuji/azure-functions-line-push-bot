#!/bin/sh

now=`date +%s`
temp=41.1
msg="{\"partitionKey\":\"status\",\"rowKey\":${now},\"cpu_temperature\":${temp}}"

curl -X POST -H 'Content-type: application/json' --data $msg $1
