#!/bin/bash

# Simple script to run npm dev script

echo "Starting the development server..."
npm run dev

# Check if npm run dev exited successfully
if [ $? -eq 0 ]; then
    echo "Development server started successfully."
else
    echo "Failed to start the development server."
    exit 1
fi
