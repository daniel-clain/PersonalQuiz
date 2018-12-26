import { Injectable } from '@angular/core';
import { Category } from 'src/app/models/category';
import { Observable } from 'rxjs';
import { FirestoreService } from '../firestore/firestore.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private _firestoreService: FirestoreService) { }
  
  get categories$(): Observable<Category[]> {
    return this._firestoreService.dataObservable('categories')
  }

  addNewCategory(category: Category): Promise<any>{
    return this._firestoreService.create('categories', category)
  }

  updateCategory(category: Category): Promise<void>{
    return this._firestoreService.update('categories', category)
  }

  deleteCategory(categoryId: string): Promise<void>{
    return this._firestoreService.delete('categories', categoryId)
  }  

  getCategoryById(id): Promise<Category>{
    return this._firestoreService.getDataById('categories', id)
  }
}
