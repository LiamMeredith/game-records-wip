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

  public attempts: GameAttempts = {};
  public game: Game | null = null;
  public numberOfAttempts = 0;

  constructor(private smashdleService: SmashdleService) {}

  public openModal(): void {
    this.insertRecordComponent.clearValues();
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
    if (!this.game || !this.userGameRecord) {
      return;
    }

    (this.userGameRecord as any)[this.game.name.toLowerCase() + "Attempts"] =
      this.numberOfAttempts;
    this.userGameRecord.attemptsPatterns[this.game.name] =
      this.attempts[this.game.name];

    const saveRecord$ =
      this.userAttempts.length === 0
        ? this.smashdleService.insertRecord(this.userGameRecord)
        : this.smashdleService.updateRecord(this.userGameRecord);

    this.userGameRecord = await firstValueFrom(saveRecord$);

    document.getElementById("close-button")?.click();

    this.userGameRecordChange.emit(this.userGameRecord);
  }
}
