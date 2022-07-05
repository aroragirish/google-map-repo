import { HttpErrorResponse } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { ToastrService } from 'ngx-toastr';
import { GeocoderResponse } from './models/geocoder-response.model';
import { GeocodingService } from './services/geocoding.service';

// just an interface for type safety.
interface marker {
lat: number;
lng: number;
label?: string;
draggable: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(
    private geocodingService: GeocodingService,
    private toastr: ToastrService
  ) {}

  @ViewChild(GoogleMap, { static: false }) map: GoogleMap;
  @ViewChild(MapInfoWindow, { static: false }) infoWindow: MapInfoWindow;

  markers: marker[] = [

  ]

  mapZoom = 12;
  mapCenter: google.maps.LatLng;
  markerpos: google.maps.LatLng;
  mapOptions = {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    zoomControl: true,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    maxZoom: 20,
    minZoom: 4,
  };

  markerInfoContent = '';
  markerOptions: google.maps.MarkerOptions = {
    draggable: false,
    animation: google.maps.Animation.DROP,
  };

  geocoderWorking = false;
  geolocationWorking = false;

  address: string;
  formattedAddress?: string | null = null;
  locationCoords?: google.maps.LatLng | null = null;

  get isWorking(): boolean {
    return this.geolocationWorking || this.geocoderWorking;
  }

  mapClicked(event: google.maps.MapMouseEvent) {
    const LatLng: string = `${event.latLng.lat()}, ${event.latLng.lng()}`;
    this.geocodingService.georeversecoding(LatLng).subscribe((data: any) => {
      console.log(data);
      
    this.geocoderWorking = true;
    this.geocodingService
      .getLocation(data.results[0].formatted_address)
      .subscribe(
        (response: GeocoderResponse) => {
          if (response.status === 'OK' && response.results?.length) {
            const location = response.results[0];
            console.log(location);
            const loc: any = location.geometry.location;

            this.locationCoords = new google.maps.LatLng(loc.lat, loc.lng);

            this.markerpos = location.geometry.location;

            setTimeout(() => {
              if (this.map !== undefined) {
                this.map.panTo(location.geometry.location);
              }
            }, 500);

            this.address = location.formatted_address;
            this.formattedAddress = location.formatted_address;
            this.markerInfoContent = location.formatted_address;

            this.markerOptions = {
              draggable: true,
              animation: google.maps.Animation.DROP,
            };
          } else {
            this.toastr.error(response.error_message, response.status);
          }
        },
        (err: HttpErrorResponse) => {
          console.error('geocoder error', err);
        }
      )
      .add(() => {
        this.geocoderWorking = false;
      });
    })
  }

  openInfoWindow(marker: MapMarker) {
    this.infoWindow.open(marker);
  }

  getCurrentLocation() {
    this.geolocationWorking = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.geolocationWorking = false;

        const point: google.maps.LatLngLiteral = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        console.log(point)

        this.geocoderWorking = true;
        this.geocodingService
          .geocodeLatLng(point)
          .then((response: GeocoderResponse) => {
            if (response.status === 'OK' && response.results?.length) {
              const value = response.results[0];

              this.locationCoords = new google.maps.LatLng(point);

              this.mapCenter = new google.maps.LatLng(point);
              this.map.panTo(point);

              this.address = value.formatted_address;
              this.formattedAddress = value.formatted_address;
              this.markerInfoContent = value.formatted_address;

              this.markerOptions = {
                draggable: true,
                animation: google.maps.Animation.DROP,
              };
            } else {
              this.toastr.error(response.error_message, response.status);
            }
          })
          .finally(() => {
            this.geocoderWorking = false;
          });
      },
      (error) => {
        this.geolocationWorking = false;

        if (error.PERMISSION_DENIED) {
          this.toastr.error("Couldn't get your location", 'Permission denied');
        } else if (error.POSITION_UNAVAILABLE) {
          this.toastr.error(
            "Couldn't get your location",
            'Position unavailable'
          );
        } else if (error.TIMEOUT) {
          this.toastr.error("Couldn't get your location", 'Timed out');
        } else {
          this.toastr.error(error.message, `Error: ${error.code}`);
        }
      },
      { enableHighAccuracy: true }
    );
  }

  findAddress() {
    if (!this.address || this.address.length === 0) {
      return;
    }

    this.geocoderWorking = true;
    this.geocodingService
      .getLocation(this.address)
      .subscribe(
        (response: GeocoderResponse) => {
          if (response.status === 'OK' && response.results?.length) {
            const location = response.results[0];
            console.log(location);
            const loc: any = location.geometry.location;

            this.locationCoords = new google.maps.LatLng(loc.lat, loc.lng);

            this.markerpos = location.geometry.location;

            setTimeout(() => {
              if (this.map !== undefined) {
                this.map.panTo(location.geometry.location);
              }
            }, 500);

            this.address = location.formatted_address;
            this.formattedAddress = location.formatted_address;
            this.markerInfoContent = location.formatted_address;

            this.markerOptions = {
              draggable: true,
              animation: google.maps.Animation.DROP,
            };
          } else {
            this.toastr.error(response.error_message, response.status);
          }
        },
        (err: HttpErrorResponse) => {
          console.error('geocoder error', err);
        }
      )
      .add(() => {
        this.geocoderWorking = false;
      });
  }

  onMapDragEnd(event: google.maps.MouseEvent) {
    const LatLng: string = `${event.latLng.lat()}, ${event.latLng.lng()}`;
    this.geocodingService.georeversecoding(LatLng).subscribe((data: any) => {
      console.log(data);
      
    this.geocoderWorking = true;
    this.geocodingService
      .getLocation(data.results[0].formatted_address)
      .subscribe(
        (response: GeocoderResponse) => {
          if (response.status === 'OK' && response.results?.length) {
            const location = response.results[0];
            console.log(location);
            const loc: any = location.geometry.location;

            this.locationCoords = new google.maps.LatLng(loc.lat, loc.lng);

            this.markerpos = location.geometry.location;

            setTimeout(() => {
              if (this.map !== undefined) {
                this.map.panTo(location.geometry.location);
              }
            }, 500);

            this.address = location.formatted_address;
            this.formattedAddress = location.formatted_address;
            this.markerInfoContent = location.formatted_address;

            this.markerOptions = {
              draggable: true,
              animation: google.maps.Animation.DROP,
            };
          } else {
            this.toastr.error(response.error_message, response.status);
          }
        },
        (err: HttpErrorResponse) => {
          console.error('geocoder error', err);
        }
      )
      .add(() => {
        this.geocoderWorking = false;
      });
    });
  }
}
