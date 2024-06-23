import { Time } from '@angular/common';
import { Injectable } from '@angular/core';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private db!: IDBDatabase;
  private dbReady: Promise<void>;

  constructor(private userService: UserService) {
    this.dbReady = this.initializeDatabase();
  }

  private initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('tweetApp', 1);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        const userStore = db.createObjectStore('users', { keyPath: 'email' });
        userStore.createIndex('name', 'name', { unique: false });

        const postStore = db.createObjectStore('posts', {
          keyPath: 'id',
          autoIncrement: true,
        });
        postStore.createIndex('userEmail', 'userEmail', { unique: false });

        const followStore = db.createObjectStore('follows', {
          keyPath: 'id',
          autoIncrement: true,
        });
        followStore.createIndex('followerEmail', 'followerEmail', {
          unique: false,
        });
        followStore.createIndex('followingEmail', 'followingEmail', {
          unique: false,
        });
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  private async getDb(): Promise<IDBDatabase> {
    await this.dbReady; // Ensure database is ready
    return this.db;
  }

  async addUser(user: User): Promise<void> {
    const db = await this.getDb();
    const transaction = db.transaction('users', 'readwrite');
    const store = transaction.objectStore('users');
    store.add(user);
  }

  async addPost(post: Post): Promise<void> {
    const db = await this.getDb();
    const transaction = db.transaction('posts', 'readwrite');
    const store = transaction.objectStore('posts');
    store.add(post);
  }

  async getUsersWithFollowerCountAndFollowStatus(
    loggedInUserEmail: string
  ): Promise<User[]> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['users', 'follows'], 'readonly');
      const userStore = transaction.objectStore('users');
      const followStore = transaction.objectStore('follows');

      const usersRequest = userStore.getAll();
      const followsRequest = followStore.getAll();

      usersRequest.onsuccess = function () {
        const allUsers: User[] = usersRequest.result;

        followsRequest.onsuccess = function () {
          const allFollows: Follow[] = followsRequest.result;

          const followerCountMap = new Map();
          const loggedInUserFollowingSet = new Set(); // user is followes by login user
          const loginUsersFollowers = new Set(); // login  user followers

          allFollows.forEach((follow) => {
            if (followerCountMap.has(follow.followingEmail)) {
              followerCountMap.set(
                follow.followingEmail,
                followerCountMap.get(follow.followingEmail) + 1
              );
            } else {
              followerCountMap.set(follow.followingEmail, 1);
            }

            if (follow.followerEmail === loggedInUserEmail) {
              loggedInUserFollowingSet.add(follow.followingEmail);
            }
            if (follow.followingEmail === loggedInUserEmail) {
              loginUsersFollowers.add(follow.followerEmail);
            }
          });

          const usersWithFollowerCountAndFollowStatus = allUsers
            .filter((user) => user.email !== loggedInUserEmail)
            .map((user) => {
              user.followers = followerCountMap.get(user.email) || 0;
              user.thisUserFollowedByLoginedUser = loggedInUserFollowingSet.has(
                user.email
              );
              user.LoginedUserFollowedBythisUser = loginUsersFollowers.has(
                user.email
              );
              return user;
            });

          resolve(usersWithFollowerCountAndFollowStatus);
        };

        followsRequest.onerror = function () {
          reject(followsRequest.error);
        };
      };

      usersRequest.onerror = function () {
        reject(usersRequest.error);
      };
    });
  }

  async addFollower(followerEmail: string, followingEmail: string) {
    const db = await this.getDb();
    const transaction = db.transaction(['follows'], 'readwrite');
    const store = transaction.objectStore('follows');
    const follow: Follow = { followerEmail, followingEmail };
    store.add(follow);
  }

  async getFeed(userEmail: string): Promise<Post[]> {
    const db = await this.getDb();
    const transaction = db.transaction(['follows', 'posts'], 'readonly');
    const followStore = transaction.objectStore('follows');
    const postStore = transaction.objectStore('posts');

    const followsRequest = followStore.index('followerEmail').getAll(userEmail);

    return new Promise<Post[]>((resolve, reject) => {
      followsRequest.onsuccess = () => {
        const followResults: Follow[] = followsRequest.result;
        const feed: Post[] = [];
        const postRequests: Promise<void>[] = [];

        followResults.forEach((follow: Follow) => {
          const postsRequest = postStore
            .index('userEmail')
            .getAll(follow.followingEmail); // Assuming you meant 'followedEmail' instead of 'followerEmail'

          const postRequestPromise = new Promise<void>((resolvePostRequest) => {
            postsRequest.onsuccess = () => {
              feed.push(...postsRequest.result);
              resolvePostRequest();
            };
            postsRequest.onerror = () => {
              resolvePostRequest(); // Resolve to avoid blocking on error
            };
          });

          postRequests.push(postRequestPromise);
        });

        Promise.all(postRequests).then(() => resolve(feed));
      };

      followsRequest.onerror = () => {
        reject([]);
      };
    });
  }

  async listOfEmails(): Promise<string[]> {
    const db = await this.getDb();
    const transaction = db.transaction('users', 'readonly');
    const store = transaction.objectStore('users');
    const request = store.getAll();

    return new Promise<string[]>((resolve, reject) => {
      request.onsuccess = () => {
        const users: User[] = request.result;
        const emails: string[] = users.map((user) => user.email);
        resolve(emails);
      };

      request.onerror = () => {
        reject([]);
      };
    });
  }

  async login(email: string, password: string) {
    const db = await this.getDb();
    const transaction = db.transaction(
      ['users', 'follows', 'posts'],
      'readonly'
    );
    const store = transaction.objectStore('users');
    const follows = transaction.objectStore('follows');
    const posts = transaction.objectStore('posts');

    const userRequest = store.get(email);
    const followersRequest = follows.index('followingEmail').getAll(email);
    const followingsRequest = follows.index('followerEmail').getAll(email);
    const postsRequest = posts.index('userEmail').getAll(email);

    userRequest.onsuccess = () => {
      let user = userRequest.result;

      followersRequest.onsuccess = () => {
        let followers = followersRequest.result.length;

        followingsRequest.onsuccess = () => {
          let followings = followingsRequest.result.length;

          postsRequest.onsuccess = () => {
            let post = postsRequest.result.length;

            let temp: User = {
              email: user.email,
              name: user.name,
              password: user.password,
              followers: followers,
              followings: followings,
              thisUserFollowedByLoginedUser: false,
              LoginedUserFollowedBythisUser: false,
              posts: post,
            };
            this.userService.user.next(temp);
          };
        };
      };
    };
  }

  async getPostByUser(email: string) {
    const db = await this.getDb();
    const transaction = db.transaction('posts', 'readonly');
    const store = transaction.objectStore('posts');
    const request = store.index('userEmail').getAll(email);

    return new Promise<Post[]>((resolve, reject) => {
      request.onsuccess = (event) => {
        const posts: Post[] = (event.target as IDBRequest).result;
        resolve(posts);
      };

      request.onerror = (event) => {
        console.error(
          'Error retrieving posts:',
          (event.target as IDBRequest).error
        );
        reject([]);
      };
    });
  }
}

export interface User {
  name: string;
  email: string;
  password: string;
  followers: number;
  followings: number;
  thisUserFollowedByLoginedUser: boolean;
  LoginedUserFollowedBythisUser: boolean;
  posts: number;
}

export interface Post {
  id?: number;
  userEmail: string;
  content: string;
  timeStemp: Date;
  name: string;
}

export interface Follow {
  id?: number;
  followerEmail: string; // who is follwing
  followingEmail: string; // who is been followed
}
