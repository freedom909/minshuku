#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if Redis is running
check_redis() {
    if ! command -v redis-cli &> /dev/null; then
        print_message $RED "Redis CLI not found. Please install Redis first."
        exit 1
    }

    if ! redis-cli ping &> /dev/null; then
        print_message $RED "Redis server is not running. Please start Redis first."
        exit 1
    }
}

# Function to start monitoring
start_monitor() {
    print_message $GREEN "Starting account lock monitor..."
    node monitor-locks.js
}

# Function to test account locking
test_lock() {
    local email=$1
    local attempts=$2
    
    if [ -z "$email" ]; then
        email="test@example.com"
    fi
    
    if [ -z "$attempts" ]; then
        attempts=6
    fi

    print_message $GREEN "Testing account locking for ${email} with ${attempts} attempts..."
    node test-account-lock.js "$email" "$attempts"
}

# Function to clear all locks
clear_locks() {
    print_message $YELLOW "Clearing all account locks..."
    redis-cli keys "auth:lockout:*" | xargs redis-cli del
    print_message $GREEN "All locks cleared."
}

# Function to show lock status for an email
show_status() {
    local email=$1
    
    if [ -z "$email" ]; then
        print_message $RED "Please provide an email address."
        return 1
    }

    print_message $GREEN "Checking lock status for ${email}..."
    redis-cli get "auth:lockout:${email}"
}

# Function to show help
show_help() {
    echo "Account Lock Management Script"
    echo "Usage:"
    echo "  ./manage-locks.sh [command] [options]"
    echo ""
    echo "Commands:"
    echo "  monitor              Start the lock monitoring dashboard"
    echo "  test [email] [n]     Test account locking with n attempts"
    echo "  clear               Clear all account locks"
    echo "  status [email]      Show lock status for an email"
    echo "  help                Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./manage-locks.sh monitor"
    echo "  ./manage-locks.sh test user@example.com 6"
    echo "  ./manage-locks.sh clear"
    echo "  ./manage-locks.sh status user@example.com"
}

# Main script logic
check_redis

case "$1" in
    "monitor")
        start_monitor
        ;;
    "test")
        test_lock "$2" "$3"
        ;;
    "clear")
        clear_locks
        ;;
    "status")
        show_status "$2"
        ;;
    "help"|"")
        show_help
        ;;
    *)
        print_message $RED "Unknown command: $1"
        show_help
        exit 1
        ;;
esac