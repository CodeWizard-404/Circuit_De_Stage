import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { Observable } from 'rxjs'; 
import { User } from '../classes/user'; 
import { environment } from '../../environments/environment'; 

@Injectable({ providedIn: 'root' }) // This service is available everywhere in the app.
export class UserService {
  constructor(private http: HttpClient) { } // Sets up the tool for making web requests.

  // Creates a new user by sending their info to the server.
  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users`, user);
  }

  // Updates an existing user’s info on the server.
  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/users/${user.id}`, user);
  }

  // Deletes a user from the server using their ID.
  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/users/${userId}`);
  }

  // Gets a list of all users from the server.
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users`);
  }

  // Gets details of a specific user by their ID from the server.
  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/${userId}`);
  }
}