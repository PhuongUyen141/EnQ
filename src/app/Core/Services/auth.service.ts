import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from 'src/environments/environment';
import { catchError, concatAll, map, take, tap } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private user: any = null;
  private token: string = null;

  constructor(private httpClient: HttpClient) {
    this.getUserFromLocalStorage();
    this.getTokenFromLocalStorage();
  }

  private getUserFromLocalStorage(): void {
    this.user = JSON.parse(localStorage.getItem('user'));
  }

  private getTokenFromLocalStorage(): void {
    this.token = localStorage.getItem('token');
  }

  public login(userName: string, password: string): Observable<unknown> {
    const $outer = this.httpClient
      .post(API + 'users/admin/login', {
        userName,
        password,
      })
      .pipe(
        take(1),
        tap((res: any) => {
          if (!res.token) {
            throw new Error('Failed to login');
          }
          this.token = res.token;
          localStorage.setItem('token', res.token);
        })
      );

    const $combined = $outer.pipe(
      map((res: any) => this.getAdminUserInfo(res.token)),
      concatAll()
    );

    return $combined;
  }

  private getAdminUserInfo(token: string): Observable<unknown> {
    const httpOptions = {
      headers: new HttpHeaders({
        token,
      }),
    };
    return this.httpClient
      .post(API + 'users/admin/logedin', {}, httpOptions)
      .pipe(
        take(1),
        tap((payload: any) => {
          if (!payload) {
            throw new Error('Failed to get user');
          }
          this.user = payload.data;
          localStorage.setItem('user', JSON.stringify(payload.data));
        })
      );
  }

  get getUser(): any {
    return this.user;
  }

  get getToken(): string {
    return this.token;
  }
}