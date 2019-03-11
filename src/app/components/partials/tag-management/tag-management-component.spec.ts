import { async, TestBed } from '@angular/core/testing';
import { TagManagementComponent } from './tag-management.component';
import { TagService } from 'src/app/services/tag/tag.service';
import { Tag } from 'src/app/models/tag';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const tagServiceStub = {};

xdescribe('TagManagementComponent', () => {
  let fixture;
  let comp: TagManagementComponent;
  let tagService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [TagManagementComponent],
      providers: [{ provide: TagService, useValue: tagServiceStub }]
    });
    fixture = TestBed.createComponent(TagManagementComponent);
    comp = fixture.componentInstance;

    // tagService from the root injector
    tagService = TestBed.get(TagService);
  }));
  describe('selectTag', () => {
    it('should set the selected tag to whats passed into it', () => {
      const testTag: Tag = { id: 'x', value: 'x' };
      comp.selectTag(testTag);
      expect(comp.selectedTag).toEqual(testTag);
    });
  });
});
