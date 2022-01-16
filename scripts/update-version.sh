#!/usr/bin/env sh

CURRENT_VERSION=$(node -p -e "require('./package.json').version")

if [ -n "$(git status --untracked-files=no --porcelain)" ]; 
then 
  echo "working tree is not clean, exit."
  exit 1
fi

if [ -n "$1" ];
then
  # --no-git-tag-version 
  yarn version --new-version $1 --no-verify
else
  yarn version --patch --no-verify
fi

NEW_VERSION=$(node -p -e "require('./package.json').version")

sed -i '' 's/\(window\.appVersion = \)"[0-9\.]*"/\1"'$NEW_VERSION'"/g' index.html
sed -i '' 's/const version = "[0-9\.]*";/const version = "'$NEW_VERSION'";/g' service-worker.js

git add index.html package.json service-worker.js
git commit --amend -m "bump to version ${NEW_VERSION}" --no-verify
echo bump to version $NEW_VERSION, add tag v$NEW_VERSION