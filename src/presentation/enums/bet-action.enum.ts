
export enum BetAction {
    // CHECK - you don`t raise a bet
    CHECK = "check",
    BET = "bet",
    // RAISE - raise a bet
    RAISE = "raise",
    // FOLD - cancel of the future bets
    FOLD = "fold",
    // CALL - align a bet
    CALL = "call",
    // RE_RAISE - raise of bet amount
    RE_RAISE = "re-raise",
    // CHECK_RAISE - at first you skip you turn, but later you raise an opponent`s bet
    CHECK_RAISE = "check-raise",
    // ALL_IN - you all money you have
    ALL_IN = "all-in",
}