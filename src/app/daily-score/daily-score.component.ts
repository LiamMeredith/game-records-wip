import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import {
  Game,
  GameAttempts,
  GameRecord,
  OptionValues,
  UserGameAttempts,
} from "../models/smashdle.models";
import { SmashdleService } from "../services/smashdle.service";
import { InsertRecordComponent } from "../insert-record/insert-record.component";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "app-daily-score",
  templateUrl: "./daily-score.component.html",
  styleUrl: "./daily-score.component.scss",
})
export class DailyScoreComponent {
  @ViewChild("insertRecordComponent")
  public insertRecordComponent!: InsertRecordComponent;
  @Input() public games: Game[] = [];
  @Input() public userAttempts: UserGameAttempts[] = [];
  @Input() public userGameRecord!: GameRecord;
  @Output() public userGameRecordChange = new EventEmitter<GameRecord>();

  public localUserAttempts: UserGameAttempts[] = [];

  public attempts: GameAttempts = {};
  public game: Game | null = null;
  public numberOfAttempts = 0;

  constructor(private smashdleService: SmashdleService) {}

  public openModal(): void {
    this.insertRecordComponent.clearValues();
    this.localUserAttempts = [];
  }

  public processText(): void {
    this.localUserAttempts = this.insertRecordComponent.processText();
  }

  public attemptInserted(
    gameAttempt: {
      game: Game;
      attempt: OptionValues[][];
      numberOfAttempts: number;
    } | null,
  ): void {
    if (!gameAttempt) {
      return;
    }

    const { game, attempt, numberOfAttempts } = gameAttempt;
    this.game = game;
    this.attempts[game.name] = attempt;
    this.numberOfAttempts = numberOfAttempts;
  }

  public async insertRecord(): Promise<void> {
    this.localUserAttempts.forEach((userAttempt) => {
      (this.userGameRecord as any)[
        userAttempt.game.name.toLowerCase() + "Attempts"
      ] = userAttempt.numberOfAttempts;
      this.userGameRecord.attemptsPatterns[userAttempt.game.name] =
        userAttempt.attempts;
    });

    const saveRecord$ =
      this.userAttempts.length === 0
        ? this.smashdleService.insertRecord(this.userGameRecord)
        : this.smashdleService.updateRecord(this.userGameRecord);

    this.userGameRecord = await firstValueFrom(saveRecord$);

    document.getElementById("close-button")?.click();

    this.userGameRecordChange.emit(this.userGameRecord);
  }
}
