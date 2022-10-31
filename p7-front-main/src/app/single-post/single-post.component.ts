import { Component, OnInit } from '@angular/core';
import { post } from '../models/post.model';
import { postsService } from '../services/posts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, EMPTY, map, Observable, of, switchMap, take, tap } from 'rxjs';
import { User } from '../models/user.model';

@Component({
  selector: 'app-single-post',
  templateUrl: './single-post.component.html',
  styleUrls: ['./single-post.component.scss']
})
export class SinglepostComponent implements OnInit {

  loading!: boolean;
  post$!: Observable<post>;
  userId!: string;
  likePending!: boolean;
  liked!: boolean;
  disliked!: boolean;
  errorMessage!: string;
  getUser! : User;

  constructor(private posts: postsService,
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router) { }

  ngOnInit() {
    this.userId = this.auth.getUserId();

       this.auth.getUSerById(this.userId)
       .subscribe(
         (response) => {                           
           this.getUser = response; 
         },
         (error) => {                             
           console.error('Request failed with error')
           this.errorMessage = error;
           this.loading = false;
         },
         () => {                                  
           console.error('Request completed')
           this.loading = false; 
         })


    
    
    this.loading = true;
    this.post$ = this.route.params.pipe(
      map(params => params['id']),
      switchMap(id => this.posts.getpostById(id)),
      tap(post => {
        this.loading = false;
        if (post.usersLiked.find(user => user === this.userId)) {
          this.liked = true;
        } else if (post.usersDisliked.find(user => user === this.userId)) {
          this.disliked = true;
        }
      })
    );

     
  }

  onLike() {
    if (this.disliked) {
      return;
    }
    this.likePending = true;
    this.post$.pipe(
      take(1),
      switchMap((post: post) => this.posts.likepost(post._id, !this.liked).pipe(
        tap(liked => {
          this.likePending = false;
          this.liked = liked;
        }),
        map(liked => ({ ...post, likes: liked ? post.likes + 1 : post.likes - 1 })),
        tap(post => this.post$ = of(post))
      )),
    ).subscribe();
  }

  onDislike() {
    if (this.liked) {
      return;
    }
    this.likePending = true;
    this.post$.pipe(
      take(1),
      switchMap((post: post) => this.posts.dislikepost(post._id, !this.disliked).pipe(
        tap(disliked => {
          this.likePending = false;
          this.disliked = disliked;
        }),
        map(disliked => ({ ...post, dislikes: disliked ? post.dislikes + 1 : post.dislikes - 1 })),
        tap(post => this.post$ = of(post))
      )),
    ).subscribe();
  }

  onBack() {
    this.router.navigate(['/posts']);
  }

  onModify() {
    this.post$.pipe(
      take(1),
      tap(post => this.router.navigate(['/modify-post', post._id]))
    ).subscribe();
  }

  onDelete() {
    this.loading = true;
    this.post$.pipe(
      take(1),
      switchMap(post => this.posts.deletepost(post._id)),
      tap(message => {
        console.log(message);
        this.loading = false;
        this.router.navigate(['/posts']);
      }),
      catchError(error => {
        this.loading = false;
        this.errorMessage = error.message;
        console.error(error);
        return EMPTY;
      })
    ).subscribe();
  }
}