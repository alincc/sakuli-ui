import {Injectable} from '@angular/core';
import {Http, Headers} from "@angular/http";
import {Observable} from "rxjs/Observable";
import {FileResponse, FileWithContent} from "./model/file-response.interface";
import {ActionCreator} from "../ngrx-util/action-creator-metadata";

const projectUrl = '/api/files';

@Injectable()
export class FileService {

  constructor(
    private http: Http
  ) {}

  files(path: string = ''): Observable<FileResponse[]> {
    return this.http
      .get(`${projectUrl}/ls/${path}`)
      .map(r => r.json() as FileResponse[])
      .map(fr => fr
        .sort((a, b) => (a.name.toLowerCase() === b.name.toLowerCase()) ? 0 : (a.name.toLowerCase() < b.name.toLowerCase()) ? -1 : 1)
        .sort((a, b) => (a.directory && b.directory) ? 0 : (!a.directory && b.directory) ? 1 : -1)
      )
  }

  readAllFiles(files: string[] = []): Observable<FileWithContent[]> {
    return Observable.forkJoin(
      ...files.map(file => this.read(file).map(content => ({file, content})))
    )
  }

  read(path: string): Observable<string> {
    return this.http
      .get(`${projectUrl}/${path}`)
      .map(r => r.text())
  }

  write(path: string, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post(`${projectUrl}/${path}/${file.name}`, formData)
      .map(r => r.toString())
  }

  delete(file: string) {
    return this.http
      .delete(`${projectUrl}/${file}`)
      .map(r => r.toString());
  }
}
