import {Injectable} from "@angular/core";
import {Headers, Http} from "@angular/http";
import {Observable} from "rxjs/Observable";
import {TestRunInfo} from "./model/test-run-info.interface";
import {StompConnection, StompService} from "./stomp.service";
import {TestExecutionEvent} from "./model/test-execution-event.interface";
import {TestSuiteResult} from "./model/test-result.interface";
import {FileService} from "./file.service";
import {ProjectService} from "./project.service";
import {absPath} from "./model/file-response.interface";
import {DateUtil} from "../../utils";
import {SakuliTestSuite} from "./model/sakuli-test-model";

const testUrl = `api/testsuite`;

@Injectable()
export class TestService {

  constructor(private http: Http,
              private files: FileService,
              private project: ProjectService,
              private stomp: StompService) {
  }

  testSuite(path: string): Observable<SakuliTestSuite> {
    return this.http.get(`${testUrl}?path=${path}`)
      .map(r => r.json() as SakuliTestSuite);
  }

  putTestSuite(testSuite: SakuliTestSuite) {
    return this.http.put(
      `${testUrl}`,
      JSON.stringify(testSuite),
      { headers: new Headers({'Content-Type': 'application/json'})}
    ).map(r => r.text());
  }

  run(testSuite: SakuliTestSuite): Observable<TestRunInfo> {
    return this.http.post(`${testUrl}/run`, testSuite)
      .map(r => r.json());
  }

  testRunLogs(processId: string): Observable<TestExecutionEvent> {
    return this.stomp.connect('/api/socket')
      .combineLatest(Observable.of(processId))
      .mergeMap(([conn, pid]: [StompConnection, string]) => {
        return conn.topic<TestExecutionEvent>(`/topic/test-run-info/${pid}`)
      })
      .catch(e => {
        console.warn('Error while fetching logs', e);
        return Observable.empty() as Observable<TestExecutionEvent>;
      })
  }

  testResultsFromLogs(testSuitePath: string): Observable<TestSuiteResult[]> {
    return this.http.get(`${testUrl}/results?path=${testSuitePath}`)
      .map(r => r.json())
  }

  testResultsFromJson(testSuitePath: string): Observable<TestSuiteResult[]> {
    return this.project
      .activeProject()
      .mergeMap(p => this.files.files(`${testSuitePath}/_logs/_json`))
      .mergeMap(files => Observable
        .forkJoin(...files.map(file => this.files.read(absPath(file)))))
      .map(raw => raw.map(JSON.parse.bind(JSON)))

  }

  testResults(testSuitePath: string): Observable<TestSuiteResult[]> {
    return Observable.combineLatest(
      this.testResultsFromLogs(testSuitePath),
      this.testResultsFromJson(testSuitePath)
    ).map(([fromLogs, fromJson]) => ([
        //...fromLogs,
        ...fromJson])
      .sort(DateUtil
        .createComparator(
          (r:TestSuiteResult) => r.startDate,
          DateUtil.Formats.default)
      )
    )
  }

}
