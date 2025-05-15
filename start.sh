#!/bin/bash
# Define colors for terminal output
RESET='\033[0m'
BOLD='\033[1m'
UNDERLINE='\033[4m'
RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
BLUE='\033[34m'

echo "${GREEN} ${BOLD} Installing Dependency & start our project as development mode ${RESET}"

echo "//===========================================//"

echo "Remove ${BOLD} node modules"
rm -rf node_modules

echo "${BLUE} Install dependency ${RESET}"
bun i

echo "${BOLD} Run development server"
bun run dev