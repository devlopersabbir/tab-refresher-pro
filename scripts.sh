#!/bin/bash

# Define colors for terminal output
RESET='\033[0m'
BOLD='\033[1m'
UNDERLINE='\033[4m'
RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
BLUE='\033[34m'

# Define the path to the manifest file
manifestPath="src/manifest.json"
packagePath="package.json"

# Extract the extension name from the manifest file using jq
extensionName=$(jq -r '.name' "$manifestPath")
# Extract the extension version from the manifest file using jq
extensionVersion=$(jq -r '.version' "$packagePath")

# Check if jq was able to extract the extension name
if [ "$extensionName" = "null" ]; then
  echo -e "${RED}Error: Failed to extract the extension name from $manifestPath. Please check the manifest file.${RESET}"
  exit 1
fi

# Check if jq was able to extract the extension version
if [ "$extensionVersion" = "null" ]; then
  echo -e "${RED}Error: Failed to extract the extension version from $packagePath. Please check the package file.${RESET}"
  exit 1
fi

echo -e "${BLUE}${BOLD}Building ${extensionName} version ${extensionVersion}${RESET}"

# Check for the existence of the dist directory
if [[ -d dist ]]; then
  echo -e "${YELLOW}Removing existing dist directory...${RESET}"
  rm -rf dist  # Be cautious with rm -rf, ensure you're in the correct directory
else
  echo -e "${YELLOW}dist directory not found. Skipping removal.${RESET}"
fi

# Execute build command with basic error handling
echo -e "${BLUE}Building...${RESET}"
bun run build || {
  echo -e "${RED}Build failed! Check build logs for details.${RESET}"
  exit 1
}

# Define the zip file name
zipFileName="v${extensionVersion}.zip"

# Check if the zip file exists
if [[ -f $zipFileName ]]; then
  echo -e "${YELLOW}Removing existing ${zipFileName} file${RESET}"
  rm -f "$zipFileName"
else
  echo -e "${YELLOW}${zipFileName} file not found. Skipping removal.${RESET}"
fi

# Zip the contents of the dist directory but skip the dist directory itself
echo -e "${BLUE}Creating zip file...${RESET}"
(cd dist && zip -r "../$zipFileName" .) || {
  echo -e "${RED}Failed to create zip file.${RESET}"
  exit 1
}

# Define the released directory
releasedDir="release"

# Create the released directory if it does not exist
if [[ ! -d $releasedDir ]]; then
  echo -e "${YELLOW}Creating release directory...${RESET}"
  mkdir "$releasedDir"
fi

# Move the zip file into the released directory
echo -e "${BLUE}Moving $zipFileName to $releasedDir directory...${RESET}"
mv "$zipFileName" "$releasedDir/" || {
  echo -e "${RED}Failed to move $zipFileName to $releasedDir.${RESET}"
  exit 1
}

echo -e "${GREEN}${BOLD}Build finished successfully and zipped into $releasedDir/$zipFileName.${RESET}"