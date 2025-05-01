#!/bin/bash
/wait-for-it.sh apostrophe:3000 -t 60 -- sh -c 'wget -qO- http://apostrophe:3000/ > /dev/null && exec npx playwright test "$@"' _ "$@"