import { Injectable } from '@angular/core';
import { catchError, mapTo, of, Subject, tap, throwError } from 'rxjs';
import { post } from '../models/post.model';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class postsService {

  posts$ = new Subject<post[]>();

  constructor(private http: HttpClient,
              private auth: AuthService) {}

  getposts() {
    this.http.get<post[]>('http://localhost:3000/api/posts').pipe(
      tap(posts => this.posts$.next(posts)),
      catchError(error => {
        console.error(error.error.message);
        return of([]);
      })
    ).subscribe();
  }

  getpostById(id: string) {
    return this.http.get<post>('http://localhost:3000/api/posts/' + id).pipe(
      catchError(error => throwError(error.error.message))
    );

    
   
  }

  likepost(id: string, like: boolean) {
    return this.http.post<{ message: string }>(
      'http://localhost:3000/api/posts/' + id + '/like',
      { userId: this.auth.getUserId(), like: like ? 1 : 0 }
    ).pipe(
      mapTo(like),
      catchError(error => throwError(error.error.message))
    );
  }

  dislikepost(id: string, dislike: boolean) {
    return this.http.post<{ message: string }>(
      'http://localhost:3000/api/posts/' + id + '/like',
      { userId: this.auth.getUserId(), like: dislike ? -1 : 0 }
    ).pipe(
      mapTo(dislike),
      catchError(error => throwError(error.error.message))
    );
  }

  createpost(post: post, image: File) {
    const formData = new FormData();
    formData.append('post', JSON.stringify(post));
    formData.append('image', image);
    return this.http.post<{ message: string }>('http://localhost:3000/api/posts', formData).pipe(
      catchError(error => throwError(error.error.message))
    );
  }

  modifypost(id: string, post: post, image: string | File) {
    console.log('vous etes dans modif')
    if (typeof image === 'string' || image === null)  {
      return this.http.put<{ message: string }>('http://localhost:3000/api/posts/' + id, post).pipe(
        catchError(error => throwError(error.error.message))
      );
    }
    else {
      const formData = new FormData();
      formData.append('post', JSON.stringify(post));
      formData.append('image', image);
      return this.http.put<{ message: string }>('http://localhost:3000/api/posts/' + id, formData).pipe(
        catchError(error => throwError(error.error.message))
      );
    }
  }

  deletepost(id: string) {
    return this.http.delete<{ message: string }>('http://localhost:3000/api/posts/' + id).pipe(
      catchError(error => throwError(error.error.message))
    );
  }
}
