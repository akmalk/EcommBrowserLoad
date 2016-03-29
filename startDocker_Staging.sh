source localEnv_staging.sh

docker run -d --name staging_browser -e ECOMM_URL=${ECOMM_URL} -e EUM_URL=${EUM_URL} -e EUM_KEY=${EUM_KEY} appdynamics/ecommerce-browser-load:latest
