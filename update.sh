#!/bin/bash
cd /root/x-algo-Gpay
git pull origin main  # Replace 'main' with your actual branch if it's different
pm2 restart XAlgos # Replace 'your-app-name' with the name of your PM2 
