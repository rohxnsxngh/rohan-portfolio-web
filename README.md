# Rohan Portfolio Page

Built in Astro, Threejs, etc.

# Fixed command that ensures even-numbered dimensions
# This adds "pad" to make dimensions even if needed

# For tennis_01.mov
ffmpeg -i public/videos/tennis_01.mov -c:v libx264 -crf 23 -preset medium -vf "scale=trunc(min(1280\,iw)/2)*2:trunc(min(720\,ih)/2)*2,setsar=1,transpose=2" -c:a aac -b:a 128k -movflags +faststart public/videos/tennis_01.mp4

# For tennis_02.mov
ffmpeg -i public/videos/tennis_02.mov -c:v libx264 -crf 23 -preset medium -vf "scale=trunc(min(1280\,iw)/2)*2:trunc(min(720\,ih)/2)*2,setsar=1,transpose=2" -c:a aac -b:a 128k -movflags +faststart public/videos/tennis_02.mp4

# For thumbnails
ffmpeg -i public/videos/tennis_01.mov -vf "transpose=2" -ss 00:00:02 -frames:v 1 public/videos/tennis_01_thumb.jpg
ffmpeg -i public/videos/tennis_02.mov -vf "transpose=2" -ss 00:00:02 -frames:v 1 public/videos/tennis_02_thumb.jpg

# Notes:
# 1. "trunc(min(1280\,iw)/2)*2" ensures width is always divisible by 2
# 2. "transpose=2" rotates the video 90° counterclockwise to fix the orientation
# 3. "setsar=1" ensures the sample aspect ratio is correct