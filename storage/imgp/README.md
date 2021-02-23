# Image Proxy

- limit image size max width 1024, height 2048
- limit remote image file size 4MB
- limit image content types ('image/gif', 'image/jpeg', 'image/png', 'image/webp')
- normalized url
- bad link image: return image instead of 500 error
- header cache (max-age)


### pm2
start with pm2

```
pm2 start src/server.js --max-memory-restart 512M
```
