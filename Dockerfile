# 1. Базовый образ с Node.js 18
FROM ubuntu:latest
LABEL authors="mrcrodo"

ENTRYPOINT ["top", "-b"]