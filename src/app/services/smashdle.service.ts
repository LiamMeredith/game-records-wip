import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { Game, GameRecord } from "../models/smashdle.models";

@Injectable({
  providedIn: "root",
})
export class SmashdleService {
  constructor(private http: HttpClient) {}

  public getRecords(): Observable<GameRecord[]> {
    return this.http
      .get<GameRecord[]>("https://smashdle-scores.hasura.app/api/rest/records")
      .pipe(
        map((response: any) =>
          response.records.map((gameRecord: any) => new GameRecord({
            ...gameRecord,
            userName: gameRecord.User.userName,
          })),
        ),
      );
  }

  public getGames(): Observable<Game[]> {
    return this.http
      .get<Game[]>("https://smashdle-scores.hasura.app/api/rest/games")
      .pipe(
        map((response: any) =>
          response.games.map((game: any) => new Game(game)),
        ),
      );
  }

  public insertRecord({
    attemptsPatterns,
    pokedleAttempts,
    smashdleAttempts,
  }: GameRecord): Observable<GameRecord> {
    return this.http
      .post("https://smashdle-scores.hasura.app/api/rest/records", {
        object: {
          attemptsPatterns,
          pokedleAttempts,
          smashdleAttempts,
        },
      })
      .pipe(
        map((response: any) => new GameRecord(response.insert_records_one)),
      );
  }

  public updateRecord({
    id,
    attemptsPatterns,
    pokedleAttempts,
    smashdleAttempts,
  }: GameRecord): Observable<any> {
    return this.http
      .post(`https://smashdle-scores.hasura.app/api/rest/records/${id}`, {
        object: {
          attemptsPatterns,
          pokedleAttempts,
          smashdleAttempts,
        },
      })
      .pipe(
        map((response: any) => new GameRecord(response.update_records_by_pk)),
      );
  }

}
