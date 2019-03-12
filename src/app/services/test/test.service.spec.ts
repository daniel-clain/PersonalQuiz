
import { TestBed } from '@angular/core/testing';

import { TestService } from './test.service';
import { Test2Service } from './test2.service';

class Test2ServiceMock extends Test2Service {
  doThing(): string {
    return 'dog';
  }
}

describe('TestService', () => {

  // const service: TestService = new TestService(new Test2ServiceMock);
  let testService: TestService;

  beforeEach( () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Test2Service, useValue: new Test2ServiceMock() }
      ]
    });
    // Inject both the service-to-test and its (spy) dependency
    testService = TestBed.get(TestService);
    console.log('test service' + testService);
  });


  it('should be created', () => {
    const returnVal: string = testService.doTest();
    console.log('returnVal :', returnVal);
    expect(returnVal).toEqual('dog plusTest');
  });
});
