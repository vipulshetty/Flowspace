import { App } from "./App";
import { Player } from "./Player/Player";
import {
  Point,
  RealmData,
  SpriteMap,
  TilePoint,
  PlayerStatus,
  PresencePlayer,
  ActivityRecord,
  ActivityAction,
} from "./types";
import * as PIXI from "pixi.js";
import { server } from "../backend/server";
import { defaultSkin } from "./Player/skins";
import signal from "../signal";
import { createClient } from "../auth/client";
import { gsap } from "gsap";

// Modern map templates currently omit explicit impassable flags for wall sprites.
// We defensively mark those tiles as blocked so collision behaves as expected.
const AUTO_BLOCK_OBJECTS = new Set([
  "modern:wall_white",
  "modern:wall_grey",
  "modern:wall_beige",
  "modern:wall_blue",
  "modern:wall_green",
  "modern:wall_brick",
  "modern:wall_wood",
  "modern:wall_glass",
  // City wall variants commonly used in legacy templates
  "city:dark_bricks_v",
  "city:light_bricks_v",
  "city:dark_bricks_h",
  "city:light_bricks_h",
  "city:tl_bricks_v",
  "city:t_bricks_v",
  "city:tr_bricks_v",
  "city:l_bricks_v",
  "city:r_bricks_v",
  "city:bl_bricks_v",
  "city:b_bricks_v",
  "city:br_bricks_v",
]);

const AUTO_BLOCK_PREFIXES = ["modern_office:", "generic_office:"];

export class PlayApp extends App {
  private scale: number = 1.5;
  public player: Player;
  public blocked: Set<TilePoint> = new Set();
  public keysDown: string[] = [];
  private teleportLocation: Point | null = null;
  private fadeOverlay: PIXI.Graphics = new PIXI.Graphics();
  private fadeDuration: number = 0.5;
  public uid: string = "";
  public realmId: string = "";
  public players: { [key: string]: Player } = {};
  private disableInput: boolean = false;

  private kicked: boolean = false;

  private fadeTiles: SpriteMap = {};
  private fadeTileContainer: PIXI.Container = new PIXI.Container();
  private fadeAnimation: gsap.core.Tween | null = null;
  private currentPrivateAreaTiles: TilePoint[] = [];
  public proximityId: string | null = null;
  private presenceInterval: ReturnType<typeof setInterval> | null = null;
  private heatmapInterval: ReturnType<typeof setInterval> | null = null;
  private cachedPresence: PresencePlayer[] = [];
  private cachedActivity: ActivityRecord[] = [];

  constructor(
    uid: string,
    realmId: string,
    realmData: RealmData,
    username: string,
    skin: string = defaultSkin,
  ) {
    super(realmData);
    this.uid = uid;
    this.realmId = realmId;
    this.player = new Player(skin, this, username, true);
  }

  override async loadRoom(index: number) {
    this.players = {};
    await super.loadRoom(index);
    this.setUpBlockedTiles();
    this.setUpFadeTiles();
    this.spawnLocalPlayer();
    await this.syncOtherPlayers();
    this.displayInitialChatMessage();
  }

  private setUpFadeTiles = () => {
    this.fadeTiles = {};
    this.fadeTileContainer.removeChildren();

    for (const [key] of Object.entries(
      this.realmData.rooms[this.currentRoomIndex].tilemap,
    )) {
      const [x, y] = key.split(",").map(Number);
      const screenCoordinates = this.convertTileToScreenCoordinates(x, y);
      const tile: PIXI.Sprite = new PIXI.Sprite(
        PIXI.Assets.get("/sprites/faded-tile.png"),
      );
      tile.x = screenCoordinates.x;
      tile.y = screenCoordinates.y;
      this.fadeTileContainer.addChild(tile);
      this.fadeTiles[key as TilePoint] = tile;
    }
  };

  public fadeInTiles = (privateAreaId: string) => {
    // Stop any ongoing fade animation
    if (this.fadeAnimation) {
      this.fadeAnimation.kill();
    }

    this.currentPrivateAreaTiles = [];
    // get all tiles with privateAreaId
    const tiles = Object.entries(
      this.realmData.rooms[this.currentRoomIndex].tilemap,
    ).filter(([key, value]) => value.privateAreaId === privateAreaId);
    for (const [key] of tiles) {
      const tile = this.fadeTiles[key as TilePoint];
      tile.alpha = 0;
      this.currentPrivateAreaTiles.push(key as TilePoint);
    }

    this.fadeAnimation = gsap.to(this.fadeTileContainer, {
      alpha: 1,
      duration: 0.25,
      ease: "power2.out",
      onComplete: () => {
        this.fadeAnimation = null;
      },
    });
  };

