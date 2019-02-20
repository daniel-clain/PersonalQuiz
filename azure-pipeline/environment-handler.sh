#!/bin/bash
#set -e # this stops the rest of the script running if error occurs


webappName=$1

# login with service principal
az login --service-principal -u cea2f026-123a-454a-b107-6c389df9eeae -p 62b7b43f-a0a2-46a5-b6a9-9de984c9f38e --tenant 1cd7b2b6-e7d3-45d3-9a44-667af8e866d8

# check if service plan already exists
servicePlanSearchResult="$(az appservice plan list -g PersonalQuizDemo --subscription Pay-as-you-go --query '[].{name: name}' | grep PersonalQuizDemoServicePlan)"

echo service plan result $servicePlanSearchResult

# if will be true if result is empty string
if [ -z "$servicePlanSearchResult" ]
then 
    echo "creating service plan"
    # create service plan
    az appservice plan create -g PersonalQuizDemo -n PersonalQuizDemoServicePlan -l centralus --sku b1 --subscription Pay-as-you-go --is-linux
    
else
    echo "service plan already exists"
fi

# check if webapp already exists
echo "checking if web app already exists"
webappSearchResult="$(az webapp list -g PersonalQuizDemo --subscription Pay-as-you-go --query '[].{name: name}' | grep $webappName)"

echo "webapp search result $webappSearchResult"

# if will be true if result is empty string
if [ -z "$webappSearchResult" ]
then
    echo "webapp for $webappName does not yet exist, will run create webapp script for $webappName"
    az webapp create -g PersonalQuizDemo -p /subscriptions/128d0d36-e082-43a5-b249-6c888e8e7f62/resourceGroups/PersonalQuizDemo/providers/Microsoft.Web/serverfarms/PersonalQuizDemoServicePlan --subscription Pay-as-you-go  -n ${webappName} -i danielclain/${webappName}-image
    echo "after webapp plan created"
else
    echo "webapp for $webappName already exists, no need to run create webapp script for $webappName"
fi

# Script to remove service plan and web app
#az appservice plan delete -g PersonalQuizDemo -n PersonalQuizDemoServicePlan
#az webapp delete -g PersonalQuizDemo -n ${webappName}


