import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ThirdPartyApisService {

  reqHeader = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'});
  constructor(private http: HttpClient) { }

  getExtensionList(data:any): Observable<any> {
    return this.http.get(environment.yeastar_url + 'extension/list?access_token='+data,{headers : this.reqHeader});
  }
  getTrunkList(data:any): Observable<any> {
    return this.http.get(environment.yeastar_url + 'trunk/list?access_token='+data,{headers : this.reqHeader});
  }
}
