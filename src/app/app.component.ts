import { Component, OnDestroy } from "@angular/core";
import { AuthService, User } from "@auth0/auth0-angular";
import { Subscription, firstValueFrom } from "rxjs";
import { SmashdleService } from "./services/smashdle.service";
import {
  Game,
  GameRecord,
  GameUser,
  UserGameAttempts,
} from "./models/smashdle.models";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent implements OnDestroy {
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
  // All users from HAsura database
  public gameUsers: GameUser[] = [];
  // Selected users' attempts for the selected user game record
  public gameAttempts: UserGameAttempts[] = [];
  // Order list of user game attempts
  public rankings: Record<
    string,
    Record<string, { userName: string; attempts: number; label: string }>
  > = {};
  public rankSorting: { type: string; userIds: string[] }[] = [];
  // Rank label for the DOM
  public readonly rankPosition = [
    "First",
    "Second",
    "Third",
    "Fourth",
    "Fifth",
  ];
  public readonly gameCovers: Record<string, string> = {
    Pokedle:
      "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/db781c2f-75f5-4db4-8e6a-75c2c542f51a/dah6qdl-32014297-e5c7-453c-9b8e-9df9c7b5f7ff.png/v1/fill/w_1024,h_607,q_80,strp/pokemon_gen_1_wallpaper_by_themightybattlesquid_dah6qdl-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NjA3IiwicGF0aCI6IlwvZlwvZGI3ODFjMmYtNzVmNS00ZGI0LThlNmEtNzVjMmM1NDJmNTFhXC9kYWg2cWRsLTMyMDE0Mjk3LWU1YzctNDUzYy05YjhlLTlkZjljN2I1ZjdmZi5wbmciLCJ3aWR0aCI6Ijw9MTAyNCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.BXansCHupA_lJ6EriX1AaDoetnzLbQmRYpcYAP5Yh_k",
    Smashdle:
      "https://assetsio.gnwcdn.com/super-smash-bros-ultimate-review-a-messy-magical-festival-of-video-games-1544191164582.jpg",
  };
  // Loader manager to load the fade out properties
  public loading = true;
  // Loader manage to remove the panel from the DOM
  public showLoadingPanel = true;
  // High number to add at the end of the sorting
  public readonly NO_RANK_POSITION = 1000;
  // Internal subscription list for un-subscription management
  private subscriptionList: Subscription[] = [];

  constructor(
    public auth: AuthService,
    public smashdleService: SmashdleService,
  ) {
    this.init();
  }

  public ngOnDestroy(): void {
    this.subscriptionList.forEach((subscription) =>
      subscription?.unsubscribe(),
    );
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
    this.gameUsers = await firstValueFrom(this.smashdleService.getUsers());

    this.gameRecords = await firstValueFrom(this.smashdleService.getRecords());

    this.updateRanking();

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

  public updateRanking(): void {
    const ranks: Record<
      string,
      Record<string, { userName: string; attempts: number; label: string }>
    > = {};

    const gameAttemptsKeys: { id: string; key: keyof GameRecord }[] = [];

    this.games.forEach((game) => {
      ranks[game.name] = {};
      gameAttemptsKeys.push({
        id: game.name,
        key: (game.name.toLocaleLowerCase() + "Attempts") as keyof GameRecord,
      });
      this.gameUsers.forEach((user) => {
        ranks[game.name][user.userId] = {
          userName: user.userName,
          attempts: this.NO_RANK_POSITION,
          label: "",
        };
      });
    });
    ranks["General"] = {};
    this.gameUsers.forEach((user) => {
      ranks["General"][user.userId] = {
        userName: user.userName,
        attempts: this.NO_RANK_POSITION,
        label: "",
      };
    });

    this.gameRecords.forEach((gameRecord) => {
      let totalAttempts = 0;
      gameAttemptsKeys.forEach(({ id, key }) => {
        const gameAttempt = (gameRecord[key] ?? 0) as number;
        totalAttempts += gameAttempt;
        ranks[id][gameRecord.userId].attempts = gameAttempt;
      });
      ranks["General"][gameRecord.userId].attempts =
        totalAttempts !== 0 ? totalAttempts : this.NO_RANK_POSITION;
    });

    this.rankSorting = Object.keys(ranks).map((type) => ({
      type,
      userIds: Object.keys(ranks[type]),
      label: "",
    }));

    this.rankSorting.forEach((rank) => {
      rank.userIds.sort(
        (userA, userB) =>
          ranks[rank.type][userA].attempts - ranks[rank.type][userB].attempts,
      );
      rank.userIds.forEach((userId, index) => {
        const positionRank = ranks[rank.type][userId];
        positionRank.label = this.rankPosition[index];
      });
    });

    this.rankings = ranks;
  }

  public updateAttemptsView(): void {
    this.gameAttempts = this.games.map((game) => ({
      game,
      attempts: this.userGameRecord.attemptsPatterns[game.name],
      numberOfAttempts: (this.userGameRecord as any)[
        game.name.toLowerCase() + "Attempts"
      ],
    }));
    this.updateRanking();
  }

  public signIn(): void {
    this.auth.loginWithRedirect();
  }

  public logout(): void {
    this.auth.logout();
  }
}
