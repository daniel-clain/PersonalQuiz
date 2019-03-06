#!/bin/bash

string='TOP-446_Pipeline_for_feature_branches'

regex="TOP-([0-9]*)"


if [[ $string =~ $regex ]]; then
    echo ${BASH_REMATCH[1]}
else
    echo "oops"
    echo ${BASH_REMATCH[1]}
fi


