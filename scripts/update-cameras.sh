#!/bin/bash
#
# update-cameras.sh - Fetches latest ALPR camera data from OpenStreetMap
#
# Usage: ./scripts/update-cameras.sh
#
# This script queries the Overpass API for all ALPR cameras in the US
# and updates the public/cameras-us.json file.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
OUTPUT_FILE="$PROJECT_ROOT/public/cameras-us.json"
TEMP_FILE="$PROJECT_ROOT/public/cameras-us.json.tmp"

# Overpass API endpoints (fallback order)
OVERPASS_ENDPOINTS=(
    "https://overpass-api.de/api/interpreter"
    "https://overpass.kumi.systems/api/interpreter"
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter"
)

# Overpass query for US ALPR cameras (nodes and ways)
OVERPASS_QUERY='[out:json][timeout:300];
area["ISO3166-1"="US"]->.usa;
(
  node["man_made"="surveillance"]["surveillance:type"="ALPR"](area.usa);
  way["man_made"="surveillance"]["surveillance:type"="ALPR"](area.usa);
);
out body;
>;
out skel qt;'

echo "========================================"
echo "ALPR Camera Data Update Script"
echo "========================================"
echo ""
echo "Fetching latest data from OpenStreetMap..."
echo "This may take 1-3 minutes depending on server load."
echo ""

# Try each endpoint until one succeeds
SUCCESS=false
for ENDPOINT in "${OVERPASS_ENDPOINTS[@]}"; do
    echo "Trying: $ENDPOINT"

    HTTP_CODE=$(curl -s -o "$TEMP_FILE" -w "%{http_code}" \
        -X POST "$ENDPOINT" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -H "User-Agent: RoamRouter/1.0 (ALPR Camera Router)" \
        --data-urlencode "data=$OVERPASS_QUERY" \
        --max-time 300)

    if [ "$HTTP_CODE" -eq 200 ]; then
        # Verify the response is valid JSON with elements
        if python3 -c "import json; data=json.load(open('$TEMP_FILE')); assert 'elements' in data and len(data['elements']) > 0" 2>/dev/null; then
            SUCCESS=true
            echo "Success!"
            break
        else
            echo "Invalid response (not valid JSON or empty), trying next endpoint..."
        fi
    else
        echo "Failed with HTTP $HTTP_CODE, trying next endpoint..."
    fi

    rm -f "$TEMP_FILE"
    sleep 2
done

if [ "$SUCCESS" = false ]; then
    echo ""
    echo "ERROR: All Overpass API endpoints failed."
    echo "Please try again later or check your internet connection."
    exit 1
fi

echo ""
echo "Processing data..."

# Transform Overpass response to our camera format
python3 -c "
import json
import sys

input_file = '$TEMP_FILE'
output_file = '$OUTPUT_FILE'

# Read Overpass response
with open(input_file, 'r') as f:
    data = json.load(f)

# Parse direction value
def parse_direction(direction_str):
    if not direction_str:
        return None
    cardinals = {
        'N': 0, 'NNE': 22.5, 'NE': 45, 'ENE': 67.5,
        'E': 90, 'ESE': 112.5, 'SE': 135, 'SSE': 157.5,
        'S': 180, 'SSW': 202.5, 'SW': 225, 'WSW': 247.5,
        'W': 270, 'WNW': 292.5, 'NW': 315, 'NNW': 337.5
    }
    if direction_str.upper() in cardinals:
        return cardinals[direction_str.upper()]
    try:
        if ';' in str(direction_str):
            direction_str = str(direction_str).split(';')[0]
        return float(direction_str)
    except (ValueError, TypeError):
        return None

nodes_by_id = {}
for el in data.get('elements', []):
    if el.get('type') == 'node':
        nodes_by_id[el['id']] = el

cameras = []
for el in data.get('elements', []):
    el_type = el.get('type')
    tags = el.get('tags', {})

    if tags.get('man_made') != 'surveillance':
        continue
    if tags.get('surveillance:type') != 'ALPR':
        continue

    lat = el.get('lat')
    lon = el.get('lon')

    if el_type == 'way' and 'nodes' in el:
        way_nodes = [nodes_by_id.get(n) for n in el['nodes'] if n in nodes_by_id]
        if way_nodes:
            lat = sum(n['lat'] for n in way_nodes) / len(way_nodes)
            lon = sum(n['lon'] for n in way_nodes) / len(way_nodes)

    if lat is None or lon is None:
        continue

    direction_tag = tags.get('direction') or tags.get('camera:direction')
    direction = parse_direction(direction_tag) if direction_tag else None

    camera = {
        'osmId': el['id'],
        'osmType': el_type,
        'lat': lat,
        'lon': lon
    }

    if tags.get('operator'):
        camera['operator'] = tags['operator']
    if tags.get('brand') or tags.get('manufacturer'):
        camera['brand'] = tags.get('brand') or tags.get('manufacturer')
    if direction is not None:
        camera['direction'] = direction
    if direction_tag:
        camera['directionCardinal'] = direction_tag
    if tags.get('surveillance:zone'):
        camera['surveillanceZone'] = tags['surveillance:zone']
    if tags.get('camera:mount'):
        camera['mountType'] = tags['camera:mount']
    if tags.get('ref'):
        camera['ref'] = tags['ref']
    if tags.get('start_date'):
        camera['startDate'] = tags['start_date']

    cameras.append(camera)

cameras.sort(key=lambda c: c['osmId'])

with open(output_file, 'w') as f:
    json.dump(cameras, f, separators=(',', ':'))

print(f'Total cameras: {len(cameras)}')
"

# Clean up temp file
rm -f "$TEMP_FILE"

# Get file size
FILE_SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')

echo ""
echo "========================================"
echo "Update Complete!"
echo "========================================"
echo "Output: $OUTPUT_FILE"
echo "Size: $FILE_SIZE"
echo "Updated: $(date)"
echo ""
echo "Next steps:"
echo "  1. Run 'npm run build' to include updated data in your build"
echo "  2. Deploy your updated site"
echo ""
