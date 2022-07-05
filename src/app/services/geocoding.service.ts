import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { GeocoderResponse } from '../models/geocoder-response.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GeocodingService {
  constructor(private http: HttpClient) {}

  geocodeLatLng(location: google.maps.LatLngLiteral): Promise<GeocoderResponse> {
    let geocoder = new google.maps.Geocoder();

    return new Promise((resolve, reject) => {
      geocoder.geocode({ 'location': location }, (results, status) => {
        const response = new GeocoderResponse(status, results);
        resolve(response);
      });
    });
  }

  georeversecoding(LatLng: string) {
    return this.http.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${LatLng}&key=AIzaSyCfJFJA4bzonkKfa4geg2CAv2jwbjfxr5o`)
  }

  getLocation(term: string): Observable<GeocoderResponse> {
    const url = `https://maps.google.com/maps/api/geocode/json?address=${term}&sensor=false&key=AIzaSyCfJFJA4bzonkKfa4geg2CAv2jwbjfxr5o`;
    return this.http.get<GeocoderResponse>(url);
  }

  getLocationByPlaceId(placeId: string) {
    return this.http.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=AIzaSyD6KzAklNI0lRpFqWsn_L7LGxLBV5pNg1U`);
  }
}
