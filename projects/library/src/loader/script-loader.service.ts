import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

declare let document: Document;

export type ScriptLoaderResponse = { script: string, loaded: boolean, status: string, error?: string | Event };

/**
 * ScriptLoaderService inserts a script tag into the document containing a script from the specified source.
 */
@Injectable({
    providedIn: 'root'
})
export class ScriptLoaderService {

    constructor(private http: HttpClient) {}

    private scripts: { [id: string]: boolean } = {};

    public load(id: string, src: string): Observable<ScriptLoaderResponse> {

        if (this.scripts[id]) {
            return of(({ script: id, loaded: true, status: 'Already Loaded' }));
        }

        let script = this.initializeScript(id);
        script.src = src;

        return this.loadAndAppendScript(id, script);
    }

    public loadWithAuth(id: string, src: string): Observable<ScriptLoaderResponse> {

        if (this.scripts[id]) {
            return of(({ script: id, loaded: true, status: 'Already Loaded' }));
        }

        let script = this.initializeScript(id);

        return this.getText(src, new HttpHeaders(), new HttpParams()).pipe(
            switchMap(text => {
                script.innerText = text;
                return this.loadAndAppendScript(id, script);
            })            
        );
    }

    public unloadScript(id: string) {

        document.getElementById("script_" + id)?.remove();
        delete this.scripts[id];
    }

    private initializeScript(id: string): HTMLScriptElement {

        let script = <HTMLScriptElement>document.getElementById("script_" + id); // Don't proliferate script tags on revisits
        if (!script) {
            script = document.createElement('script');
        }

        script.id = "script_" + id;
        script.type = 'text/javascript';

        return script;
    }

    private loadAndAppendScript(id: string, script: HTMLScriptElement): Observable<ScriptLoaderResponse> {

        return new Observable<ScriptLoaderResponse>(subscriber => {

            if (script.src) { // If the script has a URL src, complete the observable when it is loaded; otherwise, assume the source is included as bodycontent and complete immediately
                if ((<any>script).readyState) {  // IE
                    (<any>script).onreadystatechange = () => {
                        if ((<any>script).readyState === "loaded" || (<any>script).readyState === "complete") {
                            (<any>script).onreadystatechange = null;
                            this.scripts[id] = true;
                            subscriber.next({ script: id, loaded: true, status: 'Loaded' });
                            subscriber.complete();
                        }
                    };
                } else {  // Others
                    script.onload = () => {
                        this.scripts[id] = true;
                        subscriber.next({ script: id, loaded: true, status: 'Loaded' });
                        subscriber.complete();
                    };
                }

                script.onerror = err => subscriber.error({ script: id, loaded: false, status: 'Loaded', error: err });
                document.getElementsByTagName('head')[0].appendChild(script);
            } else {
                this.scripts[id] = true;
                subscriber.next({ script: id, loaded: true, status: 'Loaded' });
                subscriber.complete();
            }
        });
    }

    public getText(url: string, headers: HttpHeaders, params: HttpParams): Observable<string> {

        return this.http.get(url, {
                headers: headers,
                observe: 'body',
                responseType: 'text',
                params: params,
            });
    }


}