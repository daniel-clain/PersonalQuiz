
import { TestBed } from '@angular/core/testing';

import { Test2Service } from './test2.service';


xdescribe('TestService', () => {

  // const service: TestService = new TestService(new Test2ServiceMock);
  let test2Service: Test2Service;

  beforeEach( () => {
    TestBed.configureTestingModule({});
    // Inject both the service-to-test and its (spy) dependency
    test2Service = TestBed.get(Test2Service);
    console.log('test service' + test2Service);
  });


  it('doThing should return cat', () => {
    spyOnProperty(test2Service, 'name', 'get').and.returnValue('chicken');
    const returnVal: string = test2Service.doThing();
    console.log('returnVal :', returnVal);
    expect(returnVal).toEqual('cat');
  });

});
