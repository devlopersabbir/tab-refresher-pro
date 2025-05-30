#!/bin/sh

# Print header
echo -e "\033[32m=== Git File Selector ===\033[0m"
echo -e "\033[3mSelect a file to commit from the list below:\033[0m"
echo ""

# Function to list modified and untracked files
get_git_files() {
    modified=$(git status --porcelain | grep '^[AM] ' | awk '{print $2}')
    untracked=$(git status --porcelain | grep '^\?\? ' | awk '{print $2}')
    
    # Combine and output the list
    echo "$modified"
    echo "$untracked"
}

# Get list of files
files=$(get_git_files)

# Check if there are any files
if [ -z "$files" ]; then
    echo -e "\033[31mNo modified or untracked files found.\033[0m"  # Red text
    exit 1
fi

# Create a select menu
echo "Select a file to commit:"
select filePath in $files; do
    if [ -n "$filePath" ]; then
        echo -e "\033[32mYou selected: $filePath\033[0m"
        break
    else
        echo -e "\033[31mInvalid selection. Please try again.\033[0m"
    fi
done

# Prompt for commit message and date
echo -e "\033[1mEnter the commit message:\033[0m"
read commitMessage

echo -e "\033[1mEnter the date (YYYY-MM-DD):\033[0m"
read date

# Now you can run your JavaScript with the selected file path
echo -e "\033[34mProcessing your request...\033[0m"  # Blue text
sleep 1  # Simulate some processing time
node action.js "$filePath" "$commitMessage" "$date"

echo -e "\033[32mDone!\033[0m"