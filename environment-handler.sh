#!/bin/bash
set -e # this stops the rest of the script running if error occurs

# login with service principal
az login --service-principal -u cea2f026-123a-454a-b107-6c389df9eeae -p 62b7b43f-a0a2-46a5-b6a9-9de984c9f38e --tenant 1cd7b2b6-e7d3-45d3-9a44-667af8e866d8

# check if service plan already exists
servicePlanSearchResult="$(az appservice plan list -g PersonalQuizDemo --subscription Pay-as-you-go --query '[].{name: name}' | grep PersonalQuizDemoServicePlan)"

if [ -z "$servicePlanSearchResult"]
then 
    echo "creating service plan"
     az appservice plan create -g PersonalQuizDemo -n PersonalQuizDemoServicePlan -l centralus --sku b1 -
-subscription Pay-as-you-go --is-linux
    sleep 10s 
    echo "10 seconds after app service plan created"
else
    echo "service plan already exists"
fi

# create service plan
