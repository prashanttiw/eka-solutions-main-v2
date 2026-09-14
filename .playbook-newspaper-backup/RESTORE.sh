#!/bin/sh
# Undo the newspaper Playbook redesign and put the previous page back exactly as it was.
# Run from the project root:  sh .playbook-newspaper-backup/RESTORE.sh
set -e
cd "$(dirname "$0")/.."
cp .playbook-newspaper-backup/index.html index.html
cp .playbook-newspaper-backup/src/main.jsx src/main.jsx
cp .playbook-newspaper-backup/src/pages/PlaybookPage.jsx src/pages/PlaybookPage.jsx
rm -f src/newsprint.css
rm -rf src/components/broadsheet
echo "Playbook restored to the pre-newspaper design."
