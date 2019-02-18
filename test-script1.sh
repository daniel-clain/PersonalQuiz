#!/bin/bash
result="$(grep hello test-script2.sh)"

# if will be true if result is empty string
if [ -z "$result" ]
then
    echo "result has no value"
else 
    echo "result has value"
fi