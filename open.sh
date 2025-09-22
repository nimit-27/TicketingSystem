#!/bin/bash

#Resolve the script's directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "${BASH_SOURCE[0]}"
echo "$(dirname "${BASH_SOURCE[0]}")"
echo "$SCRIPT_DIR"

# Define paths
REACT_DIR="$SCRIPT_DIR/ui"
JAVA_DIR="$SCRIPT_DIR/api"
IDEA="/c/Program Files/JetBrains/IntelliJ IDEA Community Edition 2025.2.1/bin/idea64.exe"

# Initial flags
open=false
run_react=false
run_java=false

# Parse arguments
for arg in "$@"; do
    echo "$arg"
    case "$arg" in
        -o|--open)
            open=true
            ;;
        -r|--run-react)
            run_react=true
            ;;
        -j|--run_java)
            run_java=true
            ;;
        -*)
            #Support combined short flags like -ors
            for((i=1; i<${#arg}; i++)); do
                ch="${arg:i:1}"
                case "$ch" in
                    o) open=true ;;
                    r) run_react=true ;;
                    j) run_java=true ;;
                    *) echo "Unknown flag: -$ch"; exit 1;;
                esac
            done
            ;;
        *) echo "Unknown argument: -$arg"; exit 1;;
    esac
done

#Execute actions
$open && (
    echo "📂 Opening UI and API in VSCode and Intellij respectively..."
    code "$REACT_DIR" >/dev/null 2>&1 &
    "$IDEA" "$JAVA_DIR" & 
)

$run_react && (
    echo "🚀 Starting React app.."
    wt -w 0 nt --title "React Server" bash -c "cd '$REACT_DIR' && npm start"
)

$run_java && (
    echo "🛠️ Starting Java backend server"
    wt -w 0 nt --title "React Server" bash -c "cd '$REACT_DIR' && npm start"
)

