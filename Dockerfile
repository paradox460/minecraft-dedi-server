FROM itzg/minecraft-server:latest

RUN apt-get -y update && apt-get -y install neovim fish && chsh -s /usr/bin/fish
COPY config.fish /root/.config/fish/config.fish
