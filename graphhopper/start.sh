#!/bin/bash
# Start GraphHopper routing server
# Usage: ./start.sh

cd "$(dirname "$0")"

echo "Starting GraphHopper..."
echo "API will be available at http://localhost:8989"
echo ""

# US data requires more memory - allocate 28GB for full USA dataset
java -Xmx28g -jar graphhopper-web-9.1.jar server config.yml

