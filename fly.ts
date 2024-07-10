#! /usr/bin/env -S deno run --allow-write

import TOML from "npm:smol-toml@1.2";

export { };

const
  // Fly supports haProxy style ip forwarding, but it needs a few config changes
  // to make work
  // Specifically, you need to make it so Paper, the minecraft server, is aware of
  // the proxy running, so it can remap connections.
  // This handles all that automatically
  enableProxy = true,
  // Enable BlueMap. This sets up a HTTPs port in your fly config, and loads bluemap
  enableBlueMap = true,
  // Configure your plugins here
  plugins = [
    // "https://cdn.modrinth.com/data/1u6JkXh5/versions/VaMk0SQH/worldedit-bukkit-7.3.2.jar",
    "https://cdn.modrinth.com/data/Lu3KuzdV/versions/llmrc4cl/CoreProtect-22.4.jar",
    "https://cdn.modrinth.com/data/MubyTbnA/versions/vbGiEu4k/FreedomChat-Paper-1.6.0.jar",
    "https://cdn.modrinth.com/data/RPOSBQgq/versions/E7jCNr0p/itemswapperplugin-0.2.1-SNAPSHOT.jar",
    "https://ci.dmulloy2.net/job/ProtocolLib/lastSuccessfulBuild/artifact/build/libs/ProtocolLib.jar",
    "https://github.com/jmattingley23/AppleSkinSpigot/releases/download/latest/AppleSkinSpigot-1.2.0.jar",
    "https://github.com/MiniPlaceholders/MiniPlaceholders/releases/download/2.2.4/MiniPlaceholders-Paper-2.2.4.jar",
    "https://hangarcdn.papermc.io/plugins/EngineHub/CraftBook/versions/5.0.0-beta-03/PAPER/craftbook-bukkit-5.0.0-beta-03.jar",
    "https://hangarcdn.papermc.io/plugins/LOOHP/ImageFrame/versions/1.7.9/PAPER/ImageFrame-1.7.9.0.jar",
    "https://hangarcdn.papermc.io/plugins/Multiverse/Multiverse-Core/versions/4.3.12/PAPER/multiverse-core-4.3.12.jar",
    "https://hangarcdn.papermc.io/plugins/Multiverse/Multiverse-Inventories/versions/4.2.6/PAPER/multiverse-inventories-4.2.6.jar",
    "https://hangarcdn.papermc.io/plugins/Multiverse/Multiverse-NetherPortals/versions/4.2.3/PAPER/multiverse-netherportals-4.2.3.jar",
    "https://hangarcdn.papermc.io/plugins/Multiverse/Multiverse-Portals/versions/4.2.3/PAPER/multiverse-portals-4.2.3.jar",
    "https://hangarcdn.papermc.io/plugins/NanoFlux/Networks/versions/2.1.8/PAPER/Networks-2.1.8.jar",
    "https://hangarcdn.papermc.io/plugins/Vicarious/Carbon/versions/3.0.0-beta.27/PAPER/carbonchat-paper-3.0.0-beta.27.jar",

    "https://ci.athion.net/job/FastAsyncWorldEdit/lastSuccessfulBuild/artifact/artifacts/FastAsyncWorldEdit-Bukkit-2.11.1-SNAPSHOT-846.jar",
    "https://modrinth.com/plugin/fastasyncvoxelsniper/version/3.2.0",

  ],
  spigetPlugins = [
    "https://www.spigotmc.org/resources/chestsort-api.59773/",
    "https://www.spigotmc.org/resources/invunload.60095/",
    "https://www.spigotmc.org/resources/luckperms.28140/",
    "https://www.spigotmc.org/resources/placeholderapi.6245/",
    "https://www.spigotmc.org/resources/slot-machine.22023/",
    "https://www.spigotmc.org/resources/cmilib.87610/",
  ],
  bluemap = enableBlueMap ? ["https://hangarcdn.papermc.io/plugins/Blue/BlueMap/versions/5.2/PAPER/BlueMap-5.2-paper.jar", "https://github.com/Mark-225/BlueBridge/releases/download/2.1/BlueBridgeCore-2.1.jar"] : []



const generalEnv = {
  MAX_MEMORY: "7G",
  TZ: "America/Denver",
  ENABLE_ROLLING_LOGS: "TRUE",
  CREATE_CONSOLE_IN_PIPE: "true",
  REPLACE_ENV_VARIABLE_PREFIX: "",
}

const minecraftEnv = {
  EULA: "TRUE",
  TYPE: "paper",
  VERSION: "1.20.6",
  SERVER_NAME: "PDX",
  MOTD: "wew lad",
  DIFFICULTY: "normal",
  ICON: "/data/icon.png",
  OVERWRITE_ICON: "TRUE",
  ENFORCE_SECURE_PROFILE: "FALSE",
  FORCE_GAMEMODE: "FALSE",
  INITIAL_ENABLED_PACKS: "update_1_21,bundle",
  ALLOW_FLIGHT: "TRUE",
  ENABLE_COMMAND_BLOCK: "TRUE",
  SNOOPER_ENABLED: "FALSE",
  SEED: "5539391629669013873",
  PATCH_DEFINITIONS: "/config_patches/",
}

const autoStopEnv = {
  ENABLE_AUTOSTOP: "TRUE",
  AUTOSTOP_TIMEOUT_EST: "600",
  AUTOSTOP_TIMEOUT_INIT: "600",
  AUTOSTOP_PKILL_USE_SUDO: "TRUE",
  USES_PROXY_PROTOCOL: enableProxy ? "TRUE" : "FALSE",
}

const flyProxyConf = enableProxy ? {
  handlers: ["proxy_proto"],
  proxy_proto_options: { version: "v2" }
} : {};

const blueMapConfig = {
  internal_port: 8080,
  force_https: true,
  auto_stop_machines: false,
  auto_start_machines: false,
}

const config = {
  app: "pdx-minecraft",
  primary_region: "phx",
  build: { dockerfile: "Dockerfile" },
  mounts: {
    source: "pdx_minecraft_data",
    destination: "/data",
    initial_size: "15"
  },
  vm: [{ size: "shared-cpu-8x", memory: "8gb", cpus: 4 }],
  http_service: enableBlueMap ? blueMapConfig : null,
  services: [
    {
      internal_port: 25565,
      protocol: "tcp",
      auto_stop_machines: false,
      auto_start_machines: false,
      ports: [
        {
          port: 25565,
          ...flyProxyConf,
        }
      ]
    }
  ],
  env: {
    ...generalEnv,
    ...minecraftEnv,
    ...autoStopEnv,
    ...pluginEnvs(),

  }
}

function pluginEnvs() {
  const pluginSum = [
    ...plugins,
    ...bluemap,
  ]
  return {
    PLUGINS: pluginSum.join(","),
    SPIGET_RESOURCES: spigetPlugins.map((x) => x.match(/.*?\.(\d+)\/$/)![1]!).join(",")
  }
}

const manual_comment = `
# THIS FILE IS AUTOMATICALLY GENERATED VIA THE fly.ts SCRIPT
# YOU SHOULD NOT EDIT IT BY HAND
`;

const outputs = [
  manual_comment,
  TOML.stringify(config),
].map((x) => x.trim()).join("\n");

await Deno.writeTextFile("fly.toml", outputs);

console.log("Generated new fly.toml file\n");
