import { Component, EventEmitter, Input, Output } from "@angular/core";
import {
  Game,
  GameRecord,
  OptionValues,
  emojiValues,
  optionValuesIconConversion,
} from "../models/smashdle.models";

@Component({
  selector: "app-insert-record",
  templateUrl: "./insert-record.component.html",
  styleUrl: "./insert-record.component.scss",
})
export class InsertRecordComponent {
  @Input() public games: Game[] = [];
  @Input() public userGameRecord!: GameRecord;
  @Output() attemptInserted = new EventEmitter<{
    game: Game;
    attempt: OptionValues[][];
    numberOfAttempts: number;
  } | null>();

  public OptionValues = OptionValues;
  public text = "";
  public errorMessage = "";
  public game: Game | null = null;
  public attempt: OptionValues[][] = [];
  public numberOfAttempts = 0;

  public async onPaste() {
    // Change to next cycle to have an updated text
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
    console.log(this.text);

    // Find game in the system
    const game = this.games.find((game) =>
      this.text.includes(game.name.toLocaleLowerCase()),
    );
    if (!game) {
      this.errorMessage = "No game found!";
      return;
    }

    if (this.userGameRecord.attemptsPatterns[game.name]) {
      this.errorMessage = "Game already introduced!";
      return;
    }

    this.game = game;
    this.attempt = this.text
      .split(/\r?\n/)
      .filter((row) => emojiValues.some((emoji) => row.includes(emoji)))
      .map((row, index) => {
        const emojis = row.split("");
        const output: OptionValues[] = [];
        if (index < 5) {
          for (let con = 0; con < emojis.length; con = con + 2) {
            const emoji = emojis[con] + emojis[con + 1];
            output.push(optionValuesIconConversion[emoji] as OptionValues);
            this.numberOfAttempts = index + 1;
          }
        } else {
          output.push(OptionValues.PLUS);
          output.push(emojis[1] as OptionValues);
          this.numberOfAttempts += Number(emojis[1]);
        }

        return output;
      });

    this.attemptInserted.emit({ game: this.game, attempt: this.attempt, numberOfAttempts: this.numberOfAttempts });
  }

  public clearValues(): void {
    this.errorMessage = "";
    this.text = "";
    this.game = null;
    this.attempt = [];
    this.attemptInserted.next(null);
  }
}
