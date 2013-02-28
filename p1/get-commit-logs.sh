#!/bin/bash


################################################
#
# Iterating over files in a current directory 
#
################################################

dir=`pwd`

for file in `ls ${dir}`; do
    if [[ -e $file ]]; then
        echo $file
        git log --all -p $file > $file.commit.log
    fi
done

