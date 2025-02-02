# Docker file to run go 1.21 as used for this project, latest one gives issues like this https://stackoverflow.com/questions/61980360/linkerror-webassembly-instantiate-import-1-module-go-function-runtime-re
# even fix like #`wasm_exec.js` mentioned in README did not work.
# Use official Go 1.21 image as base
FROM golang:1.21

# Install make, git, and Node.js
RUN apt-get update && \
    apt-get install -y make git curl sudo && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Verify installations
RUN go version && make --version && git --version && node -v && npm -v
RUN useradd -l -u 33333 -G sudo -md /home/gitpod -s /bin/bash -p gitpod gitpod

USER gitpod
# git config --global --add safe.directory '*'
# Set default command to display versions