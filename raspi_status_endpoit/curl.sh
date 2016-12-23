#!/bin/sh

curl -H "Content-type: application/json" -X POST -d \
     '{ "partitionKey" : "status", "rowKey" : 1482510688, "cpu_temperature" : 41.1 }' \
     $1
