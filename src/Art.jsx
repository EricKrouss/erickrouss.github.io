import React from "react";

// Archived Windows 98 bitmaps. Source details and copyright notices are in
// public/asset-credits.html. Pick the native 16px or 32px variant before scaling.
const icons = {
  computer: ["computer_explorer-0", "computer_explorer-2"],
  folder: ["directory_closed-1", "directory_closed-0"],
  terminal: ["console_prompt-1", "console_prompt-0"],
  network: ["network_normal_two_pcs-1", "network_normal_two_pcs-0"],
  note: ["notepad-0", "notepad-4"],
  disk: ["hard_disk_drive-1", "hard_disk_drive-0"],
  mail: ["mailbox_world-1", "mailbox_world-0"],
  trash: ["recycle_bin_full-5", "recycle_bin_full-0"],
  play: ["media_player-1", "media_player-0"],
  shield: ["certificate-1", "certificate-0"],
  gear: ["settings_gear-5", "settings_gear-0"],
  favorites: ["directory_favorites-5", "directory_favorites-4"],
  help: ["help_book_big-1", "help_book_big-0"],
  search: ["search_file-2", "search_file-0"],
  shutdown: ["shut_down_normal-1", "shut_down_normal-0"],
};

export function Icon({
  name = "computer",
  size = 16,
  className = "",
  ...props
}) {
  const variants = icons[name] || icons.computer;
  return (
    <img
      src={
        name === "ie"
          ? "/assets/win98/internet-explorer.png"
          : name === "dos"
            ? "/assets/dos/msdos.png"
            : name === "start"
              ? "/assets/win98/start.png"
              : name === "block"
                ? "/assets/period/minecraft-launcher.png"
                : name === "youtube"
                  ? "/assets/period/youtube-2005-2009.png"
                  : `/assets/win98/${variants[size > 20 ? 1 : 0]}.png`
      }
      width={size}
      height={name === "start" ? Math.round((size * 14) / 16) : size}
      alt=""
      aria-hidden="true"
      className={`system-icon ${className}`}
      draggable="false"
      {...props}
    />
  );
}

export function DesktopComputer() {
  return (
    <img
      className="desktop-computer"
      src="/assets/win98/computer_explorer-4.png"
      width="144"
      height="144"
      alt="The original Windows 98 My Computer icon"
      draggable="false"
    />
  );
}

export function MinecraftArtwork() {
  return (
    <img
      className="minecraft-artwork"
      src="/assets/period/minecraft-animals.png"
      width="300"
      height="202"
      alt="Steve, a pig and a sheep — artwork from Minecraft Oldschool Edition"
    />
  );
}
