
export const SOCKET_MESSAGES: Record<string, string> = {
    JOIN_LOBBY: "join-lobby",
    ADD_PLAYER_TO_TABLE: "add-player-to-table",
    START_GAME: "start-game",
    HANDLE_PLAYER_ACTION: "handle-player-action",
    JOIN_TABLE: "join-table",
    LEAVE_TABLE: "leave-table",
} as const;