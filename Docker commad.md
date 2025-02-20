# Build the Docker Images
docker-compose build

# Start the Containers
docker-compose up -d

# Check Running Containers
docker ps

# for down the docker 
docker-compose down

#remove all old pictures
docker system prune -af

# restart container   
docker-compose restart frontend


# for checking bugs
docker-compose logs backend

# stop 
docker stop <container_id>

# remove
docker rm <container_id>