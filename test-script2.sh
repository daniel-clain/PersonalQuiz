#!/bin/bash
echo hello
servicePlanSearchResult="$(az appservice plan list -g PersonalQuizDemo --subscription Pay-as-you-go --query '[].{name: name}' | grep PersonalQuizDemoServicePlan)"
echo $servicePlanSearchResult
