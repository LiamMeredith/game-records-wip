export class Game {
  public id: string;
  public name: string;
  public url: string;

  constructor(data: any = {}) {
    this.id = data.id;
    this.name = data.name;
    this.url = data.url;
  }
}

export class GameRecord {
  public id: string;
  public userId: string;
  public userName: string;
  public date: Date;
  public attemptsPatterns: Record<string, OptionValues[][]>;
  public pokedleAttempts: number;
  public smashdleAttempts: number;

  constructor(data: any = {}) {
    this.attemptsPatterns = data.attemptsPatterns ?? {};
    this.date = data.date ?? null;
    this.id = data.id ?? "";
    this.pokedleAttempts = data.pokedleAttempts ?? 0;
    this.smashdleAttempts = data.smashdleAttempts ?? 0;
    this.userId = data.userId ?? "";
    this.userName = data.userName ?? "";
  }
}

export class GameUser {
  public userId: string;
  public userName: string;
  public lastSeen: string;

  constructor(data: any = {}) {
    this.userId = data.userId;
    this.userName = data.userName;
    this.lastSeen = data.lastSeen;
  }
}

export type GameAttempts = Record<string, OptionValues[][]>;
export interface UserGameAttempts {
  game: Game;
  attempts: OptionValues[][];
  numberOfAttempts: number;
}

export enum OptionValues {
  GREEN = "green",
  RED = "red",
  YELLOW = "yellow",
  UP = "up",
  DOWN = "down",
  PLUS = "plus",
}

export const emojiValues = ["🟩", "🟥", "🟧", "⬆️", "⬇️", "➕"];

export const optionValuesIconConversion: Record<string, string> = {
  [OptionValues.GREEN]: "🟩",
  [OptionValues.RED]: "🟥",
  [OptionValues.YELLOW]: "🟧",
  [OptionValues.UP]: "⬆️",
  [OptionValues.DOWN]: "⬇️",
  "🟩": OptionValues.GREEN,
  "🟥": OptionValues.RED,
  "🟧": OptionValues.YELLOW,
  "⬆️": OptionValues.UP,
  "⬇️": OptionValues.DOWN,
};
