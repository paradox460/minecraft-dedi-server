FROM itzg/minecraft-server:latest

RUN apt-get -y update && apt-get -y install neovim fish ranger tmux && chsh -s /usr/bin/fish
COPY config.fish /root/.config/fish/config.fish
COPY config_patches/ /config_patches
COPY plugins/ /plugins
ENV EDITOR=nvim
