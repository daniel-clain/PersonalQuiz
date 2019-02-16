#!/bin/bash
set -e # this stops the rest of the script running if error occurs

# login with service principal
az login --service-principal -u "d25b87f7-fb28-4651-8f24-afa6a3b96395" -p "37dc111c-643c-4b7f-aac8-6
848d84fcd34" --tenant "1cd7b2b6-e7d3-45d3-9a44-667af8e866d8"

# check if service plan already exists
servicePlanSearchResult="$(az appservice plan list -g PersonalQuizDemo --subscription Pay-as-you-go --query '[].{name: name}' | grep PersonalQuizDemoServicePlan)"

if [ -z "$servicePlanSearchResult"]
then 
    echo "creating service plan"
     az appservice plan create -g PersonalQuizDemo -n PersonalQuizDemoServicePlan -l centralus --sku b1 -
-subscription Pay-as-you-go --is-linux
else
    echo "service plan already exists"
fi

# create service plan
