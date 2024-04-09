import { Component } from "@angular/core";
import { AuthService, User } from "@auth0/auth0-angular";
import { Subscription, firstValueFrom } from "rxjs";
import { SmashdleService } from "./services/smashdle.service";
import { Game, GameRecord, UserGameAttempts } from "./models/smashdle.models";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent {
  // Current User stored in the Auth0 library
  public user: User | null = null;
  // Auth0 flag representing if user is authenticated
  public authenticated = false;
  // Available games from Hasura
  public games: Game[] = [];
  // All game records achieve by all today's users'
  public gameRecords: GameRecord[] = [];
  // Selected game record for the current user
  public userGameRecord: GameRecord = new GameRecord();
  // Selected users' attempts for the selected user game record
  public gameAttempts: UserGameAttempts[] = [];
  // Order list of user game attempts
  public ranking: (GameRecord & {
    totalAttempts: number;
    positionLabel: string;
  })[] = [];
  // Rank label for the DOM
  public readonly rankPosition = [
    "First",
    "Second",
    "Third",
    "Fourth",
    "Fifth",
  ];
  // Loader manager to load the fade out properties
  public loading = true;
  // Loader manage to remove the panel from the DOM
  public showLoadingPanel = true;
  // Internal subscription list for un-subscription management
  private subscriptionList: Subscription[] = [];

  constructor(
    public auth: AuthService,
    public smashdleService: SmashdleService,
  ) {
    this.init();
  }

  /**
   * Main initialized functionality that controls the app's main logic and authentication
   */
  public async init(): Promise<void> {
    // Check authentication logic and redirect is required
    this.authenticated = await firstValueFrom(this.auth.isAuthenticated$);

    if (!this.authenticated) {
      this.signIn();
      return;
    }

    // Saving Auth0 token for future usage in the Auth interceptor
    const token = await firstValueFrom(this.auth.getAccessTokenSilently());
    localStorage.setItem("token", token ?? "");

    this.user = (await firstValueFrom(this.auth.user$)) ?? null;
    this.games = (await firstValueFrom(this.smashdleService.getGames())) ?? [];

    this.gameRecords = await firstValueFrom(this.smashdleService.getRecords());
    this.ranking = this.gameRecords.map((gameRecord) => ({
      ...new GameRecord(gameRecord),
      totalAttempts: gameRecord.pokedleAttempts + gameRecord.smashdleAttempts,
      positionLabel: "",
    }));
    this.ranking.sort(
      (gameRecordA, gameRecordB) =>
        gameRecordA.totalAttempts - gameRecordB.totalAttempts,
    );

    this.ranking.forEach((rank, index) => {
      rank.positionLabel = this.rankPosition[index];
    });

    const userGameRecord =
      this.gameRecords.find(
        (gameRecord) => gameRecord.userId === this.user?.sub,
      ) ?? null;
    if (userGameRecord) {
      this.userGameRecord = userGameRecord;
      this.updateAttemptsView();
    }

    this.subscriptionList.push(
      this.auth
        .getAccessTokenSilently()
        .subscribe((token) => localStorage.setItem("token", token ?? "")),
    );

    // Add fade out property
    this.loading = false;
    // Remove loading panel 2500ms (fade out time)
    setTimeout(() => {
      this.showLoadingPanel = false;
    }, 500);
  }

  public updateAttemptsView(): void {
    this.gameAttempts = this.games.map((game) => ({
      game,
      attempts: this.userGameRecord.attemptsPatterns[game.name],
    }));
  }

  public signIn(): void {
    this.auth.loginWithRedirect();
  }

  public logout(): void {
    this.auth.logout();
  }
}
