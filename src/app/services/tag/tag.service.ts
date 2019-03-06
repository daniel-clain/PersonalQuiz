import { Injectable, OnDestroy } from '@angular/core';
import { Tag, TagFlat } from 'src/app/models/tag';
import { DataService } from '../data/data.service';
import { Observable, Subscriber, Subject, Subscription, SubscribableOrPromise } from 'rxjs';
import { map, take, debounceTime } from 'rxjs/operators';
import { QueryDocumentSnapshot } from 'angularfire2/firestore';
import { CollectionNames } from '../../enums/collection-names-enum';

@Injectable({
  providedIn: 'root'
})
export class TagService {

  tags: Tag[];
  tagUpdates$: Subject<Tag[]> = new Subject();
  tagsDataSubscription: Subscription;
  tagDeletedSubject$: Subject<string> = new Subject();

  tags$: Observable<Tag[]> = Observable.create((subscriber: Subscriber<Tag[]>) => {
    if (!this.tagsDataSubscription) {
      this.setupTagsDataSubscription();
    }
    if (this.tags) {
      subscriber.next(this.tags);
    }
    this.tagUpdates$.subscribe((updatedTags: Tag[]) => {
      subscriber.next(updatedTags);
    });
  });

  constructor(private _dataService: DataService) {}


  private setupTagsDataSubscription() {
    this.tagsDataSubscription = this.getTagsData$().subscribe((tags: Tag[]) => {
      this.tags = tags;
      console.log('tags updated :', this.tags);
      this.tagUpdates$.next(this.tags);
    });
  }


  private getTagsData$(): Observable<Tag[]> {
    return this._dataService.getCollectionData(CollectionNames.Tags)
    .pipe(map((tagsSnapshot: QueryDocumentSnapshot<any>[]) => (
      tagsSnapshot.map((tagSnapshot: QueryDocumentSnapshot<any>) => (
        <Tag>{ id: tagSnapshot.id, ...tagSnapshot.data() }
      ))
    )));
  }
  getTagById(id): Promise<Tag> {
    return new Promise(resolve =>
      this.tags$
      .pipe(
        map((tag: Tag[]) => tag.find((tags: Tag) => tags.id === id)),
        take(1)
      )
      .subscribe((tag: Tag) => resolve(tag))
    );
  }

  add(tag: Tag): Promise<string> {
    const flatTag = this.convertToFlatTag(tag);
    return this._dataService.addToCollection(CollectionNames.Tags, flatTag);
  }
  update(tag: Tag): Promise<void> {
    const flatTag = this.convertToFlatTag(tag);
    return this._dataService.updateInCollection(CollectionNames.Tags, tag.id, flatTag);
  }
  delete(tag: Tag): Promise<void> {
    return this._dataService.deleteFromCollection(CollectionNames.Tags, tag.id)
    .then(() => this.tagDeletedSubject$.next(tag.id));
  }

  convertToFlatTag(tag: Tag): TagFlat {
    return {value: tag.value};
  }


}
