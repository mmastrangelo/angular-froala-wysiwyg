import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
export declare type ScriptLoaderResponse = {
    script: string;
    loaded: boolean;
    status: string;
    error?: string | Event;
};
/**
 * ScriptLoaderService inserts a script tag into the document containing a script from the specified source.
 */
export declare class ScriptLoaderService {
    private http;
    constructor(http: HttpClient);
    private scripts;
    load(id: string, src: string): Observable<ScriptLoaderResponse>;
    loadWithAuth(id: string, src: string): Observable<ScriptLoaderResponse>;
    unloadScript(id: string): void;
    private initializeScript;
    private loadAndAppendScript;
    getText(url: string, headers: HttpHeaders, params: HttpParams): Observable<string>;
}
