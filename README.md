# streamme
StreamMe: An easy way to go live!

# configuration
### local
1. First, install redis in your machine. You can follow the steps defined in the [quickstart](https://redis.io/topics/quickstart).
2. once redis is installed, make sure to run redis with `redis-server`.
3. By default, the application will try to fetch the `REDIS_PORT` and `REDIS_HOST` environment variables or will user the common values for redis.
4. Run the application with `node server.js` or another node startup script.

### Remote
1. Make sure to have at least, one redis instance.
2. Setup the `REDIS_HOST` environment variable with the proper hostname or IP address for the redis server.
3. Setup the `REDIS_PORT` environment variable with the proper port number for the redis server.
4. Setup the `PORT` environment variable to the correct one (80 for http & 443 for https).
5. Deploy application to desired location using git.
