#!/bin/bash
az login --service-principal -u cea2f026-123a-454a-b107-6c389df9eeae -p 62b7b43f-a0a2-46a5-b6a9-9de984c9f38e --tenant 1cd7b2b6-e7d3-45d3-9a44-667af8e866d8

az group list --subscription Pay-as-you-go --query '[].{name: name}'

echo 'done'