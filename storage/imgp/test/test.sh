#!/bin/bash

url=""

for i in {100..200}
do
   curl --write-out '%{http_code}' -s --output /dev/null "http://localhost:8000/${i}x0/https://images-na.ssl-images-amazon.com/images/M/MV5BMTUyMjM2NTgwNl5BMl5BanBnXkFtZTgwMTUzOTUwMjI@._V1_SX1777_CR0,0,1777,999_AL_.jpg"
done
