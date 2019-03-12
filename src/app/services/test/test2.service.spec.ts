
import { TestBed } from '@angular/core/testing';

import { Test2Service } from './test2.service';


describe('TestService', () => {

  // const service: TestService = new TestService(new Test2ServiceMock);
  let test2Service: Test2Service;

  beforeEach( () => {
    TestBed.configureTestingModule({});
    // Inject both the service-to-test and its (spy) dependency
    test2Service = TestBed.get(Test2Service);
    console.log('test service' + test2Service);
  });


  it('should be created', () => {
    const returnVal: string = test2Service.doThing();
    console.log('returnVal :', returnVal);
    expect(returnVal).toEqual('cat');
  });

});
