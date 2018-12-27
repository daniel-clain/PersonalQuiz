import { Injectable } from '@angular/core';
import { Category, CategoryFlat } from 'src/app/models/category';
import { DataService } from '../data/data.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { QueryDocumentSnapshot, DocumentReference } from 'angularfire2/firestore';
import { CollectionNames } from 'src/app/models/collection-enum';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private _dataService: DataService) { }

  get categories$(): Observable<Category[]>{
    return this._dataService.getCollectionData(CollectionNames.Categories)
    .pipe(map((categoriesSnapshot: QueryDocumentSnapshot<any>[]) => (
      categoriesSnapshot.map((categorySnapshot: QueryDocumentSnapshot<any>) => (
        <Category>{ id: categorySnapshot.id, ...categorySnapshot.data() }
      ))
    )))
  }

  getCategoryById(id): Promise<Category>{
    return this._dataService.getCollectionDataById(CollectionNames.Categories, id)
  }
  add(category: Category): Promise<string>{    
    const flatCategory = this.convertToFlatCategory(category)
    return this._dataService.addToCollection(CollectionNames.Categories, flatCategory)
  }
  update(category: Category): Promise<void>{
    const flatCategory = this.convertToFlatCategory(category)
    return this._dataService.updateInCollection(CollectionNames.Categories, category.id, flatCategory)
  }
  delete(category: Category): Promise<void>{
    return this._dataService.deleteFromCollection(CollectionNames.Categories, category.id)
  }

  convertToFlatCategory(category: Category): CategoryFlat{
    return {value: category.value}
  }


}
