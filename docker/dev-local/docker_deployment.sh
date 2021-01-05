# Create a data volume
docker run --name pdp_data \
    -v /storage/data/climate/downscale:/storage/data/climate/downscale:ro \
    -v /storage/data/climate/hydrology:/storage/data/climate/hydrology:ro \
    -v /storage/data/climate/observations:/storage/data/climate/observations:ro \
    -v /storage/data/climate/PRISM:/storage/data/climate/PRISM:ro \
    -v /storage/data/projects/dataportal:/storage/data/projects/dataportal:ro \
    -v /storage/data/projects/hydrology:/storage/data/projects/hydrology:ro \
    -v /storage/data/projects/PRISM:/storage/data/projects/PRISM:ro \
ubuntu:16.04

docker-compose up -d
