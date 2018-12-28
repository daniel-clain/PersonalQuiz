import { async, TestBed } from '@angular/core/testing';
import { CategoryManagementComponent } from './category-management.component'
import { CategoryService } from 'src/app/services/category/category.service';
import { Category } from 'src/app/models/category';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const categoryServiceStub = {}

describe('CategoryManagementComponent', () => {
    let fixture; let comp: CategoryManagementComponent; let categoryService;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule],
            declarations: [CategoryManagementComponent],
            providers: [{provide: CategoryService, useValue: categoryServiceStub }]
        });
        fixture = TestBed.createComponent(CategoryManagementComponent);
        comp = fixture.componentInstance;

        // categoryService from the root injector
        categoryService = TestBed.get(CategoryService);
    }))
    describe('selectCategory', () => {

        it('should set the selected category to whats passed into it', () => {
            const testCategory: Category = {id: 'x', value: 'x'}
            comp.selectCategory(testCategory)
            expect(comp.selectedCategory).toEqual(testCategory)           
        })
    })
})