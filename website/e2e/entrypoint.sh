#!/bin/bash
/wait-for-it.sh apostrophe:3000 -t 60 -- npx playwright test "$@" 