
import { TestBed } from '@angular/core/testing';

import { TestService } from './test.service';
import { Test2Service } from './test2.service';

class Test2ServiceMock extends Test2Service {
  doThing(): string {
    return 'dog';
  }
}

xdescribe('TestService', () => {

  const service: TestService = new TestService(new Test2ServiceMock);


  it('should be created', () => {
    const returnVal: string = service.doTest();
    console.log('returnVal :', returnVal);
    expect(service).toBeTruthy();
  });
});
