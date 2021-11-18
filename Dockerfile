FROM node
WORKDIR /usr/src/app
COPY app /usr/src/app/
RUN npm install
EXPOSE 4000
CMD ["node","server.js"]