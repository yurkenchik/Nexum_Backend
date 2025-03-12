
export enum PokerSessionEvents {
    PLAYER_CONNECTED = "player-connected",
    PLAYER_DISCONNECTED = "player-disconnected",
    PLAYER_JOINED_TABLE = "player-joined-table",
    PLAYER_LEFT_TABLE = "player-left-table",
    GAME_QUEUE_UPDATED = "game-queue-updated",
    GAME_STARTED = "game-started",
    BET_PLACED = "bet-played",
    DEALER_ALREADY_JOINED = "dealer-already-joined",
    LOBBY_JOINED = "lobby-joined",
    GAME_STATE_RECEIVED = "game-state-received",
}