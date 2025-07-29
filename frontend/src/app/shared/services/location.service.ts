import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Location {
  id: string;
  name: string;
  displayName: string;
  type: string;
  lat: number;
  lng: number;
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  private apiUrl = 'http://localhost:3000'; // Backend API URL

  constructor(private http: HttpClient) {}

  getCounties(): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.apiUrl}/admin/locations/counties`).pipe(
      map(response => response || []),
      catchError(error => {
        console.error('Error fetching counties:', error);
        return of([]);
      })
    );
  }

  getTownsInCounty(countyName: string): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.apiUrl}/admin/locations/towns?county=${encodeURIComponent(countyName)}`).pipe(
      map(response => response || []),
      catchError(error => {
        console.error('Error fetching towns:', error);
        return of([]);
      })
    );
  }

  searchLocations(query: string, county?: string): Observable<Location[]> {
    let url = `${this.apiUrl}/admin/locations/search?query=${encodeURIComponent(query)}`;
    if (county) {
      url += `&county=${encodeURIComponent(county)}`;
    }
    return this.http.get<Location[]>(url).pipe(
      map(response => response || []),
      catchError(error => {
        console.error('Error searching locations:', error);
        return of([]);
      })
    );
  }

  getMarketsInCounty(countyName: string): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.apiUrl}/admin/locations/markets?county=${encodeURIComponent(countyName)}`).pipe(
      map(response => response || []),
      catchError(error => {
        console.error('Error fetching markets:', error);
        return of([]);
      })
    );
  }

  getCoordinates(locationName: string, county?: string): Observable<{ lat: number, lng: number } | null> {
    let url = `${this.apiUrl}/admin/locations/coordinates?location=${encodeURIComponent(locationName)}`;
    if (county) {
      url += `&county=${encodeURIComponent(county)}`;
    }
    return this.http.get<{ lat: number, lng: number } | null>(url).pipe(
      catchError(error => {
        console.error('Error fetching coordinates:', error);
        return of(null);
      })
    );
  }

  getLocationByCoordinates(lat: number, lng: number): Observable<string> {
    return of(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  }
} 