  public fadeOutTiles = () => {
    // Stop any ongoing fade animation
    if (this.fadeAnimation) {
      this.fadeAnimation.kill();
    }

    this.fadeAnimation = gsap.to(this.fadeTileContainer, {
      alpha: 0,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        for (const key of this.currentPrivateAreaTiles) {
          const tile = this.fadeTiles[key];
          tile.alpha = 1;
        }
        this.fadeAnimation = null;
      },
    });
  };

  private async loadAssets() {
    await Promise.all([
      PIXI.Assets.load("/fonts/silkscreen.ttf"),
      PIXI.Assets.load("/fonts/nunito.ttf"),
      PIXI.Assets.load("/sprites/faded-tile.png"),
    ]);
  }

  private async syncOtherPlayers() {
    const { data, error } = await server.getPlayersInRoom(
      this.currentRoomIndex,
    );
    if (error) {
      console.error("Failed to get player positions in room:", error);
      return;
    }

    for (const player of data.players) {
      if (player.uid === this.uid) continue;
      this.updatePlayer(player.uid, player);
    }

    this.sortObjectsByY();
  }

  private async updatePlayer(uid: string, player: any) {
    if (uid in this.players) {
      if (this.players[uid].skin !== player.skin) {
        await this.players[uid].changeSkin(player.skin);
      }
      if (
        this.players[uid].currentTilePosition.x !== player.x ||
        this.players[uid].currentTilePosition.y !== player.y
      ) {
        this.players[uid].setPosition(player.x, player.y);
      }
      if (player.status) {
        this.players[uid].setStatus(player.status as PlayerStatus);
      }
    } else {
      const status = (player.status ?? "available") as PlayerStatus;
      await this.spawnPlayer(
        player.uid,
        player.skin,
        player.username,
        player.x,
        player.y,
        status,
      );
    }
  }

  private async spawnPlayer(
    uid: string,
    skin: string,
    username: string,
    x: number,
    y: number,
    status: PlayerStatus = "available",
  ) {
    const otherPlayer = new Player(skin, this, username);
    await otherPlayer.init();
    otherPlayer.setStatus(status);
    otherPlayer.setPosition(x, y);
    this.layers.object.addChild(otherPlayer.parent);
    this.players[uid] = otherPlayer;
    this.sortObjectsByY();
  }

  public async init() {
    await super.init();
    await this.loadAssets();
    await this.loadRoom(this.realmData.spawnpoint.roomIndex);
    this.app.stage.eventMode = "static";
    this.setScale(this.scale);
    this.app.renderer.on("resize", this.resizeEvent);
    this.fadeTileContainer.alpha = 0;
    this.app.stage.addChild(this.fadeTileContainer);
    this.clickEvents();
    this.setUpKeyboardEvents();
    this.setUpFadeOverlay();
    this.setUpSignalListeners();
    this.setUpSocketEvents();

    this.startPresenceHeartbeat();
    this.startHeatmapTracking();

    this.fadeOut();
  }

  private spawnLocalPlayer = async () => {
    await this.player.init();

    if (this.teleportLocation) {
      this.player.setPosition(this.teleportLocation.x, this.teleportLocation.y);
    } else {
      this.player.setPosition(
        this.realmData.spawnpoint.x,
        this.realmData.spawnpoint.y,
      );
    }
    this.layers.object.addChild(this.player.parent);
    this.moveCameraToPlayer();
    signal.emit("localStatusUpdate", this.player.getStatus());
  };

  private startPresenceHeartbeat = () => {
    // Ping server with heartbeat every 30s
    if (this.presenceInterval) return;
    this.presenceInterval = setInterval(() => {
      server.socket.emit("heartbeat", {});
    }, 30000);
  };

  private startHeatmapTracking = () => {
    if (this.heatmapInterval) return;
    // Track position every 5 seconds
    this.heatmapInterval = setInterval(() => {
      const pos = this.player.currentTilePosition;
      server.socket.emit("trackPosition", {
        roomIndex: this.currentRoomIndex,
        x: pos.x,
        y: pos.y,
      });
    }, 5000);
  };

  private setScale = (newScale: number) => {
    this.scale = newScale;
    this.app.stage.scale.set(this.scale);
  };

  public moveCameraToPlayer = () => {
    const x = this.player.parent.x - this.app.screen.width / 2 / this.scale;
    const y = this.player.parent.y - this.app.screen.height / 2 / this.scale;
    this.app.stage.pivot.set(x, y);
    this.updateFadeOverlay(x, y);
  };

  private updateFadeOverlay = (x: number, y: number) => {
    this.fadeOverlay.clear();
    this.fadeOverlay.rect(
      0,
      0,
      this.app.screen.width * (1 / this.scale),
      this.app.screen.height * (1 / this.scale),
    );
    this.fadeOverlay.fill(0x0f0f0f);
    this.fadeOverlay.pivot.set(-x, -y);
  };

  private resizeEvent = () => {
    this.moveCameraToPlayer();
  };

  private setUpFadeOverlay = () => {
    this.fadeOverlay.rect(
      0,
      0,
      this.app.screen.width * (1 / this.scale),
      this.app.screen.height * (1 / this.scale),
    );
    this.fadeOverlay.fill(0x0f0f0f);
    this.app.stage.addChild(this.fadeOverlay);
  };

  private setUpBlockedTiles = () => {
    this.blocked = new Set<TilePoint>();

    for (const [key, value] of Object.entries(
      this.realmData.rooms[this.currentRoomIndex].tilemap,
    )) {
      const tileKey = key as TilePoint;
      if (value.impassable) {
        this.blocked.add(tileKey);
        continue;
      }

      const objectName = value.object;
      if (objectName) {
        const isExplicitAutoBlock = AUTO_BLOCK_OBJECTS.has(objectName);
        const matchesAutoBlockPrefix = AUTO_BLOCK_PREFIXES.some((prefix) =>
          objectName.startsWith(prefix),
        );

        if ((isExplicitAutoBlock || matchesAutoBlockPrefix) && value.impassable !== false) {
          this.blocked.add(tileKey);
          continue;
        }
      }
    }

    for (const [key, value] of Object.entries(this.collidersFromSpritesMap)) {
      if (value) {
        this.blocked.add(key as TilePoint);
      }
    }
  };

  private clickEvents = () => {
    this.app.stage.on("pointerdown", (e: PIXI.FederatedPointerEvent) => {
      if (this.player.frozen || this.disableInput) return;

      const clickPosition = e.getLocalPosition(this.app.stage);
      const { x, y } = this.convertScreenToTileCoordinates(
        clickPosition.x,
        clickPosition.y,
      );
      this.player.moveToTile(x, y);
      this.player.setMovementMode("mouse");
    });
  };

  private setUpKeyboardEvents = () => {
    document.addEventListener("keydown", this.keydown);
    document.addEventListener("keyup", this.keyup);
  };

  private keydown = (event: KeyboardEvent) => {
    if (this.keysDown.includes(event.key) || this.disableInput) return;
    this.player.keydown(event);
    this.keysDown.push(event.key);
  };

  private keyup = (event: KeyboardEvent) => {
    this.keysDown = this.keysDown.filter((key) => key !== event.key);
  };

  public teleportIfOnTeleportSquare = (x: number, y: number) => {
    const tile = `${x}, ${y}` as TilePoint;
    const teleport =
      this.realmData.rooms[this.currentRoomIndex].tilemap[tile]?.teleporter;
    if (teleport) {
      this.teleport(teleport.roomIndex, teleport.x, teleport.y);
      return true;
    }
    return false;
  };

  private teleport = async (roomIndex: number, x: number, y: number) => {
    this.player.setFrozen(true);
    await this.fadeIn();
    if (this.currentRoomIndex === roomIndex) {
      this.player.setPosition(x, y);
      this.moveCameraToPlayer();
    } else {
      this.teleportLocation = { x, y };
      this.currentRoomIndex = roomIndex;
      this.player.changeAnimationState("idle_down");
      await this.loadRoom(roomIndex);
    }

    server.socket.emit("teleport", { x, y, roomIndex });

    this.player.setFrozen(false);
    this.fadeOut();
  };

  public hasTeleport = (x: number, y: number) => {
    const tile = `${x}, ${y}` as TilePoint;
    return this.realmData.rooms[this.currentRoomIndex].tilemap[tile]
      ?.teleporter;
  };

  private fadeIn = () => {
    PIXI.Ticker.shared.remove(this.fadeOutTicker);
    this.fadeOverlay.alpha = 0;
    return new Promise<void>((resolve) => {
      const fadeTicker = ({ deltaTime }: { deltaTime: number }) => {
        this.fadeOverlay.alpha += deltaTime / 60 / this.fadeDuration;
        if (this.fadeOverlay.alpha >= 1) {
          this.fadeOverlay.alpha = 1;
          PIXI.Ticker.shared.remove(fadeTicker);
          resolve();
        }
      };

      PIXI.Ticker.shared.add(fadeTicker);
    });
  };

  private fadeOut = () => {
    PIXI.Ticker.shared.add(this.fadeOutTicker);
  };

  private fadeOutTicker = ({ deltaTime }: { deltaTime: number }) => {
    this.fadeOverlay.alpha -= deltaTime / 60 / this.fadeDuration;
    if (this.fadeOverlay.alpha <= 0) {
      this.fadeOverlay.alpha = 0;
      PIXI.Ticker.shared.remove(this.fadeOutTicker);
    }
  };

  private destroyPlayers = () => {
    for (const player of Object.values(this.players)) {
      player.destroy();
    }
    this.player.destroy();
  };

  private onPlayerLeftRoom = (uid: string) => {
    if (this.players[uid]) {
      this.players[uid].destroy();
      this.layers.object.removeChild(this.players[uid].parent);
      delete this.players[uid];
    }
  };

  private onPlayerJoinedRoom = (playerData: any) => {
    this.updatePlayer(playerData.uid, playerData);
  };

  private onPlayerMoved = (data: any) => {
    if (this.blocked.has(`${data.x}, ${data.y}`)) return;

    const player = this.players[data.uid];
    if (player) {
      player.moveToTile(data.x, data.y);
    }
  };

  private onPlayerTeleported = (data: any) => {
    const player = this.players[data.uid];
    if (player) {
      player.setPosition(data.x, data.y);
    }
  };

  private onPlayerChangedSkin = (data: any) => {
    const player = this.players[data.uid];
    if (player) {
      player.changeSkin(data.skin);
    }
    signal.emit("video-skin", {
      skin: data.skin,
      uid: data.uid,
    });
  };

  private setUpSignalListeners = () => {
    signal.on("requestSkin", this.onRequestSkin);
    signal.on("switchSkin", this.onSwitchSkin);
    signal.on("disableInput", this.onDisableInput);
    signal.on("message", this.onMessage);
    signal.on("getSkinForUid", this.getSkinForUid);
    signal.on("requestStatusChange", this.onRequestStatusChange);
    signal.on("standUpRequest", this.onStandUpRequest);
  };

  private removeSignalListeners = () => {
    signal.off("requestSkin", this.onRequestSkin);
    signal.off("switchSkin", this.onSwitchSkin);
    signal.off("disableInput", this.onDisableInput);
    signal.off("message", this.onMessage);
    signal.off("getSkinForUid", this.getSkinForUid);
    signal.off("requestStatusChange", this.onRequestStatusChange);
    signal.off("standUpRequest", this.onStandUpRequest);
  };

  private onRequestSkin = () => {
    signal.emit("skin", this.player.skin);
  };

  private onSwitchSkin = (skin: string) => {
    this.player.changeSkin(skin);
    server.socket.emit("changedSkin", skin);
  };

  private getSkinForUid = (uid: string) => {
    const player = this.players[uid];
    if (!player) return;

    signal.emit("video-skin", {
      skin: player.skin,
      uid: uid,
    });
  };

  private onRequestStatusChange = (status: PlayerStatus) => {
    if (this.player.getStatus() === status) return;
    this.player.setStatus(status);
    signal.emit("localStatusUpdate", status);
    server.socket.emit("updateStatus", { status });
  };

  private onStandUpRequest = () => {
    this.player.requestStandUp();
  };

  private onPlayerStatusChanged = (data: { uid: string; status: PlayerStatus }) => {
    if (!data) return;
    if (data.uid === this.uid) {
      this.player.setStatus(data.status);
      signal.emit("localStatusUpdate", data.status);
      return;
    }

    const player = this.players[data.uid];
    if (player) {
      player.setStatus(data.status);
    }
  };

  private onDisableInput = (disable: boolean) => {
    this.disableInput = disable;
    this.keysDown = [];
  };

  private onKicked = (message: string) => {
    this.kicked = true;
    this.removeEvents();
    signal.emit("showKickedModal", message);
  };

  private onDisconnect = () => {
    this.removeEvents();
    if (!this.kicked) {
      signal.emit("showDisconnectModal");
    }
  };

  private onMessage = (message: string) => {
    this.player.setMessage(message);
    server.socket.emit("sendMessage", message);
  };

  private onReceiveMessage = (data: any) => {
    const player = this.players[data.uid];
    if (player) {
      player.setMessage(data.message);
    }
  };

  private onOnlinePlayersUpdate = (players: PresencePlayer[]) => {
    this.cachedPresence = players;
    signal.emit("onlinePlayersUpdate", players);
  };

  private onActivityEvent = (activity: ActivityRecord) => {
    // prepend to cache
    this.cachedActivity.unshift(activity);
    if (this.cachedActivity.length > 100) this.cachedActivity.pop();
    signal.emit("activityEvent", activity);
  };

  private displayInitialChatMessage = async () => {
    const authClient = createClient();
    const {
      data: { session },
    } = await authClient.getSession();
    if (!session) return;
    let channelName = "";

    signal.emit("newRoomChat", {
      name: this.realmData.rooms[this.currentRoomIndex].name,
      channelId: channelName,
    });
  };

  private onProximityUpdate = (data: any) => {
    this.proximityId = data.proximityId;
    if (this.proximityId) {
      this.player.checkIfShouldJoinChannel(this.player.currentTilePosition);
    }
  };

  private setUpSocketEvents = () => {
    server.socket.on("playerLeftRoom", this.onPlayerLeftRoom);
    server.socket.on("playerJoinedRoom", this.onPlayerJoinedRoom);
    server.socket.on("playerMoved", this.onPlayerMoved);
    server.socket.on("playerTeleported", this.onPlayerTeleported);
    server.socket.on("playerChangedSkin", this.onPlayerChangedSkin);
    server.socket.on("receiveMessage", this.onReceiveMessage);
    server.socket.on("disconnect", this.onDisconnect);
    server.socket.on("kicked", this.onKicked);
    server.socket.on("proximityUpdate", this.onProximityUpdate);
    server.socket.on("playerStatusChanged", this.onPlayerStatusChanged);
    server.socket.on("onlinePlayersUpdate", this.onOnlinePlayersUpdate);
    server.socket.on("activityEvent", this.onActivityEvent);
  };

  private removeSocketEvents = () => {
    server.socket.off("playerLeftRoom", this.onPlayerLeftRoom);
    server.socket.off("playerJoinedRoom", this.onPlayerJoinedRoom);
    server.socket.off("playerMoved", this.onPlayerMoved);
    server.socket.off("playerTeleported", this.onPlayerTeleported);
    server.socket.off("playerChangedSkin", this.onPlayerChangedSkin);
    server.socket.off("receiveMessage", this.onReceiveMessage);
    server.socket.off("disconnect", this.onDisconnect);
    server.socket.off("kicked", this.onKicked);
    server.socket.off("proximityUpdate", this.onProximityUpdate);
    server.socket.off("playerStatusChanged", this.onPlayerStatusChanged);
    server.socket.off("onlinePlayersUpdate", this.onOnlinePlayersUpdate);
    server.socket.off("activityEvent", this.onActivityEvent);
  };

  private removeEvents = () => {
    this.removeSocketEvents();
    this.destroyPlayers();
    server.disconnect();

    if (this.presenceInterval) {
      clearInterval(this.presenceInterval);
      this.presenceInterval = null;
    }
    if (this.heatmapInterval) {
      clearInterval(this.heatmapInterval);
      this.heatmapInterval = null;
    }

    // Do not destroy the shared ticker globally (the app may reuse it)

    this.removeSignalListeners();
    document.removeEventListener("keydown", this.keydown);
    document.removeEventListener("keyup", this.keyup);
  };

  public destroy() {
    this.removeEvents();
    super.destroy();
  }
}
