# GraphHopper Routing Server Setup

FlockHopper uses [GraphHopper](https://www.graphhopper.com/) for route calculation. This guide explains how to set up the local routing server.

## Prerequisites

- Java 11 or higher
- At least 32GB RAM (28GB allocated to GraphHopper for US data)
- ~15GB free disk space for OSM data and graph cache

## Quick Start

1. **Download GraphHopper**

   Download the GraphHopper Web JAR (version 9.1 or 10.0):
   ```bash
   wget https://repo1.maven.org/maven2/com/graphhopper/graphhopper-web/9.1/graphhopper-web-9.1.jar
   ```

2. **Download OpenStreetMap Data**

   For full US coverage (~11.6GB):
   ```bash
   wget https://download.geofabrik.de/north-america/us-latest.osm.pbf
   ```

   For testing with a smaller dataset (Ohio only, ~300MB):
   ```bash
   wget https://download.geofabrik.de/north-america/us/ohio-latest.osm.pbf
   ```

   > Update `config.yml` if using a different OSM file:
   > ```yaml
   > graphhopper:
   >   datareader.file: ohio-latest.osm.pbf
   > ```

3. **Start the Server**

   ```bash
   ./start.sh
   ```

   Or manually:
   ```bash
   java -Xmx28g -jar graphhopper-web-9.1.jar server config.yml
   ```

4. **Verify Installation**

   The API should be available at http://localhost:8989

   Test with:
   ```bash
   curl "http://localhost:8989/route?point=40.7128,-74.0060&point=40.7580,-73.9855&profile=car"
   ```

## Configuration

The `config.yml` file contains all GraphHopper settings:

| Setting | Description |
|---------|-------------|
| `datareader.file` | Path to OSM data file |
| `graph.location` | Directory for graph cache (generated on first run) |
| `profiles` | Routing profiles (car, bike, foot) |
| `server.port` | API port (default: 8989) |

## Memory Requirements

| Dataset | OSM File Size | RAM Required | Graph Build Time |
|---------|---------------|--------------|------------------|
| Ohio | ~300MB | 4GB | ~5 minutes |
| Full US | ~11.6GB | 28GB | ~2-3 hours |

## First Run

On first startup, GraphHopper will:
1. Parse the OSM file
2. Build a routing graph
3. Save the graph to `graph-cache/`

This process takes significant time for large datasets. Subsequent startups will be much faster as the cached graph is loaded.

## Troubleshooting

**Out of Memory Error**
- Increase the `-Xmx` value in `start.sh`
- Use a smaller regional OSM file for testing

**Port Already in Use**
- Change the port in `config.yml` under `server.application_connectors`

**Slow Route Calculations**
- The current config disables CH/LM preprocessing to allow custom models per-request
- This is required for FlockHopper's camera avoidance features

## Alternative: Use a Remote GraphHopper Instance

If you can't run GraphHopper locally, set the `VITE_GRAPHHOPPER_ENDPOINT` environment variable to point to a remote instance.
